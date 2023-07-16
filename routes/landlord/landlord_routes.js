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

    app.get('/landlord/pendingST', async(req,res)=>{
        const result = await database.getPendingST()
        res.send(`${JSON.stringify(result)}`);
    })

    app.get('/landlord/buildingsOwned', async(req,res) => {
        const buildingsOwned = await database.getBuildings()
        res.send(`${JSON.stringify(buildingsOwned)}`);
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