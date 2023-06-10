module.exports = function(app,database){
    app.post('/tenantLogin', async(req,res)=>{
        const result = await database.verifyLogin(req.body)
        if(result){
            // send ok status
            res.sendStatus(200)
        } else {
            res.sendStatus(401)
        }
    })
    app.post('/addServiceTicket',async(req,res)=>{
        const result = await database.addServiceTicket(req.body)
        if(result){
            // send ok status
            res.sendStatus(200)
        } else {
            res.sendStatus(401)
        }
    })
    app.post('/updateServiceTicketProgress',async(req,res)=>{
        const result = await database.updateServiceTicketProgress(req.body.serviceTicketID)
        if(result) res.sendStatus(200)
        else res.sendStatus(404)
    })
    
}
