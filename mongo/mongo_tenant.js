const {Notif_AddingServiceTicket,Notif_RegisterLandlordRequest,Notif_UpdateServiceTicket} = require("../models/Notif_Models")

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
        var username = userInfo["username"]
        var password = userInfo["password"]
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

    //Tenant registration
    async registerTenant(userInfo) {
        try {
          const collection = this.database.collection(this.useCases.login);
          const { username } = userInfo;
          const existingTenant = await collection.findOne({ username });
    
          if (existingTenant) {
            console.log("Tenant already exists.");
            return false;
          }

          const result = await collection.insertOne(userInfo);
          console.log("Tenant registered:", result.insertedId);
          return true;
        } catch (error) {
          console.error("Error registering tenant:", error);
          return false;
        }
      }


    addServiceTicket = async(serviceTicket) => {
        try {
            if(this.database){
                const {landlordID, tenantID, tenantName, unit} = serviceTicket
                const notification  = new Notif_AddingServiceTicket()
                .withSenderID(tenantID)
                .withRecipientID(landlordID)
                .withDescription(`Tenant ${tenantName} in unit ${unit} has added a Service Ticket`)
                .withCollection(this.recipientCollection)
                .build()
                notification.send()
                
                // var document = {
                // "tenantID":"Sarang",
                // "decription":"",
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
                // adding default progress parameters
                var STDocument = {...serviceTicket,progressBar,progressStage}
                const landlord_object = await this.database.collection(this.useCases.registerLandlord).findOne({id:landlordID})
                if(landlord_object == null){
                    console.log(`No landlord with id: ${landlordID}`)
                    return false
                }
                STDocument = {landlordRef: landlord_object._id, ...STDocument}
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
            const collection = this.database.collection(this.useCases.updateServiceTicketProgress)
        // find the serviceTicket and check whether both landlord and tenant have confirmed progress
        const serviceTicket = await collection.findOne({id:serviceTicketID})
        if(serviceTicket == null){
            console.log(`Service Ticket with ID: ${serviceTicketID} couldn't be found`)
            return false
        }
        var notificationDescription = ""
        var notificationTitle = ""
        var finalStage = 4
        var {progressStage, progressBar, endDate, title, unit, tenantID, landlordID} = serviceTicket 
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
        .withSenderID(tenantID)
        .withRecipientID(landlordID)
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
            const collection = this.database.collection(this.useCases.deleteServiceTicket)
            await collection.deleteOne({id:serviceTicketID},(err,result)=>{
                if(err){
                    console.log(`Unable to delete Service Ticket with ID: ${serviceTicketID}`)
                    return false
                } else {
                    console.log(`Deleted serviceTicket ${serviceTicketID}`)
                    return true
                }
            })
        }catch(err){
            console.log(`Error deleting Service Ticker with ID: ${serviceTicketID}`)
            return false
        }

    }
    async registerUnit(data){
        try{
            // {unitID, buildingID, unitNumber, images, landlordID, tenantID}
        const collection = this.database.collection(this.useCases.registerUnit)
        
        await collection.insertOne(data,(err,result)=>{
            if(err){
                console.log(`Unable to registerUnit with ID: ${serviceTicketID}`)
                return false
            }
        })

        }catch(err){
            console.log(`Error registering unit with ID: ${data["unitID"]} through tenant`)
            return false
        }
        
    }
    async requestRegisterLandlord(notificationData){
        try{
            // sends a notification to the landlord that the tenant wants to add them
            const {landlordID,tenantID,tenantName,unit,monthlyRental} = notificationData
            var description = `${tenantName} wants to add you as
             landlord for unit ${unit}`
             const landlordCollection = this.database.collection(this.useCases.registerLandlord)
            const notification = new Notif_RegisterLandlordRequest()
            .withTenantName(tenantName)
            .withTenantUnit(unit)
            .withMonthlyRental(monthlyRental)
            .withDescription(description)
            .withSenderID(tenantID)
            .withRecipientID(landlordID)
            .withCollection(landlordCollection)
            .build()
            const result = notification.send()
            // const notification = {
            //     landlordID,
            //     tenantName,
            //     description,
            //     title:"Registration Request",
            //     unit,
            //     notifData,
            //     accepted:false
            // }
            
            
            // const landlordObject = await landlordCollection.findOne({id:landlordID})
            // if(landlordObject == null){
            //     console.log(`Error finding landlord with ID: ${landlordID}`)
            //     return false
            // }
            // var currentNotifications = landlordObject['notifications']
            // var newNotifications = [notification,...currentNotifications]
            // // sending notification
            // landlordCollection.updateOne({id:landlordID},{$set:{notifications:newNotifications}},(err,result)=>{
            //     if(err){
            //         console.log(`Error sending addLandlord notification: ${err}`)
            //         return false
            //     } 
            //     return true
            // })
            return result
        }catch(err){
            console.log(`Error registering landlord: ${err}`)
            return false
        }
        
    }

    // getServiceTickets = async () => {

    // } 

}