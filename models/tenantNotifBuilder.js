const NotificationBuilder = require("./notificationBuilder")


class Notif_AddingServiceTicket extends NotificationBuilder {
    // add custom methods
    constructor(){
        super()
        this.withTitle("Service Ticket Addition")
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
    Notif_RegisterLandlordRequest
}