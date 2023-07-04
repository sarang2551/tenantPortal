exports.landlordDatabase = class landlordDatabase{
    useCases;
    database;
    constructor(config){
        this.database = config.database;
        this.useCases = config.landlordConfig
    }
<<<<<<< HEAD
    landlordverifyLogin = async(userInfo) => {
        var landlordusername = userInfo["username"]
        var landlordpassword = userInfo["password"]
        // find the user using the username
        const collection = this.database.collection(this.useCases.login)
        const userObject = await collection.findOne({landlordusername})
        if(userObject["password"] == landlordpassword){
            // authentication successfull
            return true
        } else {
            return false
        }
        
    }
    //Note to sarang: Are we going to use landlord username as their ID? This is for the tenets to attach their units to their landlords via ID


    //TODO: call all serviceticketIDs and put them in a database

    //TODO: create property database AND unit database
=======

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
     
    // TODO: updateProgress
    // TODO: Make sure the password is hashed (Use this: https://coderrocketfuel.com/article/store-passwords-in-mongodb-with-node-js-mongoose-and-bcrypt#store-a-hashed-password-in-the-database)
>>>>>>> 3cebd1b11524dc0a9ba7e7115b672f9ad780fd77
}