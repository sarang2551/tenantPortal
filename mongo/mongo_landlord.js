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
        const bcrypt = require("bcryptjs")
        // find the user using the username
        const collection = this.database.collection(this.useCases.login)
        const userObject = await collection.findOne({username})
        //updated to hash the input password and compare to the HASHED password stored
        bcrypt.compare(password,userObject["passwordhash"],function(error,ismatch) {
            if (error){
                throw error
            } else if (!ismatch){
                console.log("Incorrect Password")
            } else {
                console.log("Successful Login")
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

        //console.log(userObject["password"])//this is not retrieving anything
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
    // NOTE use (npm i) to install new bcrypt package
    hashPasswords = async (userinfo) =>{
        var username = userinfo["username"] //use "landlord_1" to test
        var password = userinfo["password"] //use "test123" to test
        const bcrypt = require("bcryptjs")
        const collection = this.database.collection(this.useCases.login)
        const userObject = await collection.findOne({username})
        const saltRounds  = 5                            //higher the number,more difficult to crack
        bcrypt.genSalt(saltRounds,function (saltError,salt) {
            if(saltError){ //if salting has issues
                console.log("Error salting password")
            } else {
                bcrypt.hash(password,salt,function(hashError, hash){
                    if (hashError){                        // if hashing with declared salt has issues
                        console.log("Error hashing string")
                        throw(hashError)
                    } else {                               //hash and save it to database of user
                         console.log(hash)
                    }
                })
            }
        })
    }


}