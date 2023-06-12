const dotenv  = require('dotenv')
const baseDatabase = require('./mongo/baseDatabase').baseDatabase
const {json, urlencoded, rest,notFound, errorHandler } = require("@feathersjs/express")
const express = require("@feathersjs/express")
const {feathers} = require("@feathersjs/feathers")



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
            login:"tenants",
            addServiceTicket:"serviceTickets",
            deleteServiceTickets:"serviceTickets",
            registerUnit:"units",
            updateServiceTicketProgress:"serviceTickets",
            registerLandlord:"landlords"
        }
    }
    getLandlordUseCases = () => {
        return {
            login:"landlords",
            updateServiceTicketProgress:"serviceTickets",
            registerTenant:"tenants"
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

// Listen on port 3030
const server = await app.listen(3000,()=>{
    console.log("Server started")
})

require('./routes')(app,databaseClass)
}
init()
