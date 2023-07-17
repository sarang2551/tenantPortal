const bcrypt = require("bcryptjs")


exports.landlordDatabase = class landlordDatabase{
    useCases;
    database;
    constructor(config){
        this.database = config.database;
        this.useCases = config.landlordConfig
    }

    verifyLogin = async (userinfo) => {
        var username = userinfo["username"] //use "landlord_1" to test
        var password = userinfo["password"] //use "test123" to test
        // find the user using the username
        const collection = this.database.collection(this.useCases.login)
        const userObject = await collection.findOne({username})
        //updated to hash the input password and compare to the HASHED password stored
        bcrypt.compare(password,userObject["password"],function(error,ismatch) {
            if (error){
                console.log('Error connecting with serveer')
                return false
            } else if (!ismatch){
                console.log("Incorrect Password")
                return false
            } else {
                console.log("Successful Login")
                return true
            }
        })


        // if(userObject["password"] == password){
        //     // authentication successfull
        //     console.log("Successful Login")
        //     return true
        // } else {
        //     console.log("Incorrect Password")
        //     return false
        // }

        //console.log(userObject["password"])
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
    addUnit = async (leaseinfo) => {
        try {
            if(this.database){
                const {unitNumber,
                    buildingID,
                    monthlyRental,
                    userID,
                    images} = leaseinfo
                const unitCollection = this.database.collection(this.useCases.addUnit);
                const buildingCollection = this.database.collection("buildings")
                const buildingObject = await buildingCollection.findOne({_id:ObjectId(buildingID)})
                if(!buildingObject){
                    console.log(`When adding unit no building with ID: ${buildingID} found`)
                    return false
                }
                var {unitsList} = buildingObject
                const result = await unitCollection.insertOne({unitNumber,buildingRef:buildingID,monthlyRental,landlordRef:userID,images})
                const unitID = result.insertedId
                unitsList = [ObjectId(unitID),...unitsList]
                await buildingCollection.updateOne({_id:Object(buildingID)},{$set:{unitsList}},(err,res)=>{
                    if(err){
                        console.log(`Error updating building list when adding unit: ${err}`)
                        return false
                    }
                })
                console.log('Unit added:', unitID);
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
                const collection = this.database.collection(this.useCases.registerTenant);
                var tenantDocs = {
                    "CustomerID": tenantinfo["CustomerID"],
                    "CustomerName": tenantinfo["CustomerName"],
                    "BusinessType": tenantinfo["BusinessType"],
                    "PIN": tenantinfo["PIN"],
                    "BRN": tenantinfo["BRN"],
                    "Address": tenantinfo["Address"], 
                    "PostalCode": tenantinfo["PostalCode"],
                    "Username": tenantinfo["Username"],
                    "Password": tenantinfo["Password"],
                    "Notifications": tenantinfo["Notifications"]
                }

                const result = await collection.insertOne(tenantDocs);
                console.log("Tenant Added")
                return true
            }
        } 
        catch (error) {
            console.error('Error adding document:', error)
            return false
        }
    }

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

    getBuildings = async (userID,res) => {
        const collection = this.database.collection(this.useCases.getBuildingsOwned)
        const buildingCursor = await collection.find({landlordRef:ObjectId(userID)})
        if(!buildingCursor){
            console.log(`No buildings found for landlord: ${userID}`)
            res.send({status:500,message:"No buildings found"})
        }
        var buildingsOwned = []
        while (await buildingCursor.hasNext()) {
            const buildingObject = await buildingCursor.next()
            buildingsOwned.push(buildingObject)
        }
        res.json({status:200,buildings:buildingsOwned})
        return
    }
    async addBuilding(buildingData){
        try{
            const {userID,buildingName, address, postalCode} = buildingData
            var unitsList = [] // start an empty list for units in this building that the landlord might have
            const collection = this.database.collection(this.useCases.addBuilding)
            const buildingObject = {landlordRef:ObjectId(userID),buildingName,address,postalCode,unitsList}
            const result = await collection.insertOne(buildingObject)
            console.log('Building added:', result.insertedId);
            return true
        }catch(error){
            console.log(`Error adding building, Error: ${error}`)
        }
        
    }

    async getBuildingInformation(buildingID,res){
        try{
            const collection = this.database.collection(this.useCases.getBuildingInformation)
            // a list of units for this building
            const buildingObject = await collection.findOne({_id:ObjectId(buildingID)})
            if(!buildingObject){
                console.log(`Unable to find database object for building ${buildingID}`)
                res.json({status:500,message:"Error getting building information"})
            }
            const {unitsList} = buildingObject
            res.json({status:200,unitsList})
        }catch(error){
            console.log(`Error getting building information for building ${buildingID},Error: ${error}`)
            res.json({status:500,message:"Error getting building information"})
        }
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

    async hashPasswords(user_name){
        try{
        const collection = this.database.collection(this.useCases.login)
        const userObject = await collection.findOne({username:user_name})
        //var user_name =use "landlord_1" to test
        var password =userObject["password"] //use "test123" to test
        if (userObject== null){
            console.log(`cant find username ${userObject['username']}`)
        } else{
            console.log('user found')
        }
        const saltRounds  = 5                            //higher the number,more difficult to crack
        bcrypt.genSalt(saltRounds,function (saltError,salt) {
            if(saltError){ //if salting has issues
                console.log("Error salting password")
                throw(saltError)
            } else {
                bcrypt.hash(password,salt,function(hashError, hash){
                    if (hashError){                        // if hashing with declared salt has issues
                        console.log("Error hashing string")
                        throw(hashError)
                    } else {                               //hash and save it to database of user
                        userObject["password"]=hash
                        collection.updateOne({username:userObject["username"]},{$set:{password:hash}})
                        console.log("hash success")
                    }
                })
            }
        })
        return true
    }
    catch(error){
        console.log(`Error hashing password of ${user_name}`)
        return false
    }
}

}
