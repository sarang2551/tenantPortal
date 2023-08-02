const {Notif_AddingServiceTicket,Notif_Quotation,Notif_UpdateServiceTicket} = require("../models/Notif_Models")
const assert = require('assert')
const { ObjectId } = require('mongodb')

exports.tenantDatabase = class tenantDatabase{
    database;
    useCases;
    recipientCollection;
    constructor(config){
        this.database = config.database;
        this.useCases = config.tenantConfig
        this.recipientCollection = this.database.collection("landlords")
    }
    verifyLogin = async(userInfo,res) => {
        try{
            this.assertObjectHasProperties(userInfo,{"username":"string","password":"string"})
            
            var {username, password} = userInfo
            // find the user using the username (username is email and should also be the ID)
            const collection = this.database.collection(this.useCases.login)
            const userObject = await collection.findOne({username})
            if(userObject === null){
                console.log("User not found")
                res.status(500).json({message:"User not found"})
            }
            if(userObject["password"] == password){
                // authentication successfull
                console.log("Login Successful")
                var firstLogin = true // if first login then redirect to change password page
                if(userObject.lastLoginDate !== undefined){
                    firstLogin = false
                    const lastLoginDate = this.getTodaysDate()
                    await collection.updateOne({_id:userObject._id},{$set:{lastLoginDate}},(err,result)=>{
                        if(err){
                            console.log(`Error updating last login date ${err}`)
                            res.status(500).json({message:"Error updating last login date"})
                        } 
                    })
                }
                res.status(200).json({userID:userObject._id, firstLogin,tenantName:userObject.tenantName})
                
            } else {
                console.log("Password did not match")
                res.status(500).json({message:"Password did not match"})
                
            }
        }catch(err){
            console.log(`Error verifing tenant login: ${err}`)
            return false
        }
        
    }

    async changePassword(data){
        try{
            const {password,userID} = data
            const today = new Date();
            const day = String(today.getDate()).padStart(2, '0');
            const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
            const year = today.getFullYear();
            const lastLoginDate = `${day}:${month}:${year}` // only add this attribute when first password is changed
            const collection = this.database.collection(this.useCases.changePassword)
            /**TODO: Hash password here */
            await collection.updateOne({_id:ObjectId(userID)},{$set:{password, lastLoginDate}},async(err,result)=>{
                if(err){
                    console.log(`Error updating password: ${err}`)
                }
                else{
                    console.log(`Password changed successfully for user ${userID}`)
                    return true
                }
            })
        }catch(err){
            console.log(`Error changing password. Error: ${err}`)
            return false
        }
    }


    addServiceTicket = async(serviceTicketData) => {
        try {
            if(this.database){
                const {userID,...serviceTicket} = serviceTicketData
                
                const tenant_object = await this.database.collection("tenants").findOne({_id:ObjectId(userID)})
                if(tenant_object == null){
                    console.log(`No tenant with id: ${userID}`)
                    return false
                }
                const landlordID = tenant_object.landlordID
                const unitID = tenant_object.unitID
                const landlord_object = await this.database.collection("landlords").findOne({_id:ObjectId(ObjectId(landlordID))})
                if(landlord_object == null){
                    console.log(`No landlord with id: ${landlordID}`)
                    return false
                }
                const unitObject = await this.database.collection("units").findOne({_id:unitID})
                const {unitNumber} = unitObject
                const notification  = new Notif_AddingServiceTicket()
                .withSenderID(userID)
                .withRecipientID(landlordID)
                .withDescription(`New service ticket for ${unitNumber}`)
                .withCollection(this.recipientCollection)
                .build()
                notification.send()
                
                // var document = {
                // "tenantID":"Sarang",
                // "description":"",
                // "startDate":"",
                // "progressStage":1,
                // "progressBar":progressBar,
                // "endDate":"", // needs to be updated later
                // "images":[],
                // "documents":[],
                // "title":"",
                // "landlordName":"",
                // "landlordID":"",
                // "id":"testID",
                // "unitID":""
                // }
                // get the landlord object ID in the database to add that to the service Ticket ID
                const collection = this.database.collection(this.useCases.addServiceTicket);

                const progressStage = 0
                // Processing request, Accept/Reject Quotation, Work in Progress, Feedback
                var progressBar = [[true,false],[false,false],[false,false],[false,false]]
                const startDate = this.getTodaysDate()
                // adding default parameters
                var STDocument = {...serviceTicket,progressBar,progressStage,startDate}

                STDocument = {landlordRef: landlordID, tenantRef: ObjectId(userID),unitID,...STDocument}
                const result = await collection.insertOne(STDocument);
                console.log('Service Ticket added:', result.insertedId);
                return true
            } else {
                console.log(`Tenant database object not available: ${this.database}`)
                return false
            }
          
        } catch (error) {
          console.error('Error adding service ticket:', error)
          return false
        }
      }
    async updateServiceTicketProgress(serviceTicketID,res){
        try{
            // serviceTicketID = ObjectId(serviceTicketID)
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
        const landlordID = ObjectId(landlordRef)
        const tenantID = ObjectId(tenantRef)
        // progressStage: the stage the ticket is currently on
        // progressBar:  the overall progress handler
        // endDate: the date the service ticket reaches the final progressStage
        var curLevel = progressBar[progressStage] // boolean array [bool,bool] 0 index for tenant, 1 index for landlord
        if(curLevel[1] == true && curLevel[0] == false){
            // landlord has already approved the progressStage (now to update on tenant side)
            progressBar[progressStage][0] = true
            // current stage of the serviceTicket is completed (tenant = true, landlord = true)
            if(progressStage < finalStage){ // if current stage is less than the final stage
                progressStage += 1
            } else{
                // the final stage is completed
                progressStage += 1
                endDate = this.getTodaysDate()
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
            res.status(500).json({message:"Tenant has already updated the progress for this stage"})
            return
        }
        const notification = new Notif_UpdateServiceTicket()
        .withDescription(notificationDescription)
        .withTitle(notificationTitle)
        .withCollection(this.recipientCollection)
        .withSenderID(tenantID)
        .withRecipientID(landlordID)
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
                console.log(`Updated Service Ticket ${serviceTicketID}`)
                res.status(200).json({message:"Update successfull",stepNumber:progressStage})
                return
            }
        })

        }catch(err){
            console.log(`Error updating Service Ticket progress with ID: ${serviceTicketID} Error: ${err}`)
            return
        }
        
    }
    async deleteServiceTicket(serviceTicketID){
        try{
            serviceTicketID = ObjectId(serviceTicketID)
            const collection = this.database.collection(this.useCases.deleteServiceTicket)
            await collection.deleteOne({_id:serviceTicketID},(err,result)=>{
                if(err){
                    console.log(`Unable to delete Service Ticket with ID: ${serviceTicketID}`)
                    return false
                } else {
                    console.log(`Deleted serviceTicket ${serviceTicketID}`)
                    return true
                }
            })
        }catch(err){
            console.log(`Error deleting Service Ticker with ID: ${serviceTicketID} Error : ${err}`)
            return false
        }

    }
    async getAllServiceTickets(id,res){
        try{
            const collection = this.database.collection(this.useCases.getAllServiceTickets)
            await collection.find({tenantRef:ObjectId(id)}).project({images:0,quotationDocument:0}).toArray((err,data)=>{
                if (err) {
                    console.error('Error finding documents:', err);
                    res.status(500).send(err);
                  }
                res.send(data)
            })
            
        }catch(error){
            console.log(`Error getting all service tickets for tenant: ${id} Error: ${error}`)
            res.status(500).json(error)
        }
    }
    async getSTForPieChart(userID,res){
        try{
            const collection =  this.database.collection(this.useCases.getAllServiceTickets)
            await collection.aggregate([
                {
                    $match: {
                      tenantRef: ObjectId(userID)
                    }
                  },
                {
                  $group: {
                    _id: "$progressStage",
                    count: { $sum: 1 }
                  }
                },
                {
                  $project: {
                    progressStage: "$_id",
                    count: 1,
                    _id: 0
                  }
                }
              ]).toArray(function (err, result) {
                if (err) {
                    console.log(`Error sending pie chart data: ${err}`)
                    res.json({status:500,message:"Error getting pieChart data"})
                } else {
                    res.send(result)
                }
              });;
            // [{ progressStage: 0, count: 1 },{ progressStage: 2, count: 1 }]
            
        }catch(err){
            console.log(`Error sending pie chart data: ${err}`)
            res.json({status:500,message:"Error getting pieChart data"})
        }
    }
    async getAllNotifications(id,res){
        try{
            const collection = this.database.collection(this.useCases.getAllNotifications)
            const tenantObject = await collection.findOne({_id:ObjectId(id)})
            if(!tenantObject){
                console.log(`Unable to get all notifications for tenant ${id}`)
                res.status(500).json(error)
            }
            const {notifications} = tenantObject
            res.status(200).send(notifications)
        }catch(error){
            console.log(`Error getting all notifications for tenant: ${id} Error: ${error}`)
            res.status(500).json(error)
        }
    }

    async getUnitData(userID,res){
        try{
            const userObject = await this.database.collection("tenants").findOne({_id:ObjectId(userID)})
            if(!userObject){
                console.log(`Couldn't get unitData for ${userID} because it doesn't exist`)
                res.json({status:500,message:"Couldn't find user"})
            }
            const unitID = userObject.unitID;
            const unitObject = await this.database.collection(this.useCases.getUnitData).findOne({_id:unitID})
            if(!unitObject){
                console.log(`Couldn't find unit ${unitID} for user ${userID}`)
                res.json({status:500,message:"Couldn't find unit "})
            }
            console.log(`Sending unitData for unit ${unitID}`)
            res.json({status:200,unitData:unitObject})
        }catch(err){
            res.json({status:500, message:err})
        }
    }

    async getUnitAndLandlordData(userID,res){
        try{
            const collection = this.database.collection(this.useCases.getUnitAndLandlordData)
            const tenant_object = await collection.findOne({_id:ObjectId(userID)})
            if(!tenant_object){
                console.log(`Tenant with ID: ${userID} doesnt exist`)
                res.json({status:500,message:"Tenant doesn't exist"})
            }
            const {landlordID, unitID} = tenant_object
            const landlordObject = await this.database.collection("landlords").findOne({_id:landlordID})
            const {landlordName} = landlordObject
            if(!landlordName){
                console.log(`Couldn't find landlord name`)
                res.json({status:500,message:"Couldn't find landlord name"})
                return
            }
            const UnitObject = await this.database.collection("units").findOne({_id:unitID})
            
            const {unitName} = UnitObject
            if(!unitName){
                console.log(`Couldn't find UnitID`)
                res.json({status:500,message:"Couldn't find UnitID"})
                return
            }
            console.log(`Sending unit & landlord information`)
            res.json({status:200,tenantObject:{landlordName,unitName}})
        }catch(error){
            console.log(`Error getting unit and landlord data for user: ${userID}`)
            res.json({status:500,message:error})
        }
    }


    // Just need to send serviceTicketID and Feedback json
    updateFeedback = async (updateST) => {
        try{
            const collection = this.database.collection(this.useCases.updateServiceTicketProgress)
            // find the serviceTicket and check whether both landlord and tenant have confirmed progress
            var serviceTicketID = updateST["serviceTicketID"]
            const serviceTicket = await collection.findOne({serviceTicketID:serviceTicketID})
            if(serviceTicket == null){
                console.log(`Service Ticket with ID: ${serviceTicketID} couldn't be found`)
                return false
            }
            
            var notificationDescription = ""
            var notificationTitle = ""
            var {title,
                unit, 
                tenantID, 
                landlordID} = serviceTicket
            var {feedbackRating} = updateST
                
            notificationDescription = `Feedback for Service Ticket: ${title} has been updated `
            notificationTitle = `Service Ticket Feedback for unit ${unit}`

            const notification = new Notif_UpdateServiceTicket()
            .withDescription(notificationDescription)
            .withTitle(notificationTitle)
            .withCollection(this.recipientCollection)
            .withSenderID(ObjectId(tenantID))
            .withRecipientID(ObjectId(landlordID))
            .withCustomAttributes({feedbackRating})
            .build()
            const result = await notification.send()
            if(!result) throw new Error(`Notification for updating Service Ticket ${serviceTicketID} was not sent!`)
            collection.updateOne({"serviceTicketID":serviceTicketID},{$set: { feedbackRating: feedbackRating }},(err,result)=>{
                if(err){
                    console.log(err)
                    return false
                } else {
                    console.log(`Updated Service Ticket Feedback ${serviceTicketID}: ${result}`)
                }
            })
            return true
            
        }catch(err){
            console.log(`Error updating Service Ticket Feedback with ID: ${serviceTicketID} Error: ${err}`)
            return false
        }
    }

    // Just need to send serviceTicketID and quotationAcceptedbyTenant
    updateQuotation = async (updateST) => {
        console.log(updateST)
        try{
            const {userID,serviceTicketID,quotationAcceptance} = updateST
            const collection = this.database.collection(this.useCases.updateServiceTicketProgress)
            // find the serviceTicket and check whether both landlord and tenant have confirmed progress
            const serviceTicket = await collection.findOne({_id:ObjectId(serviceTicketID)})
            if(serviceTicket == null){
                console.log(`Service Ticket with ID: ${serviceTicketID} couldn't be found`)
                return false
            }
            var notificationDescription = ""
            var notificationTitle = ""
            var {
                title,
                unit, 
                tenantRef, 
                landlordRef,
                progressBar,
                progressStage
            } = serviceTicket 
            var quotationAcceptanceDate = this.getTodaysDate()
            if(quotationAcceptance == true){
                // landlord has already submitted a quotation and progress stage will be increased
               
                notificationDescription = `Service Ticket: ${title} for ${unit} was successfully accepted on ${quotationAcceptanceDate}`
                notificationTitle = `Quotation Acceptance for unit ${unit}`
                
                const notification = new Notif_UpdateServiceTicket()
                .withDescription(notificationDescription)
                .withTitle(notificationTitle)
                .withCollection(this.recipientCollection)
                .withSenderID(tenantRef)
                .withRecipientID(landlordRef)
                .withCustomAttributes({})
                .build()
                const result = notification.send()
                if(!result) throw new Error(`Notification for updating Service Ticket ${serviceTicketID} was not sent!`)

                progressBar[progressStage][0] = true // now it'll be [[true,true],[true,true],[false,false],[false,false]]
                progressStage += 1 // progressStage 2 (3 on UI) now

                await collection.updateOne({_id:ObjectId(serviceTicketID)},
                {$set: {quotationAcceptanceDate, progressBar, progressStage }},(err,result)=>{
                    if(err){
                        console.log(err)
                        return false
                    } else {
                        console.log(`Quotation Accepted for ${serviceTicketID}`)
                        return true
                    }
                })
                return true
            } else {
                // reject the quotation and remove the quotationAmount and quotationDocument attribute from the service ticket object
                notificationDescription = `Service Ticket: Quotation for ticket: ${title} for ${unit} was rejected on ${quotationAcceptanceDate}`
                notificationTitle = `Quotation Rejected for unit ${unit}`

                const notification = new Notif_UpdateServiceTicket()
                .withCollection(this.recipientCollection)
                .withTitle(notificationTitle)
                .withDescription(notificationDescription)
                .withRecipientID(landlordRef)
                .withSenderID(tenantRef)
                .build()
                const result = notification.send()
                if(!result) throw new Error(`Notification for rejecting quotation for serviceTicketID: ${serviceTicketID} , was not sent!`)
                
                // progressStage remains at 1 (2 at UI)
                progressBar[progressStage][1] = false  // now it'll be [[true,true],[false,false],[false,false],[false,false]]

                await collection.updateOne({_id:ObjectId(serviceTicketID)},
                {$unset:{quotationDocument:null,quotationAmount:null},$set:{progressBar}},
                (err,result)=>{
                    if(err){
                        console.log(`Error updating service ticket object when rejecting quotation ${err}`)
                        return false
                    } else {
                        console.log(`Quotation Rejected for ${serviceTicketID}`)
                        return true
                    }
                })
            }
            
            
        }catch(err){
            console.log(`Error updating Service Ticket Acceptance: Error: ${err}`)
            return false
        }
    }
    
    async submitFeedback(feedbackForm){
        try{
            var {serviceTicketID, ...feedbackObj} = feedbackForm
            const collection = this.database.collection(this.useCases.submitFeedback)
            await collection.updateOne({_id:ObjectId(serviceTicketID)},{$set:{tenantFeedback:feedbackObj}},(err,result)=>{
                if(err){
                    console.log(`Error updating tenant feedback for service ticket with id: ${serviceTicketID}`)
                    return false
                } else{
                    console.log(`Added tenant feedback for ticket with id ${serviceTicketID}`)
                    return true
                }
            })
            return true
        }catch(err){
            console.log(`Error sending feedback for tenant: ${err}`)
        }
    }

    getTodaysDate(){
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const year = today.getFullYear();
        return `${day}:${month}:${year}`
    }

    assertObjectHasProperties(obj, properties) {
        for (const prop in properties) {
          assert.ok(obj.hasOwnProperty(prop), `Object is missing property: ${prop}`);
          assert.ok(typeof obj[prop] === properties[prop], `Property '${prop}' is incorrect, expected: ${properties[prop]}, got: ${obj[prop]}`);
        }
      }


}