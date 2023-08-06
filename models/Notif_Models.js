const NotificationBuilder = require("./notificationBuilder")


class Notif_AddingServiceTicket extends NotificationBuilder {
    // add custom methods
    constructor(){
        super()
        this.withTitle("Service Ticket Addition")
    }

}
class Notif_UpdateServiceTicket extends NotificationBuilder {
    constructor(){
        super()
        /* TODO: show which attribute of the Service Ticket was updated and what action is required after that */
    }
    withProgress(stage, status){
         const instructions = this.nextStepsDescription(stage,status)
         this.withCustomAttributes({instructions})   
         return this
    }
    nextStepsDescription(stage, status){
        /** TODO: craft a custom message for the next steps */
    }

}

class Notif_Quotation extends NotificationBuilder{
    constructor(){
        super()
    }
}

class Notif_UpdatedProfile extends NotificationBuilder {
    constructor(){
        super()
    }
    withUpdatedAttributes(attributes){
        // attributes is an object containing only the attributes that were updated in the profile
        const keys = Object.keys(attributes);
        var output = ""
        for(let i = 0; i < keys.length; i++){
            output += `${i+1}: Updated profile: ${keys[i]} \n`
        }
        return this
    }

}

module.exports = TenantNotifications = {
    Notif_AddingServiceTicket,
    Notif_UpdateServiceTicket,
    Notif_Quotation,
    Notif_UpdatedProfile
}