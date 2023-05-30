const dotenv  = require('dotenv')
const junction = require('./mongo/junction').junction
const express = require('express')
const bodyParser = require("body-parser")

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
            mongoUrl: process.env.MONGO_URL
        }
    }
}



function init(){

const app = express()
const cor = require('cors')

app.use(cor())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
// Parse JSON bodies (as sent by API clients)
require('./routes')(app)
var mongoConfig = new Enviroment().getMongoConfig()
var mongoStart = new junction(mongoConfig)
mongoStart.init()

app.listen(process.env.PORT || 3000,()=>{
    console.log('server started')
})

}
init()
