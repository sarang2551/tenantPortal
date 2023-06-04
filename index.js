const dotenv  = require('dotenv')
const junction = require('./mongo/junction').junction
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
            mongoUrl: `mongodb+srv://sarangadmin:${process.env.MONGO_PASSWORD}@cluster0.faxey7j.mongodb.net/`
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
var mongoStart = new junction(mongoConfig)
await mongoStart.init() // awaits the start of the database instance
require('./routes')(app,mongoStart)
app.listen(process.env.PORT,()=>{
    console.log("server started")
})

}
init()
