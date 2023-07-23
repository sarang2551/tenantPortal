module.exports = function(app,database){
    //landlord login testcases------------------------------------------------------------------------------
    app.post('/landlord/verifyLoginTESTPASS', async(req,res)=>{
        var userinfo = {
            username : "landlord_1",
            password : "test123"
        }
        console.log("Should successfully log in")
          try{
              await database.verifyLogin(userinfo,res)
              res.status(200).json({message:"Successfully logged in"})
          }catch(err){
              res.status(500).json({message:"Error logging in landlord"})
          }
          
      })
    
    app.post('/landlord/verifyLoginTESTFAIL', async(req,res)=>{
        var data = {
            username : "landlord_1",
            password : "fakepass"
        }
        console.log("Should return incorrect password message")
          try{
              await database.verifyLogin(data,res)
              res.status(200).json({message:"Successfully logged in"})
          }catch(err){
              res.status(500).json({message:"Error logging in landlord"})
          }
          
      })
    //landlord notification testcases--------------------------------------------------------------------------------------------
//even with undefined landlordID the function still returns landlord 1 for some reason
// if there is no notifications for landlordID the function will send error instead
//this has issues
    app.get('/landlord/getlandlordNotiTESTPASS', async(req,res) => {
        let data ={
            landlordID:"64873c12bd2e5989a5e90e1c"
        } 
        const result = await database.getLandlordNotifications(data, res)
        console.log("Test successfully returns notifications")
    })

    app.get('/landlord/getlandlordNotiTESTFAIL', async(req,res) => {
        let data ={
            landlordID:"64b44e1162de91e8cbcc3978"
        } 
        const result = await database.getLandlordNotifications(data, res)
        console.log("Test fails to return notifications")
    })

    //add tenants testcases-------------------------------------------------------------------------------------------------------
    //TODO
    app.post('/landlord/addTenants', async(req,res)=>{
        const result = await database.addTenants(req.body)
        if(result){
            // send ok status
            res.json({status:200,message:"Tenant added successfully"})
        } else {
            res.json({status:500,message:"Unsuccessful addition of tenant"})
        }
    })

    //landlord add units test cases-------------------------------------------------------------------------------
    app.post('/landlord/addUnitTESTPASS', async(req,res)=>{
        let data={
            unitNumber : "someunitTEST",
                buildingID : "64ba604025f1b13046eed984", //building objectID number
                monthlyRental : "TESTNUMBER",
                userID : "64873c12bd2e5989a5e90e1c", //landlord objectID number
                images: [] ,
        }
        console.log("test should add a new unit in the unit collections with specified parameters")
        const result = await database.addUnit(data)
        if(result){
            // send ok status
            res.json({status:200,message:"Successfully added Unit"})
        } else {
            res.json({status:500,message:"Error adding Unit"})
        }
    })


    app.post('/landlord/addUnitTESTFAIL1', async(req,res)=>{
        let data={
            unitNumber : "someunitTEST",
                buildingID : "54ba604025f1b13046eed984", //fake building objectID number
                monthlyRental : "TESTNUMBER",
                userID : "64873c12bd2e5989a5e90e1c", //landlord objectID number
                images: [] ,
        }
        console.log("test should fail to find fake buildingID")
        const result = await database.addUnit(data)
        if(result){
            // send ok status
            res.json({status:200,message:"Successfully added Unit"})
        } else {
            res.json({status:500,message:"Error adding Unit"})
        }
    })

    app.post('/landlord/addUnitTESTFAIL2', async(req,res)=>{
        let data={
            unitNumber : "someunitTEST",
                buildingID : "invalid", //invalid building objectID number
                monthlyRental : "TESTNUMBER",
                userID : "64873c12bd2e5989a5e90e1c", //landlord objectID number
                images: [] ,
        }
        console.log("test should return error with status 500")
        const result = await database.addUnit(data)
        if(result){
            // send ok status
            res.json({status:200,message:"Successfully added Unit"})
        } else {
            res.json({status:500,message:"Error adding Unit"})
        }
    })


    //just need to test the router of this function
    app.get('/landlord/pendingST', async(req,res)=>{
        const result = await database.getPendingST()
        res.send(`${JSON.stringify(result)}`);
    })


    //landlord get building owned for landlordID test cases-------------------------------------------------------------------------------
    app.get('/landlord/buildingsOwnedTESTPASS', async(req,res) => {
        const userID = '64873c12bd2e5989a5e90e1c';
        console.log("Test should return a buildings owned by landlordID")
        await database.getBuildings(userID,res)
    })

    app.get('/landlord/buildingsOwnedTESTFAIL', async(req,res) => {
        const userID = '64873c12bd2e5989a5e90e1b';//Fake userID
        console.log("Test should Fail and return an error")
        await database.getBuildings(userID,res)
    })

    //landlord get building infomation test cases-------------------------------------------------------------------------------
    app.get('/landlord/getBuildingInformationTESTPASS',async(req,res)=>{
        const buildingID = "64ba604025f1b13046eed984";
        console.log("Test should pass and return all units under buildingID")
        await database.getBuildingInformation(buildingID,res)
    })

    app.get('/landlord/getBuildingInformationTESTFAIL',async(req,res)=>{
        const buildingID = "64ba604025f1b13046eed986";//Fake buildingID
        console.log("Test should fail and return error with status 500")
        await database.getBuildingInformation(buildingID,res)
    })

    //landlord get tenant infomation test cases-------------------------------------------------------------------------------
    app.get('/landlord/getTenantInfoTESTPASS',async(req,res)=>{
        const tenantID = "647f3b0628c6e292aebd999d";
        console.log("Test should pass and return all infomation of specified tenant")
        await database.getTenantInfo(tenantID,res)
    })
    app.get('/landlord/getTenantInfoTESTFAIL',async(req,res)=>{
        const tenantID = "647f3b0628c6e292aebd999e";
        console.log("Test should fail and return error with status 500")
        await database.getTenantInfo(tenantID,res)
    })
    
    //landlord add buildings test cases-------------------------------------------------------------------------------
    app.post('/landlord/addBuildingTESTPASS',async(req,res)=>{
        let data = {
            userID:"64873c12bd2e5989a5e90e1c",
            buildingName:"testbuilding",
            address:"testestest",
            postalCode:"123456"
        }
        try{
            const result = await database.addBuilding(data)
            if(result){
                res.json({status:200,message:"Building added successfully"})
            }
        }catch(error){
            res.json({status:500,message:"Error adding building"})
        }
    })

    app.post('/landlord/addBuildingTESTFAIL',async(req,res)=>{
        let data = {
            userID:"nil",
            buildingName:"testbuilding",
            address:"testestest",
            postalCode:"123456"
        }
        try{
            const result = await database.addBuilding(data)
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

    // app.put('/landlord/hashPasswords', async(req,res)=>{
    //     const result = await database.hashPasswords(req.body.user_name)
    //     if(result){
    //         res.send('Hashing successful')
    //     }
    //     else{
    //         res.send('Error hashing password')
    //     }
    // })

}