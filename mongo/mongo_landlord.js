exports.landlordDatabase = class landlordDatabase{
    useCases;
    client;
    constructor(config){
        this.client = config.client;
        this.useCases = config.landlordConfig
    }
}