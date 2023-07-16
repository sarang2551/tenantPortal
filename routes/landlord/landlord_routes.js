module.exports = function(app,database){
    app.post('/landlord/verifyLogin', async(req,res)=>{
        const result = await database.verifyLogin(req.body)
        if(result){
            // send ok status
            res.sendStatus(200)
        } else {
            res.sendStatus(401)
        }
    })

    app.get('/landlord/getlandlordNoti', async(req,res) => {
        const result = await database.getLandlordNotifications(req.body, res)
    })

    app.post('/landlord/addTenants', async(req,res)=>{
        const result = await database.addTenants(req.body)
        if(result){
            // send ok status
            res.sendStatus(200)
        } else {
            res.sendStatus(401)
        }
    })

    app.post('/landlord/addLease', async(req,res)=>{
        const result = await database.addLease(req.body)
        if(result){
            // send ok status
            res.sendStatus(200)
        } else {
            res.sendStatus(401)
        }
    })

    app.get('/landlord/pendingST', async(req,res)=>{
        const result = await database.getPendingST()
        res.send(`${JSON.stringify(result)}`);
    })

    app.get('/landlord/buildingsOwned', async(req,res) => {
        const buildingsOwned = await database.getBuildings()
        res.send(`${JSON.stringify(buildingsOwned)}`);
    })

    app.put('/landlord/updateProgress', async(req,res)=>{
        const result = await database.updateProgress(req.body.serviceTicketID)
        if(result){
            // send ok status
            res.sendStatus(200)
        } else {
            res.sendStatus(401)
        }
    })

    app.put('/landlord/updateQuotation', async(req,res) => {
        const result = await database.updateQuotation(req.body)
        if(result){
            // send ok status
            res.json({status:200,message:"Quotation updated!"})
        } else {
            res.json({status:500,message:"Unsuccessful updating of Quotation"})
        }
    })

    app.get('/landlord/availableLease', async(req,res)=>{
        const result = await database.getAvailableLease()
        res.send(`${JSON.stringify(result)}`);
    })



}