const NotificationBuilder = require("./notificationBuilder")


class Notif_AddingServiceTicket extends NotificationBuilder {
    // add custom methods
    constructor(){
        this.withTitle("Service Ticket Addition")
    }
}
class Notif_RegisterLandlordRequest extends NotificationBuilder {
    constructor(){
        this.withTitle("Requesting Landlord Registration")
        this.withCustomAttributes({accepted:false})
    }
    withTenantName(tenantName){
        this.withCustomAttributes({tenantName})
    }
    withTenantUnit(tenantUnit){
        this.withCustomAttributes({tenantUnit})
    }
    withMonthlyRental(monthlyRental){
        this.withCustomAttributes({monthlyRental})
    }
}

exports.TenantNotifications = {
    Notif_AddingServiceTicket,
    Notif_RegisterLandlordRequest
}