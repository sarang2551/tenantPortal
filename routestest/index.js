
module.exports = function(app,database){
require('./general/generalRoutes')(app,database)
require('./tenant/tenant_routes')(app,database.tenantDatabase)
require('./landlord/landlord_routes')(app,database.landlordDatabase)
}