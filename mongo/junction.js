
const {MongoClient} = require('mongodb')


exports.junction =  class junction {
    mongoConfig = {}
    client;
    constructor(config){
        this.mongoConfig = config
    }
    init = async()=>{
        try{
            this.client = await MongoClient.
            connect(this.mongoConfig.mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
            
        }catch(e){
            console.error("Mongo client unable to connect")
            throw e
        }
        
    }
    testFunction = async()=>{
        const fallback = ()=>this.testFunction()
        try{
            if(this.client){
                const db = this.client.db("training")
            let collection;
            collection = db.collection('train')
            var data  = await collection.findOne({})
            console.log(data)
            } 
            
            
            
        }catch(e){
            throw "Error running test function: " + e
        }
    }
    verifyUserLogin = () => {

    }
    addDocumentToCollection = async() => {
        try {
          const database = this.client.db('test');
          const collection = database.collection("myCollection");
          const document = {"Name":"Sarang"}
          const result = await collection.insertOne(document);
          console.log('Document added:', result.insertedId);
        } catch (error) {
          console.error('Error adding document:', error);
        }
      }
      
}