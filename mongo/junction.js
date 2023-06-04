
const {MongoClient} = require('mongodb')
const collections = require('./constants');
const { json } = require('express');

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

    verifyLogin = async(userInfo) => {
        var username = userInfo["username"]
        var password = userInfo["password"]
        var userType = userInfo["userType"]
        
        const searchParam = userType == "tenant" ? "tenant" : "landlord"
        const database = this.client.db("tenantPortal")
        // find the user using the username
        const collec = database.collection(`${searchParam}_auth`)
        const userObject = await collec.findOne({"username": username})
        if(userObject["password"] == password){
            // authentication successfull
            return true
        } else {
            return false
        }
        
    }
    addDocumentToCollection = async() => {
        try {
            if(this.client){
                const database = this.client.db('test');
                const collection = database.collection("myCollection");
                const document = {"Name":"Sarang","age":23}
                const result = await collection.insertOne(document);
                console.log('Document added:', result.insertedId);
            } else {
                throw `Mongo Client is: ${this.client}`
            }
          
        } catch (error) {
          console.error('Error adding document:', error);
        }
      }
      
}