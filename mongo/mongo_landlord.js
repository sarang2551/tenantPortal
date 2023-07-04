exports.landlordDatabase = class landlordDatabase{
    useCases;
    client;
    constructor(config){
        this.client = config.client;
        this.useCases = config.landlordConfig
    }

    verifyLogin = async (userinfo) => {
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

    // addTenants 
    // updateProgress
    // notifyServiceTickets
    // getPendingServiceTickets
    // 

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
}