module.exports = function(app,database){
    app.post('/tenant/verifyLogin', async(req,res)=>{
        const result = await database.verifyLogin(req.body)
        if(result){
            // send ok status
            res.status(200).json({message: "Login Successful"});
        } 
        else {
            res.status(500).json({message:"Login Unsuccessful"})
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

    app.put('/tenant/updateServiceTicketProgress',async(req,res)=>{
        const result = await database.updateServiceTicketProgress(req.body.serviceTicketID)
        if(result) res.sendStatus(200)
        else res.json({status:false})
    })
    
    app.post('/tenant/requestRegisterLandlord',async(req,res)=>{
        // req.body should contain all the notification details
        const result = await database.requestRegisterLandlord(req.body)
        if(result) res.sendStatus(200).json({message:"Tenant successfully registered", result})
        else res.sendStatus(404).json({message:"Tenant registration unsuccessful",result})
    })

    //Tenant registration
    app.post('/tenant/accountRegistrationTenant',async(req,res)=>{
        // req.body should contain all the notification details
        try{
            const result = await database.registerTenant(req.body)
            if(result) res.sendStatus(200)
        }catch(error){
            res.sendStatus(500).json({error})
        }
        
    })

    app.post('/tenant/registerUnit',async(req,res)=>{
        const result = await database.registerUnit(req.body)
        if(result) res.sendStatus(200)
        else res.sendStatus(404)
    })
}
