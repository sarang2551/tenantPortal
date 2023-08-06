const dotenv  = require('dotenv')
const baseDatabase = require('./mongo/baseDatabase').baseDatabase
const express = require("@feathersjs/express")
const mongoSanitize = require('mongo-sanitize');

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
        changePassword: "tenants",
        addServiceTicket:"serviceTickets",
        deleteServiceTicket:"serviceTickets",
        updateServiceTicketProgress:"serviceTickets",
        getAllNotifications:"tenants",
        getAllServiceTickets:"serviceTickets",
        getUnitData:"units",
        getUnitAndLandlordData:"tenants",
        submitFeedback:"serviceTickets",
        updateUserInfo:"tenants"
      }
  }
  getLandlordUseCases = () => {
      return {
        login: "landlords",
        registerLandlord:"landlords",
        updateServiceTicketProgress:"serviceTickets",
        getAllServiceTickets:"serviceTickets",
        registerTenant: "tenants",
        getTenant:"tenants",
        updateTenant: "tenants",
        getAllNotifications:"landlords",
        getPendingServiceTickets: "serviceTickets",
        getBuildingsOwned: "buildings",
        addBuilding:"buildings",
        addUnit: "units",
        showLeases: "units",
        addLeaseUnit: "leaseUnit",
        getBuildingInformation:"units",
        submitFeedback:"serviceTickets",
        deleteUnit: "units",
        getUserInfo:"landlords"
      }
  }
};

const app = express()

// Middleware to sanitize user inputs
app.use((req, res, next) => {
    // Sanitize all user inputs in the request body, params, and query
    req.body = mongoSanitize(req.body);
    req.params = mongoSanitize(req.params);
    req.query = mongoSanitize(req.query);
    next();
  });
  
async function init(){


const cor = require('cors')
const bodyParser = require("body-parser")
app.use(cor())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

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
