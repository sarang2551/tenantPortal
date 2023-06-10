
module.exports = function(app,database){
require('./auth/auth')(app,database)
require('./tenant/tenant_routes')(app,database.tenantDatabase)
}