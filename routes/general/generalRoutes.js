module.exports = function(app,database){
    app.put('/general/updateNotificationSeen',async(req,res)=>{
        try{
            await database.updateNotificationSeen(req.body)
            res.status(200).json({message:"Seen status updated successfully"})
        }catch(error){
            res.status(401).json({error})
        }
    })
    app.get('/general/getServiceTicketInfo/:serviceTicketID',async(req,res)=>{
        const serviceTicketID = req.params.serviceTicketID;
        console.log(`Received id: ${serviceTicketID}`)
        await database.getServiceTicketInfo(serviceTicketID,res);
    })
}