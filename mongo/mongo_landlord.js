<<<<<<< HEAD
const bcrypt = require("bcrypt")
const {Notif_AddingServiceTicket,Notif_RegisterLandlordRequest,Notif_UpdateServiceTicket} = require("../models/Notif_Models")
=======
const nodemailer = require('nodemailer')
const bcrypt = require("bcrypt")
const {Notif_UpdateServiceTicket} = require("../models/Notif_Models")
>>>>>>> c921079644e91cf8677dfc016b108defc3b5452e
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
    verifyLogin = async (userinfo,res) => {
        var username = userinfo["username"]
        var password = userinfo["password"]
        // find the user using the username
        const collection = this.database.collection(this.useCases.login)
        const userObject = await collection.findOne({username})
        if(userObject["password"] == password){
            // authentication successfull
            console.log("Successful Login")
            res.status(200).json({userID:userObject._id})
        } else {
            console.log("Incorrect Password")
            res.status(500).json({message:"Incorrect Password"})
        }
    }
    
    async registerLandlord(landlordDetails){
        try{
            const collection = this.database.collection(this.useCases.registerLandlord)   
            var notifications = [] 
            landlordDetails = {notifications,...landlordDetails}
            const result = await collection.insertOne(landlordDetails)
            console.log(`Landlord inserted successfully with id: ${result.insertedId}`)
            return true
        }catch(err){
            console.log(`Error registering landlord ${err}`)
            return false
        }
        
    }

    async getLandlordNotifications(landlordID,res){
        try{
            // get all notifications in a list
<<<<<<< HEAD
            const landlordID =landlordData["landlordID"]
            const collection = this.database.collection(this.useCases.getAllNotifications)
            const landlordObject = await collection.findOne({_id:ObjectId(landlordID)}) //fixed this
            if(landlordObject == null){
=======
            const collection = this.database.collection(this.useCases.getAllNotifications)
            const landlordObject = await collection.findOne({_id:ObjectId(landlordID)})
            if(!landlordObject){
>>>>>>> c921079644e91cf8677dfc016b108defc3b5452e
                let error = `Error retrieving notifications for landlord with ID: ${landlordID}`
                console.log(error)
                res.status(404).json({error})
            }
            const {notifications} = landlordObject
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
                const {
                    unitName,
                    unitNumber,
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
                const result = await unitCollection.insertOne({unitName,unitNumber,
                    buildingRef:ObjectId(buildingID),
                    monthlyRental,
                    landlordRef:ObjectId(userID),
                    images})
                const unitID = result.insertedId
                unitsList = [ObjectId(unitID),...unitsList]
                await buildingCollection.updateOne({_id:ObjectId(buildingID)},{$set:{unitsList}},(err,res)=>{
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

    deleteUnit = async (unitID) => {
        try {
            console.log(unitID)
            const unitCollection = this.database.collection(this.useCases.deleteUnit)
            const unitInfo = await unitCollection.findOne({_id: ObjectId(unitID)})
            if (!unitInfo) {
                console.log(`Unable to find unit with ${unitID} for landlord`)
                return false
            }
            await unitCollection.deleteOne({_id: ObjectId(unitID)}, (err, res) =>{
                if (err) {
                    console.log("Unable to delete Unit")
                }
                else {
                    console.log(`Unit ${unitID} deleted`)
                }
            })
            return true
        }
        catch(err){
            console.log(`Error deleting unit with ID: ${unitID} Error : ${err}`)
            return false
        }

    }

    // Send the info as shown below
    addTenants = async (tenantInfo) => {
        try {
            if(this.database){
                const tenantCollection = this.database.collection(this.useCases.registerTenant);
                const {unitRef,landlordRef, email} = tenantInfo
                while (true) {
                    var plaintext_password = await this.generatePassword();
                    var passwordExists = await tenantCollection.findOne({password:plaintext_password})
                    if (!passwordExists) {
                        break;
                    }
                }
                var username = "test222" // TODO: Need to Change to be more dynamic
                this.sendEmail(email, plaintext_password, username)
                const document = {...tenantInfo,notifications:[],unitRef:ObjectId(unitRef),landlordRef:ObjectId(landlordRef), "password":plaintext_password, "username":username, "lastLoginDate":null}
                const tenantObject = await tenantCollection.insertOne(document)
                const tenantID = tenantObject.insertedId
                const unitCollection = this.database.collection("units")
                await unitCollection.updateOne({_id:ObjectId(unitRef)},{$set:{tenantRef:tenantID}},(err,result)=>{
                    if(err){
                        console.log(`Error updating unit with id ${unitRef} for tenant addition. Error: ${err}`)
                    }
                })
                console.log(`Added tenant with id: ${tenantID}`)
                return true
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
            }
        } 
        catch (error) {
            console.error('Error adding tenant:', error)
            return false
        }
    }

    deleteTenant = async (tenantID, res) => {
        try {
            const unitCollection = this.database.collection(this.useCases.deleteUnit)
            const unitInfo = await unitCollection.findOne({tenantRef: ObjectId(tenantID)})
            if (!unitInfo) {
                console.log(`Unable to find unit with ${tenantID} for landlord`)
                res.json({status:500,message:"Unable to find unit"})
            }
            await unitCollection.deleteOne({_id: unitInfo._id})

            const tenantcollection = this.database.collection(this.useCases.getTenant)
            const tenantInfo = await tenantcollection.findOne({_id:ObjectId(tenantID)})
            if(!tenantInfo) {
                console.log(`Unable to find tenant ${tenantID} for landlord`)
                res.json({status:500,message:"Unable to find tenant"})
            }
            await tenantcollection.deleteOne({_id:ObjectId(tenantID)},(err,result)=>{
                if(err){
                    console.log(`Unable to delete delete with ID: ${tenantID}`)
                    return false
                } else {
                    console.log(`Deleted tenant ${tenantID}`)
                    return true
                }
            })

            res.json({status:200,message:`tenant with ID: ${tenantID} deleted`})
        } catch(err){
            console.log(`Error deleting tenant with ID: ${tenantID} Error : ${err}`)
            return false
        }
    }

    editTenant = async(tenantID, tenantInfo) => {
        try{
            const collection = this.database.collection(this.useCases.updateTenant)
            const tenantObject = await collection.findOne({_id:ObjectId(tenantID)})
            if(tenantObject == null){
                console.log(`Tenant ID: ${tenantID} couldn't be found`)
                return false
            }
            await collection.updateOne({_id:ObjectId(tenantID)},{$set: {...tenantInfo}},(err,result)=>{
                if(err){
                    console.log(err)
                } else {
                    console.log(`Tenant ${tenantID} updated`)
                }
            })
            return true
        }
        catch {
            console.log(`Error Finding tenant ID ${tenantID}, Error: ${error}`)
            return false
        }

    }


    async getTenantInfo(tenantID,res){
        const collection = this.database.collection(this.useCases.getTenant)
        const tenantInfo = await collection.findOne({_id:ObjectId(tenantID)})
        if(!tenantInfo){
            console.log(`Unable to find tenant ${tenantID} for landlord`)
            res.json({status:500,message:"Unable to find tenant"})
        }
        res.json({status:200,tenantInfo})
    }

    
    getPendingST = async (userID, res) => {
        const collection = this.database.collection(this.useCases.getPendingServiceTickets)
        const pendingSTCursor = await collection.find({landlordRef: ObjectId(userID)}).project({images:0,quotationDocument:0})
        var pendingST = []
        while (await pendingSTCursor.hasNext()) {
            const STobj = await pendingSTCursor.next();
            pendingST.push(STobj)
        }
        res.json({status:200, pendingST})
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
            const registrationDate = this.getTodaysDate()
            const buildingObject = {landlordRef:ObjectId(userID),buildingName,address,postalCode,unitsList,registrationDate}
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
            const unitsCursor = await collection.find({buildingRef:ObjectId(buildingID)})
            if(!unitsCursor){
                console.log(`Unable to find database object for building ${buildingID}`)
                res.json({status:500,message:"Error getting building information"})
            }
            const unitsList = []
            while (await unitsCursor.hasNext()) {
                const unitObject = await unitsCursor.next()
                unitsList.push(unitObject)
            }
            // for units in this buildings
            res.json({status:200,unitsList})
        }catch(error){
            console.log(`Error getting building information for building ${buildingID},Error: ${error}`)
            res.json({status:500,message:"Error getting building information"})
        }
    }
    
    // Just need to send ServiceTicketID Info
    updateProgress = async (serviceTicketID,res) => {
        try{
            const collection = this.database.collection(this.useCases.updateServiceTicketProgress)
            // find the serviceTicket and check whether both landlord and tenant have confirmed progress
            const serviceTicket = await collection.findOne({_id:ObjectId(serviceTicketID)})
            if(serviceTicket == null){
                console.log(`Service Ticket with ID: ${serviceTicketID} couldn't be found`)
                res.status(500).json({message:"Service Ticket couldn't be found"})
                return
            }
            var notificationDescription = ""
            var notificationTitle = ""
            var finalStage = 3
            var {progressStage, progressBar, endDate, title, unit, tenantRef, landlordRef} = serviceTicket 
            // progressStage: the stage the ticket is currently on
            // progressBar:  the overall progress handler
            // endDate: the date the service ticket reaches the final progressStage
            var curLevel = progressBar[progressStage] // boolean array [bool,bool] 0 index for tenant, 1 index for landlord
            if(curLevel[1] == false && curLevel[0] == true){
                // landlord has to approve the progress stage first
                progressBar[progressStage][1] = true
                // current stage of the serviceTicket is completed (tenant = true, landlord = true)
                if(progressStage < finalStage){ // if current stage is less than the final stage
                    progressStage += 1
                    notificationDescription = `Progress for Service Ticket: ${title} has been updated, further actions required `
                    notificationTitle = `Service Ticket Progress Update for unit ${unit}`
                } else{
                    // the final stage is completed
                    progressStage += 1
                    endDate = this.getTodaysDate()
                    notificationDescription = `Service Ticket: ${title} for ${unit} was successfully completed on ${endDate}`
                    notificationTitle = `Service Ticket Completion for unit ${unit}`
                    /**TODO: Send notification for feedback */
                }
                
            } else if (curLevel[1] == false && curLevel[0] == false) {
                // both have not updated the service ticket, the serviceTicket remains at currentStage
                progressBar[progressStage][1] = true
                /*TODO: add helpful instructions later based on the progressStage level */
                notificationDescription = `Progress for Service Ticket: ${title} has been updated, further actions required `
                notificationTitle = `Service Ticket Progress Update for unit ${unit}`
            } else if(curLevel[1] == true){
                console.log("Landlord has already updated the progress for this stage")
                res.status(500).json({message:"Landlord has already updated the progress for this stage"})
                return
            }
            const notification = new Notif_UpdateServiceTicket()
            .withDescription(notificationDescription)
            .withTitle(notificationTitle)
            .withCollection(this.recipientCollection)
            .withSenderID(ObjectId(landlordRef))
            .withRecipientID(ObjectId(tenantRef))
            .withCustomAttributes({progressStage})
            .build()
            const result = await notification.send()
            if(!result) res.status(500).json({message:"Notification for updating Service Ticket was not sent!"})
            await collection.updateOne({_id:serviceTicket["_id"]},{$set: { progressBar, progressStage: progressStage, endDate }},(err,result)=>{
                if(err){
                    console.log(err)
                    res.status(500).json({message:"Notification for updating Service Ticket was not sent!"})
                    return
                } else {
                    console.log(`Updated Service Ticket ${serviceTicketID}: ${result}`)
                    res.status(200).json({message:"Update successfull",stepNumber:progressStage})
                    return
                }
            })
        }catch(err){
            console.log(`Error updating Service Ticket progress with ID: ${serviceTicketID} Error: ${err}`)
            return
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
            console.log(serviceTicketUpdate)
            var {serviceTicketID} = serviceTicketUpdate
            const collection = this.database.collection(this.useCases.updateServiceTicketProgress)
            // find the serviceTicket and check whether both landlord and tenant have confirmed progress
            const serviceTicket = await collection.findOne({_id:ObjectId(serviceTicketID)})
            if(serviceTicket == null){
                console.log(`Service Ticket with ID: ${serviceTicketID} couldn't be found`)
                return false
            }
            var notificationDescription = ""
            var notificationTitle = ""
            var {title,
                unit, 
                tenantRef, 
                landlordRef,
                progressStage,
                progressBar} = serviceTicket 
            var {quotationDocument, 
                quotationAmount,  
                // quotationAttachmentPath, 
                // quotationUploadedToBy, 
                // completedBy
            } = serviceTicketUpdate

            notificationDescription = `Quotation for Service Ticket: ${title} has been updated `
            notificationTitle = `Service Ticket Quotation for unit ${unit}`           

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

            progressBar[progressStage][1] = true // now it'll be [[true,true],[false,true],[false,false],[false,false]]

            await collection.updateOne(
                { _id: ObjectId(serviceTicketID) },
                { $set: { quotationDocument, quotationAmount, progressBar } },
            (err,result)=>{
                if(err){
                    console.log(`Error updating service ticket: ${err}`)
                    return false
                } else {
                    console.log(`Updated Quotation of Service Ticket ${serviceTicketID}`)
                    return true
                }
            })
            
        }catch(err){
            console.log(`Error updating Service Ticket quotation with ID: ${serviceTicketID} Error: ${err}`)
            return false
        }
    }
    async submitFeedback(feedbackForm){
        try{
            var {serviceTicketID, ...feedbackObj} = feedbackForm
            const collection = this.database.collection(this.useCases.submitFeedback)
            await collection.updateOne({_id:ObjectId(serviceTicketID)},{$set:{landlordFeedback:feedbackObj}},(err,result)=>{
                if(err){
                    console.log(`Error updating landlord feedback for service ticket with id: ${serviceTicketID}`)
                    return false
                } else{
                    console.log(`Added landlord feedback for ticket with id ${serviceTicketID}`)
                    return true
                }
            })
            return true
        }catch(err){
            console.log(`Error sending feedback for landlord: ${err}`)
        }
    }
    
    getTodaysDate(){
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const year = today.getFullYear();
        return `${day}:${month}:${year}`
    }

<<<<<<< HEAD
    // TODO: reject Quotation
    // TODO: sendNego

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
=======
    generatePassword = async() => {
        var length = 12,
            charset = "@#$&*0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$&*0123456789abcdefghijklmnopqrstuvwxyz",
            password = "";
        for (var i = 0, n = charset.length; i < length; ++i) {
            password += charset.charAt(Math.floor(Math.random() * n));
        }
        return password;
    }

    sendEmail = async(email, password, username) => {
        var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // SSL
            auth: {
              user: 'dylantohdylantoh@gmail.com',
              pass: 'nrclmwinedytorbl'
            }
        });
          
        const info = await transporter.sendMail({
            from: 'dylantohdylantoh@gmail.com',
            to: email,
            subject: 'Tenant Account Created',
            html: `
            <h1>Your Tenant Account has been created successfully</h1>
            <p>Click <a href="http://localhost:3000/">here</a> to log into your account and change your password</p>
            <p>Username: ${username}</p>
            <p>Password: ${password}</p>
            `
            
        });

        console.log(`Email sent to ${email}`);
    }

    // TODO: updateTenant Info (Contact Info, name, image)
    // TODO: landlord register themselves
}
>>>>>>> c921079644e91cf8677dfc016b108defc3b5452e
