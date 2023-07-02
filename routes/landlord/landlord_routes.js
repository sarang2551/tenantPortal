//call router function
module.exports = function(app,database){
    //route to landlord login page
    app.post('/landlord/landlordlogin', async(req,res)=>{
        const result = await database.verifyLogin(req.body) //use same databae as tenets to verify landlord login
        if(result){
            // send ok status
            res.sendStatus(200)
        } else {
            res.sendStatus(401)
        }
    })
    //route to view service ticket page
    app.post('/landlord/landlordticketpage', async(req,res)=>{
        const result = await database.landlordviewticket(req.body)
        if(result){
            // send ok status
            res.sendStatus(200)
        } else {
            res.sendStatus(401)
        }
    })
    //route to see properties page for landlords
    app.post('/landlord/landlordownedpropertiespage', async(req,res)=>{
        const result = await database.landlordownedproperties(req.body)
        if(result){
            // send ok status
            res.sendStatus(200)
        } else {
            res.sendStatus(401)
        }
    })
    //route to see units under which properties do we need a page for this?
    app.post('/landlord/landlordownedpropertiespage/landlordunitspage', async(req,res)=>{
        const result = await database.landlordownedunits(req.body)
        if(result){
            // send ok status
            res.sendStatus(200)
        } else {
            res.sendStatus(401)
        }
    })
    
}