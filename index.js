const dotenv  = require('dotenv')
const baseDatabase = require('./mongo/baseDatabase').baseDatabase
const express = require('express')
class Enviroment {
    dotenvPath;
    constructor(){
        this.setenvPath()
    }
    setenvPath = ()=>{
        if (process.env.ENVIRONMENT_FILE) {
            
            this.dotenvPath = envFile || process.env.ENVIRONMENT_FILE || ".env";

            dotenv.config({
                path: this.dotenvPath,
            });
            
        } else {
            dotenv.config();
        }
    }
    getMongoConfig = ()=>{
        return {
            mongoUrl: `mongodb+srv://sarangadmin:${process.env.MONGO_PASSWORD}@cluster0.faxey7j.mongodb.net/`,
            db:"tenantPortal",
            tenantConfig:this.getTenantUseCases(),
            landlordCofig:this.getLandlordUseCases()
        }
    }
    getTenantUseCases = () => {
        return {
            login:"tenant_auth",
            addServiceTicket:"serviceTickets",
            deleteServiceTickets:"serviceTickets",
            registerUnit:"units",
            updateServiceTicketProgress:"serviceTickets",
        }
    }
    getLandlordUseCases = () => {
        return {
            login:"landlord_auth",
            updateServiceTicketProgress:"serviceTickets",
            registerTenant:""
        }
    }
}



async function init(){

const app = express()
const cor = require('cors')
const bodyParser = require("body-parser")
app.use(cor())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
// Parse JSON bodies (as sent by API clients)

var mongoConfig = new Enviroment().getMongoConfig()
var databaseClass = new baseDatabase(mongoConfig)
await databaseClass.init() // awaits the start of the database instance
require('./routes')(app,databaseClass)
app.listen(process.env.PORT,()=>{
    console.log("server started")
})

}
init()
