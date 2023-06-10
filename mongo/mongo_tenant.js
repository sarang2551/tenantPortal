
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
        const collec = this.database.collection(`tenant_auth`)
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
                console.log(serviceTicket)
                const collection = this.database.collection("serviceTickets");

                const document = {
                    "TenantID":"Sarang",
                "Decription":"",
                "startDate":"",
                "progressStage":1,
                "progressBar":{1:[],2:[],3:[],4:[]},
                "endDate":"",
                "images":[],
                "documents":[],
                "title":"",
                "landlordName":"",
                "landlordID":""
                }
                var landlordID = serviceTicket["landlordID"]
                // get the landlord object ID in the database to add that to the service Ticket ID
                console.log(landlordID)
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
    updateServiceTicketProgress(serviceTicketID){
        const collection = this.database.collection(this.tenantConfig.updateServiceTicketProgress)
        // find the serviceTicker and check whether both landlord and tenant have confirmed progress
        const serviceTicket = collection.findOne({id:serviceTickerID})
    }
}