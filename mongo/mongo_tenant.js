const {Notif_AddingServiceTicket,Notif_Quotation,Notif_UpdateServiceTicket} = require("../models/Notif_Models")
const assert = require('assert')
const { ObjectId, ObjectID } = require('mongodb')

exports.tenantDatabase = class tenantDatabase{
    database;
    useCases;
    recipientCollection;
    constructor(config){
        this.database = config.database;
        this.useCases = config.tenantConfig
        this.recipientCollection = this.database.collection("landlords")
    }
    verifyLogin = async(userInfo) => {
        try{
            this.assertObjectHasProperties(userInfo,{"username":"string","password":"string"})
            
            var {username, password} = userInfo
            // find the user using the username (username is email and should also be the ID)
            const collection = this.database.collection(this.useCases.login)
            const userObject = await collection.findOne({username})
            if(userObject === null){
                console.log("User not found")
                return false
            }
            if(userObject["password"] == password){
                // authentication successfull
                console.log("Login Successful")
                return true
            } else {
                console.log("Login Unsuccessful")
                return false
            }
        }catch(err){
            console.log(`Error verifing tenant login: ${err}`)
            return false
        }
        
        
    }


    addServiceTicket = async(serviceTicket) => {
        try {
            if(this.database){
                const {userID, tenantName, unit} = serviceTicket
                
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
                const {UnitID} = unitObject
                const notification  = new Notif_AddingServiceTicket()
                .withSenderID(userID)
                .withRecipientID(landlordID)
                .withDescription(`New service ticket for ${UnitID}`)
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
                var starting_state = [false,false]
                var progressBar = []
                for(let i = 1; i < 5; i++) progressBar.push(starting_state)
                progressBar[0][0] = true;
                const date = new Date()
                const startDate = `${date.getDay()}:${date.getMonth()}:${date.getFullYear()}`
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
    async updateServiceTicketProgress(serviceTicketID){
        try{
            // serviceTicketID = ObjectId(serviceTicketID)
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
        .withSenderID(ObjectId(tenantID))
        .withRecipientID(ObjectId(landlordID))
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
            const collection = await this.database.collection(this.useCases.getAllServiceTickets)
            collection.find({tenantRef:ObjectId(id)}).toArray((err,data)=>{
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
    async getAllNotifications(id,res){
        try{
            const collection = await this.database.collection(this.useCases.getAllNotifications)
            collection.find({tenantRef: ObjectId(id)}).toArray((err,data)=>{
                if (err) {
                    console.error('Error finding documents:', err);
                    res.status(500).send(err);
                  }
                res.json({data})
            })
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
            
            const {UnitID} = UnitObject
            if(!UnitID){
                console.log(`Couldn't find UnitID`)
                res.json({status:500,message:"Couldn't find UnitID"})
                return
            }
            console.log(`Sending unit & landlord information`)
            res.json({status:200,tenantObject:{landlordName,UnitID}})
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
    acceptQuotation = async (updateST) => {
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
            var {quotationAcceptanceDate,
                title,
                unit, 
                tenantRef, 
                landlordRef} = serviceTicket 
            var {quotationAcceptedbyTenant} = updateST

            var newDate = new Date()
            const year = newDate.getFullYear();
            const month = String(newDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
            const day = String(newDate.getDate()).padStart(2, '0');
            quotationAcceptanceDate = `${day}-${month}-${year}`
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
            const result = await notification.send()
            if(!result) throw new Error(`Notification for updating Service Ticket ${serviceTicketID} was not sent!`)
            collection.updateOne({_id:serviceTicket["_id"]},{$set: { quotationAcceptedbyTenant: quotationAcceptedbyTenant, quotationAcceptanceDate: quotationAcceptanceDate }},(err,result)=>{
                if(err){
                    console.log(err)
                    return false
                } else {
                    console.log(`Quotation Accepted for ${serviceTicketID}: ${result}`)
                }
            })
            return true
            
        }catch(err){
            console.log(`Error updating Service Ticket Acceptance with ID: ${serviceTicketID} Error: ${err}`)
            return false
        }
    }

    assertObjectHasProperties(obj, properties) {
        for (const prop in properties) {
          assert.ok(obj.hasOwnProperty(prop), `Object is missing property: ${prop}`);
          assert.ok(typeof obj[prop] === properties[prop], `Property '${prop}' is incorrect, expected: ${properties[prop]}, got: ${obj[prop]}`);
        }
      }


          // async registerUnit(data){
    //     try{
    //         // {unitID, buildingID, unitNumber, images, landlordID, tenantID}
    //     const collection = this.database.collection(this.useCases.registerUnit)
        
    //     await collection.insertOne(data,(err,result)=>{
    //         if(err){
    //             console.log(`Unable to registerUnit with ID: ${serviceTicketID}`)
    //             return false
    //         }
    //     })

    //     }catch(err){
    //         console.log(`Error registering unit with ID: ${data["unitID"]} through tenant`)
    //         return false
    //     }
        
    // }

      // async requestRegisterLandlord(notificationData){
    //     try{
    //         // sends a notification to the landlord that the tenant wants to add them
    //         const {landlordID,tenantID,tenantName,unit,monthlyRental} = notificationData
    //         var description = `${tenantName} wants to add you as
    //          landlord for unit ${unit}`
    //          const landlordCollection = this.database.collection(this.useCases.registerLandlord)
    //         const notification = new Notif_RegisterLandlordRequest()
    //         .withTenantName(tenantName)
    //         .withTenantUnit(unit)
    //         .withMonthlyRental(monthlyRental)
    //         .withDescription(description)
    //         .withSenderID(tenantID)
    //         .withRecipientID(landlordID)
    //         .withCollection(landlordCollection)
    //         .build()
    //         return notification.send()
    //     }catch(err){
    //         console.log(`Error registering landlord: ${err}`)
    //         return false
    //     }
    // }   
    
      //Tenant registration
    // async registerTenant(userInfo) {
    //     try {
    //       const collection = this.database.collection(this.useCases.login);
    //       const { username } = userInfo;
    //       const existingTenant = await collection.findOne({ username });
    
    //       if (existingTenant) {
    //         console.log("Tenant already exists.");
    //         return false;
    //       }

    //       const result = await collection.insertOne(userInfo);
    //       console.log("Tenant registered:", result.insertedId);
    //       return true;
    //     } catch (error) {
    //       console.error("Error registering tenant:", error);
    //       return false;
    //     }
    //   }

}