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
}