
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

      
}