module.exports = function(app,database){
    app.post('/tenant/verifyLogin', async(req,res)=>{
        try{
            await database.verifyLogin(req.body,res)
        } catch(err){
            res.status(500).json({message:`Error logging in username: ${req.body.username}`})
        }
        
    })
    app.post('/tenant/addServiceTicket',async(req,res)=>{
        const result = await database.addServiceTicket(req.body)
        if(result){
            // send ok status
            res.json({status:200,message:"Added Successfully"})
        } else {
            res.json({status:500,message:"Unsuccessful Addition of Service Ticket"})
        }
    })

    app.put('/tenant/updateServiceTicketProgress',async(req,res)=>{
        await database.updateServiceTicketProgress(req.body._id,res)
    })
    
    app.get('/tenant/getUnitData/:userID',async(req,res)=>{
        const userID = req.params.userID;
        await database.getUnitData(userID,res)
    })

    app.get('/tenant/getAllServiceTickets/:userID', async(req,res)=>{
        const userID = req.params.userID
        await database.getAllServiceTickets(userID,res)
    })
    app.get('/tenant/getPieChartData/:userID',async(req,res)=>{
        const userID = req.params.userID
        await database.getSTForPieChart(userID,res)
    })
    app.get('/tenant/getNotifications/:userID',async(req,res)=>{
        const userID = req.params.userID
        await database.getAllNotifications(userID,res)
    })
    app.put('/tenant/changePassword',async(req,res)=>{
        const result = database.changePassword(req.body)
        if(result){
            res.status(200).json({message:"Changed password successfully"})
        } else {
            res.status(500).json({message:"Unsuccessfull password change"})
        }
    })
    app.delete('/tenant/deleteServiceTicket',async(req,res)=>{
        try{
            const result = await database.deleteServiceTicket(req.body._id)
            if(result) res.json({status:200,message:"Ticket Deleted!"})
        } catch(err){
            res.json({status:500,message:err})
        }
        
    })
    app.get('/tenant/getUnit&LandlordData/:userID',async(req,res)=>{
        const userID = req.params.userID
        await database.getUnitAndLandlordData(userID,res)
    })

    app.put('/tenant/submitFeedback', async(req,res) => {
        const result = database.submitFeedback(req.body)
        if(result){
            // send ok status
            res.status(200).json({message:"Feedback updated!"})
        } else {
            res.status(500).json({message:"Unsuccessful updating of Feedback"})
        }
    })

    app.put('/tenant/updateQuotation', async(req,res) => {
        const result = await database.updateQuotation(req.body)
        if(result){
            // send ok status
            res.json({status:200,message:"Quotation Accepted"})
        } else {
            res.json({status:500,message:"Unsuccessful Acceptance of Feedback"})
        }
    })    

}
