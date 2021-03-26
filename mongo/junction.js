
const {MongoClient} = require('mongodb')


exports.junction =  class junction {
    mongoConfig = {}
    client;
    constructor(config){
        this.mongoConfig = config
        this.init()
    }
    init = async()=>{
        try{
            this.client = new MongoClient(this.mongoConfig.mongoUrl,{useUnifiedTopology:true}).connect((err)=>{
                if(err){ throw e}else{
                    console.log("Mongo connected")
                    this.testFunction()
                }
               
            })
            
            
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
            throw e + " because of js is stupid"
        }
    }
    verifyUserLogin = ()=>{

    }
}