
const {MongoClient, ObjectId} = require('mongodb')

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
    updateNotificationSeen = async(notifData) => {
        try{
            const {userID, notifID, userType} = notifData
            // need to find the userID and then the notifID inside the notifications array
            const collectionName = userType === "tenant" ? "tenants" : "landlords"
            await this.database.collection(collectionName).updateOne(
                { id: userID, 'notifications.id': notifID },
                { $set: { 'notifications.$.seen': true } }
              );
        }catch(err){
            throw new Error(`Error updating seen status of notification with ID: ${notifID}`)
        }
    }
    getServiceTicketInfo = async(serviceTicketID,res) =>{
        try{
            const collection = this.database.collection("serviceTickets")
            const serviceTicketObject = await collection.findOne({_id:ObjectId(serviceTicketID)},{images:0,quotationDocument:0})
            if(!serviceTicketID){
                console.log(`Error retrieving info for ticket with id: ${serviceTicketID}`)
                res.status(500).json({message:"Error retrieving info for ticket"})
            }
            
            res.status(200).json(serviceTicketObject)
        }catch(err){
            console.log(`Error retrieving data for serviceTicket with id: ${serviceTicketID} : ${err}`)
            res.status(500).json({message:"Error retrieving info for ticket"})
        }
    }

    getSTImages = async(serviceTicketID, res) => {
        try {
            const collection = this.database.collection("serviceTickets")
            const serviceTicketObject = await collection.findOne({_id:ObjectId(serviceTicketID)})
            if(!serviceTicketID){
                console.log(`Error retrieving info for ticket with id: ${serviceTicketID}`)
                res.status(500).json({message:"Error retrieving info for ticket"})
            }
            res.status(200).json(serviceTicketObject.images)
        }catch(err){
            console.log(`Error retrieving images for serviceTicket with id: ${serviceTicketID}`)
        }
        
    }

}