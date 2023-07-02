exports.landlordDatabase = class landlordDatabase{
    useCases;
    client;
    constructor(config){
        this.client = config.client;
        this.useCases = config.landlordConfig
    }
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
}