module.exports = function(app,database){
    app.get('/landLord/notifications', async(req,res)=>{
        await database.getLandlordNotifications(req.body,res)
    })
}