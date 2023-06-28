module.exports = function(app,database){
    app.post('/tenant/tenantLogin', async(req,res)=>{
        const result = await database.verifyLogin(req.body)
        if(result){
            // send ok status
            res.sendStatus(200)
        } else {
            res.sendStatus(401)
        }
    })
    app.post('/tenant/addServiceTicket',async(req,res)=>{
        const result = await database.addServiceTicket(req.body)
        if(result){
            // send ok status
            res.sendStatus(200)
        } else {
            res.sendStatus(401)
        }
    })

    app.post('/tenant/updateServiceTicketProgress',async(req,res)=>{
        const result = await database.updateServiceTicketProgress(req.body.serviceTicketID)
        if(result) res.sendStatus(200)
        else res.sendStatus(404)
    })
    
    app.post('/tenant/registerLandlord',async(req,res)=>{
        // req.body should contain all the notification details
        const result = await database.registerLandlord(req.body)
        if(result) res.sendStatus(200)
        else res.sendStatus(404)
    })

//Tenant registration
    app.post('/tenant/registerTenant',async(req,res)=>{
        // req.body should contain all the notification details
        const result = await database.registerTenant(req.body)
        if(result) res.sendStatus(200)
        else res.sendStatus(404)
    })

    app.post('/tenant/registerUnit',async(req,res)=>{
        const result = await database.registerUnit(req.body)
        if(result) res.sendStatus(200)
        else res.sendStatus(404)
    })
}