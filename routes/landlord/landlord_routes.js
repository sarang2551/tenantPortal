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

    app.post('/landlord/addTenants', async(req,res)=>{
        const result = await database.addTenants(req.body)
        if(result){
            // send ok status
            res.sendStatus(200)
        } else {
            res.sendStatus(401)
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
    
    app.put('/landlord/hashPasswords', async(req,res)=>{
        const result = await database.hashPasswords(req.body.user_name)
        if(result){
            res.send('Hashing successful')
        }
        else{
            res.send('Error hashing password')
        }
    })

}