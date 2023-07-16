const dotenv  = require('dotenv')
const baseDatabase = require('./mongo/baseDatabase').baseDatabase
const express = require("@feathersjs/express")


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
          landlordConfig:this.getLandlordUseCases()
      }
  }
  getTenantUseCases = () => {
      return {
        login:"tenants",
        addServiceTicket:"serviceTickets",
        deleteServiceTicket:"serviceTickets",
        //registerUnit:"units",
        updateServiceTicketProgress:"serviceTickets",
        //registerLandlord:"landlords",
        getAllNotifications:"tenants",
        getAllServiceTickets:"serviceTickets",
        getUnitData:"units",
        getUnitAndLandlordData:"tenants"
      }
  }
  getLandlordUseCases = () => {
      return {
        login: "landlords",
        updateServiceTicketProgress:"serviceTickets",
        registerTenant: "tenants",
        getAllNotifications:"landlords",
        getPendingServiceTickets: "serviceTickets",
        getBuildingsOwned: "buildings",
        addLease: "leases",
        showLeases: "leases",
        addLeaseUnit: "leaseUnit"
      }
  }
};

const app = express()
async function init(){


const cor = require('cors')
const bodyParser = require("body-parser")
app.use(cor())
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended:true, limit:'50mb'}));

// Parse JSON bodies (as sent by API clients)
var mongoConfig = new Enviroment().getMongoConfig()
var databaseClass = new baseDatabase(mongoConfig)
await databaseClass.init() // awaits the start of the database instance

// Listen on port 8000
const server = await app.listen(8000,()=>{
    console.log("Server started")
})

require('./routes')(app,databaseClass)
}
init()
module.exports = app
