
exports.tenantDatabase = class tenantDatabase{
    database;
    useCases;
    constructor(config){
        this.database = config.database;
        this.useCases = config.tenantConfig
    }
    verifyLogin = async(userInfo) => {
        var username = userInfo["username"]
        var password = userInfo["password"]
        var userType = userInfo["userType"]
        // find the user using the username
        const collec = this.database.collection(this.useCases.login)
        const userObject = await collec.findOne({"username": username})
        if(userObject["password"] == password){
            // authentication successfull
            return true
        } else {
            return false
        }
        
    }

    addServiceTicket = async(serviceTicket) => {
        try {
            if(this.database){
                
                const collection = this.database.collection(this.useCases.addServiceTicket);
                var starting_state = [false,false]
                var progressBar = {}
                for(let i = 1; i < 5; i++) progressBar[i] = starting_state
                console.log(progressBar)
                var document = {
                "tenantID":"Sarang",
                "decription":"",
                "startDate":"",
                "progressStage":1,
                "progressBar":progressBar,
                "endDate":"",
                "images":[],
                "documents":[],
                "title":"",
                "landlordName":"",
                "landlordID":"",
                "id":"testID"
                }
                var landlordID = serviceTicket["landlordID"]
                // get the landlord object ID in the database to add that to the service Ticket ID
                const landlord_object = await this.database.collection("landlord_auth").findOne({landlordID})
                if(landlord_object == null){
                    console.log(`No landlord with id: ${landlordID}`)
                    return false
                }
                document = {landlordRef: landlord_object._id, ...document}
                const result = await collection.insertOne(document);
                console.log('Service Ticket added:', result.insertedId);
                return true
            } else {
                console.log(`Tenant database object not available: ${this.database}`)
                return false
            }
          
        } catch (error) {
          console.error('Error adding document:', error);
          return false
        }
      }
    async updateServiceTicketProgress(serviceTicketID){
        const collection = this.database.collection(this.useCases.updateServiceTicketProgress)
        // find the serviceTicket and check whether both landlord and tenant have confirmed progress
        const serviceTicket = await collection.findOne({id:serviceTicketID})
        if(serviceTicket == null){
            console.log(`Service Ticket with ID: ${serviceTicketID} couldn't be found`)
            return false
        }
        var curStage = serviceTicket['progressStage']
        var progressBar = serviceTicket['progressBar']
        var curLevel = progressBar[curStage]
        if(curLevel[1] == true && curLevel[0] == false){
            // landlord has already approved the curStage
            progressBar[curStage][0] = true
            // current stage of the serviceTicker is completed
            curStage += 1
        } else if (curLevel[1] == false && curLevel[0] == false) {
            // tenant has approved the current stage while landlord hasn't
            progressBar[curStage][0] = true
        } else if(curLevel[0] == true){
            console.log("tenant has already updated the progress for this stage")
            return false
        }

        collection.updateOne({_id:serviceTicket["_id"]},{$set: { progressBar, progressStage: curStage }},(err,result)=>{
            if(err){
                console.log(err)
                return false
            }
        })
        return true
    }

}