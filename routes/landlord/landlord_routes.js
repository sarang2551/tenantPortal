module.exports = function(app,database){
    app.post('/landlord/verifyLogin', async(req,res)=>{
        try{
            await database.verifyLogin(req.body,res)
        }catch(err){
            res.status(500).json({message:"Error logging in landlord"})
        }
    })
    app.post('/landlord/registerLandlord',async(req,res)=>{
        try{
            const result = await database.registerLandlord(req.body)
            if(result){
                res.status(200).json({message:"Successfully added landlord"})
            }else{
                res.status(500).json({message:`Error registering landlord: Result: ${result}`})
            }
        }catch(err){
            console.log(`Error registering landlord: ${err}`)
            res.status(500).json({message:"Error registering landlord"})
        }
    })

    app.put('/landlord/changePassword', async(req, res) => {
        try{
            await database.changePassword(req.body)
            res.status(200).json({message:"Password Changed Successfully"})
        }catch(err){
            res.status(500).json({message:"Error Changing Password"})
        }
    })

    app.get('/landlord/getNotifications/:userID', async(req,res) => {
        const userID = req.params.userID;
        await database.getLandlordNotifications(userID, res)
    })

    app.post('/landlord/addTenants', async(req,res)=>{
        const result = await database.addTenants(req.body)
        if(result){
            // send ok status
            res.json({status:200,message:"Tenant added successfully"})
        } else {
            res.json({status:500,message:"Unsuccessful addition of tenant"})
        }
    })

    app.put('/landlord/editTenant/:userID', async(req,res)=>{
        const result = await database.editTenant(req.params.userID, req.body)
        if(result){
            // send ok status
            res.json({status:200,message:"Edited Tenant Successfully"})
        } else {
            res.json({status:500,message:"Unsuccessful editing of Tenant"})
        }
    })

    app.post('/landlord/addUnit', async(req,res)=>{
        const result = await database.addUnit(req.body)
        if(result){
            // send ok status
            res.json({status:200,message:"Successfully added Unit"})
        } else {
            res.json({status:500,message:"Error adding Unit"})
        }
    })

    app.delete("/landlord/deleteUnit/:unitID", async(req, res) => {
        const result = await database.deleteUnit(req.params.unitID)
        if (result) {
            res.json({status:200,message:"Successfully deleted Unit"})
        }
        else {
            res.json({status:500,message:"Unable to find unit"})
        }
    })

    app.get('/landlord/getAllServiceTickets/:userID', async(req,res)=>{
        const userID = req.params.userID;
        await database.getPendingST(userID, res)
    })

    app.get('/landlord/buildingsOwned/:userID', async(req,res) => {
        const userID = req.params.userID;
        await database.getBuildings(userID,res)
    })

    app.get('/landlord/getPieChartData/:userID',async(req,res)=>{
        const userID = req.params.userID
        await database.getSTForPieChart(userID,res)
    })

    app.get("/landlord/getTenantList/:userID",async(req,res)=>{
        const userID = req.params.userID
        await database.getTenantList(userID,res)
    })

    app.get('/landlord/getBuildingInformation/:buildingID',async(req,res)=>{
        const buildingID = req.params.buildingID;
        await database.getBuildingInformation(buildingID,res)
    })

    app.get('/landlord/getTenantInfo/:tenantID',async(req,res)=>{
        const tenantID = req.params.tenantID;
        await database.getTenantInfo(tenantID,res)
    })

    app.delete('/landlord/deleteTenant/:tenantID', async(req,res) => {
        const tenantID = req.params.tenantID;
        await database.deleteTenant(tenantID,res)
    })

    app.post('/landlord/addBuilding',async(req,res)=>{
        try{
            const result = await database.addBuilding(req.body)
            if(result){
                res.json({status:200,message:"Building added successfully"})
            }
        }catch(error){
            res.json({status:500,message:"Error adding building"})
        }
    })

    app.put('/landlord/updateServiceTicketProgress', async(req,res)=>{
        await database.updateProgress(req.body._id,res)
    })

    app.put('/landlord/updateQuotation', async(req,res) => {
        const result = database.updateQuotation(req.body)
        if(result){
            // send ok status
            res.status(200).json({message:"Quotation updated!"})
        } else {
            res.status(500).json({message:"Unsuccessful updating of Quotation"})
        }
    })
    app.put('/landlord/submitFeedback',async(req,res)=>{
        const result = database.submitFeedback(req.body)
        if(result){
            // send ok status
            res.status(200).json({message:"Feedback updated!"})
        } else {
            res.status(500).json({message:"Unsuccessful updating of feedback"})
        }
    })

    app.get('/landlord/availableLease', async(req,res)=>{
        const result = await database.getAvailableLease()
        res.send(`${JSON.stringify(result)}`);
    })

    app.get('/landlord/getUserInfo/:userID',async(req,res)=>{
        const userID = req.params.userID;
        await database.getUserInfo(userID,res)
    })

    app.put('/landlord/updateUserInfo',async(req,res)=>{
        const userObject = req.body
        await database.updateUserInfo(userObject,res)
    })

}