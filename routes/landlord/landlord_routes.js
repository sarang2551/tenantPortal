<<<<<<< HEAD
//call router function
module.exports = function(app,database){
    //route to landlord login page
    app.post('/landlord/landlordlogin', async(req,res)=>{
        const result = await database.verifyLogin(req.body) //use same databae as tenets to verify landlord login
=======
module.exports = function(app,database){
    app.post('/landlord/landlordLogin', async(req,res)=>{
        const result = await database.verifyLogin(req.body)
>>>>>>> 3cebd1b11524dc0a9ba7e7115b672f9ad780fd77
        if(result){
            // send ok status
            res.sendStatus(200)
        } else {
            res.sendStatus(401)
        }
    })
<<<<<<< HEAD
    //route to view service ticket page
    app.post('/landlord/landlordticketpage', async(req,res)=>{
        const result = await database.landlordviewticket(req.body)
=======

    app.post('/landlord/addTenants', async(req,res)=>{
        const result = await database.addTenants(req.body)
>>>>>>> 3cebd1b11524dc0a9ba7e7115b672f9ad780fd77
        if(result){
            // send ok status
            res.sendStatus(200)
        } else {
            res.sendStatus(401)
        }
    })
<<<<<<< HEAD
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
    
=======

    app.get('/landlord/pendingST', async(req,res)=>{
        const result = await database.getPendingST()
        res.send(`${JSON.stringify(result)}`);
    })

    app.get('/landlord/buildingsOwned', async(req,res) => {
        const buildingsOwned = await database.getBuildings()
        res.send(`${JSON.stringify(buildingsOwned)}`);
    })

>>>>>>> 3cebd1b11524dc0a9ba7e7115b672f9ad780fd77
}