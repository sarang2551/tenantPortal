module.exports = function(app,database){
    app.post('/landlord/verifyLogin', async(req,res)=>{
        try{
            await database.verifyLogin(req.body,res)
        }catch(err){
            res.status(500).json({message:"Error loging in landlord"})
        }
        
    })

    app.get('/landlord/getlandlordNoti', async(req,res) => {
        const result = await database.getLandlordNotifications(req.body, res)
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

    app.post('/landlord/addUnit', async(req,res)=>{
        const result = await database.addUnit(req.body)
        if(result){
            // send ok status
            res.json({status:200,message:"Successfully added Unit"})
        } else {
            res.json({status:500,message:"Error adding Unit"})
        }
    })

    app.get('/landlord/pendingST', async(req,res)=>{
        const result = await database.getPendingST()
        res.send(`${JSON.stringify(result)}`);
    })

    app.get('/landlord/buildingsOwned/:userID', async(req,res) => {
        const userID = req.params.userID;
        await database.getBuildings(userID,res)
    })

    app.get('/landlord/getBuildingInformation/:buildingID',async(req,res)=>{
        const buildingID = req.params.buildingID;
        await database.getBuildingInformation(buildingID,res)
    })

    app.get('/landlord/getTenantInfo/:tenantID',async(req,res)=>{
        const tenantID = req.params.tenantID;
        await database.getTenantInfo(tenantID,res)
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