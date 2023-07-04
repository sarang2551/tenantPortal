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
class Notif_RegisterLandlordRequest extends NotificationBuilder {
    constructor(){
        super()
        this.withTitle("Requesting Landlord Registration")
        this.withCustomAttributes({accepted:false})
    }
    withTenantName(tenantName){
        this.withCustomAttributes({tenantName})
        return this
    }
    withTenantUnit(tenantUnit){
        this.withCustomAttributes({tenantUnit})
        return this
    }
    withMonthlyRental(monthlyRental){
        this.withCustomAttributes({monthlyRental})
        return this
    }
}

module.exports = TenantNotifications = {
    Notif_AddingServiceTicket,
    Notif_RegisterLandlordRequest,
    Notif_UpdateServiceTicket
}