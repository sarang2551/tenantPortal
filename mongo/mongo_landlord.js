const {Notif_AddingServiceTicket,Notif_RegisterLandlordRequest,Notif_UpdateServiceTicket} = require("../models/Notif_Models")
const assert = require('assert')
const { ObjectId } = require('mongodb')

exports.landlordDatabase = class landlordDatabase{
    useCases;
    database;
    constructor(config){
        this.database = config.database;
        this.useCases = config.landlordConfig
        this.recipientCollection = this.database.collection("tenants")
    }

    // Only need the username and password
    verifyLogin = async (userinfo) => {
        var username = userinfo["username"]
        var password = userinfo["password"]
        // find the user using the username
        const collection = this.database.collection(this.useCases.login)
        const userObject = await collection.findOne({username})
        if(userObject["password"] == password){
            // authentication successfull
            console.log("Successful Login")
            return true
        } else {
            console.log("Incorrect Password")
            return false
        }
    }

    async getLandlordNotifications(landlordData,res){
        try{
            // get all notifications in a list
            const landlordID = landlordData["landlordID"]
            const collection = this.database.collection(this.useCases.getAllNotifications)
            const landlordObject = await collection.findOne({id:landlordID})
            if(landlordObject == null){
                let error = `Error retrieving notifications for landlord with ID: ${landlordID}`
                console.log(error)
                res.status(404).json({error})
            }
            const notifications = landlordObject['notifications'] || []
            res.status(200).json({notifications})
        }catch(err){
            console.log(`Error getting landlordNotifications: ${err}`)
            res.status(500).json({error:`Server error: ${err}`})
        }
    }

    // Send the info as shown below
    addLease = async (leaseinfo) => {
        try {
            if(this.database){
                const leaseCollection = this.database.collection(this.useCases.addLease);
                // var leaseDoc = {
                //     "LeaseID": userinfo["LeaseID"],
                //     "CustomerID": userinfo["CustomerID"],

                // }
                const lease = await leaseCollection.insertOne(leaseinfo);
                console.log("Lease Added")
                return true
            }
        } 
        catch (error) {
            console.error('Error adding document:', error)
            return false
        }
    }

    // Send the info as shown below
    addTenants = async (tenantinfo) => {
        try {
            if(this.database){
                const tenantCollection = this.database.collection(this.useCases.registerTenant);
                //     var tenantDocs = {
                //     "CustomerID": tenantinfo["CustomerID"],
                //     "CustomerName": tenantinfo["CustomerName"],
                //     "BusinessType": tenantinfo["BusinessType"],
                //     "PIN": tenantinfo["PIN"],
                //     "BRN": tenantinfo["BRN"],
                //     "Address": tenantinfo["Address"], 
                //     "PostalCode": tenantinfo["PostalCode"],
                //     "Notifications": tenantinfo["Notifications"]
                // }        
                const tenantUser = await tenantCollection.insertOne(tenantinfo);
                console.log("Tenant Added")
                return true
            }
        } 
        catch (error) {
            console.error('Error adding document:', error)
            return false
        }
    }

    // No need to send any data
    getPendingST = async () => {
        const collection = this.database.collection(this.useCases.getPendingServiceTickets)
        const pendingSTCursor = await collection.find({ progressStage: { $lt: 4 } })
        var pendingST = []
        while (await pendingSTCursor.hasNext()) {
            const STobj = await pendingSTCursor.next();
            pendingST.push(STobj)
        }
        return pendingST
    }        

    // No need to send any data
    getBuildings = async () => {
        const collection = this.database.collection(this.useCases.getBuildingsOwned)
        const buildingCursor = await collection.find()
        var buildingsOwned = []
        while (await buildingCursor.hasNext()) {
            const buildingObject = await buildingCursor.next()
            buildingsOwned.push(buildingObject)
        }
        return buildingsOwned
    }
    
    // Just need to send ServiceTicketID Info
    updateProgress = async (serviceTicketID) => {
        try{
            console.log(serviceTicketID)
            const collection = this.database.collection(this.useCases.updateServiceTicketProgress)
            // find the serviceTicket and check whether both landlord and tenant have confirmed progress
            const serviceTicket = await collection.findOne({serviceTicketID:serviceTicketID})
            if(serviceTicket == null){
                console.log(`Service Ticket with ID: ${serviceTicketID} couldn't be found`)
                return false
            }
            var notificationDescription = ""
            var notificationTitle = ""
            var finalStage = 4
            var {progressStage, progressBar, endDate, title, unit, tenantRef, landlordRef} = serviceTicket 
            // progressStage: the stage the ticket is currently on
            // progressBar:  the overall progress handler
            // endDate: the date the service ticket reaches the final progressStage
            var curLevel = progressBar[progressStage] // boolean array [bool,bool] 0 index for tenant, 1 index for landlord
            if(curLevel[1] == false && curLevel[0] == true){
                // landlord has to approve the progress stage first
                console.log("First If Statement")
                progressBar[progressStage][1] = true
                // current stage of the serviceTicket is completed (tenant = true, landlord = true)
                if(progressStage < finalStage){ // if current stage is less than the final stage
                    console.log("Update Progress")
                    progressStage += 1
                    notificationDescription = `Progress for Service Ticket: ${title} has been updated, further actions required `
                    notificationTitle = `Service Ticket Progress Update for unit ${unit}`
                } else{
                    // the final stage is completed
                    var newDate = new Date()
                    const year = newDate.getFullYear();
                    const month = String(newDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
                    const day = String(newDate.getDate()).padStart(2, '0');
                    endDate = `${day}-${month}-${year}`
                    notificationDescription = `Service Ticket: ${title} for ${unit} was successfully completed on ${endDate}`
                    notificationTitle = `Service Ticket Completion for unit ${unit}`
                }
                
            } else if (curLevel[1] == false && curLevel[0] == false) {
                // tenant has approved the current stage while landlord hasn't, the serviceTicket remains at currentStage
                progressBar[progressStage][0] = true
                /*TODO: add helpful instructions later based on the progressStage level */
                notificationDescription = `Progress for Service Ticket: ${title} has been updated, further actions required `
                notificationTitle = `Service Ticket Progress Update for unit ${unit}`
            } else if(curLevel[0] == true){
                console.log("tenant has already updated the progress for this stage")
                return false
            }
            const notification = new Notif_UpdateServiceTicket()
            .withDescription(notificationDescription)
            .withTitle(notificationTitle)
            .withCollection(this.recipientCollection)
            .withSenderID(landlordRef)
            .withRecipientID(tenantRef)
            .withCustomAttributes({progressStage})
            .build()
            const result = await notification.send()
            if(!result) throw new Error(`Notification for updating Service Ticket ${serviceTicketID} was not sent!`)
            collection.updateOne({_id:serviceTicket["_id"]},{$set: { progressBar, progressStage: progressStage, endDate }},(err,result)=>{
                if(err){
                    console.log(err)
                    return false
                } else {
                    console.log(`Updated Service Ticket ${serviceTicketID}: ${result}`)
                }
            })
            return true

        }catch(err){
            console.log(`Error updating Service Ticket progress with ID: ${serviceTicketID} Error: ${err}`)
            return false
        }
    }


    // Dont need to send any json object
    getAvailableLease = async () => {
        const leaseCollection = this.database.collection(this.useCases.showLeases)
        const leasesCursor = await leaseCollection.find( {"Status": "Inactive"} )
        var availableLeases = []
        while (await leasesCursor.hasNext()) {
            const leaseObject = await leasesCursor.next()
            availableLeases.push(leaseObject)
        }
        return availableLeases
    }

    // Send serviceTicketID, quotationRequired, quotationAmount, quotationAttachmentPath, quotationUploadedBy, completedBy
    updateQuotation = async(serviceTicketUpdate) => {
        try{
            var serviceTicketID = serviceTicketUpdate["serviceTicketID"]
            const collection = this.database.collection(this.useCases.updateServiceTicketProgress)
            // find the serviceTicket and check whether both landlord and tenant have confirmed progress
            const serviceTicket = await collection.findOne({serviceTicketID:serviceTicketID})
            if(serviceTicket == null){
                console.log(`Service Ticket with ID: ${serviceTicketID} couldn't be found`)
                return false
            }
            var notificationDescription = ""
            var notificationTitle = ""
            var {title,
                unit, 
                tenantRef, 
                landlordRef} = serviceTicket 
            var {quotationRequired, 
                quotationAmount,  
                quotationAttachmentPath, 
                quotationUploadedToBy, 
                completedBy} = serviceTicketUpdate

            notificationDescription = `Quotation for Service Ticket: ${title} has been updated `
            notificationTitle = `Service Ticket Quotation for unit ${unit}`

            console.log(serviceTicketUpdate)
            console.log(serviceTicket)

            

            const notification = new Notif_UpdateServiceTicket()
            .withDescription(notificationDescription)
            .withTitle(notificationTitle)
            .withCollection(this.recipientCollection)
            .withSenderID(landlordRef)
            .withRecipientID(tenantRef)
            .withCustomAttributes()
            .build()
            const result = await notification.send()
            if(!result) throw new Error(`Notification for updating Service Ticket ${serviceTicketID} was not sent!`)
            collection.updateOne({serviceTicketID:serviceTicket["serviceTicketID"]},{$set: { quotationRequired: quotationRequired, quotationAmount: quotationAmount, quotationAttachmentPath: quotationAttachmentPath, quotationUploadedBy: quotationUploadedToBy, completedBy: completedBy }},(err,result)=>{
                if(err){
                    console.log(err)
                    return false
                } else {
                    console.log(`Updated Quotation of Service Ticket ${serviceTicketID}: ${result}`)
                }
            })
            return true
            
        }catch(err){
            console.log(`Error updating Service Ticket quotation with ID: ${serviceTicketID} Error: ${err}`)
            return false
        }
    }

    // TODO: reject Quotation
    // TODO: sendNego
}