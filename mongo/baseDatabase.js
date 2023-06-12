
const {MongoClient} = require('mongodb')

const {tenantDatabase} = require('./mongo_tenant')
const {landlordDatabase} = require('./mongo_landlord')
exports.baseDatabase =  class baseDatabase {
    mongoConfig = {}
    client;
    database;
    tenantDatabase;
    landlordDatabase;
    constructor(config){
        this.mongoConfig = config
    }
    init = async()=>{
        try{
            this.client = await MongoClient.
            connect(this.mongoConfig.mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
            this.database = await this.client.db(this.mongoConfig.db);
            this.tenantDatabase = new tenantDatabase({database:this.database,...this.mongoConfig})
            this.landlordDatabase = new landlordDatabase({database:this.database,...this.mongoConfig})
        }catch(e){
            console.error("Mongo client unable to connect")
            throw e
        }
        
    }
    async getLandlordNotifications(landlordData,res){
        try{
            // get all notifications in a list
            const landlordID = landlordData["landlordID"]
            const collection = this.database.collection("landlords")
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