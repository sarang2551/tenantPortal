class Notification {
    constructor(builder) {
      const date = new Date()
      this.title = builder.title;
      this.description = builder.description;
      this.date = `${date.getDay()}:${date.getMonth()}:${date.getFullYear()}`
      this.senderID = builder.senderID
      this.recipientID = builder.recipientID
      this.collection = builder.collection
      this.customAttributes = builder.customAttributes
    }
    validate(){
        if (!this.title) throw new Error("Missing title field when creating notification")
        if (!this.description) throw new Error("Missing description field when creating notification")
        if (!this.senderID) throw new Error("Missing senderID field when creating notification")
        if (!this.recipientID) throw new Error("Missing recipientID field when creating notification")
        if (!this.collection) throw new Error("Missing collection field when creating notification")
        if (!this.customAttributes) throw new Error("Missing customAttributes field when creating notification")
        return true;
    }   
    async send() {
        // Logic to actually send the notification
        const {collection, ...notification} = this
        const recipientObject = await collection.findOne({id:this.recipientID})
        if(recipientObject == null){
            console.log(`Error sending notification to: ${recipientID}`)
            return false
        }
        var currentNotifications = recipientObject['notifications']
        var newNotifications = [notification,...currentNotifications] // add at index 0 because its the latest notification
        await collection.updateOne({id:this.recipientID},{$set:{notifications:newNotifications}},(err,result)=>{
            if(err){
                console.log(`Error sending addLandlord notification: ${err}`)
                return false
            } 
            return true
        })
        return true
    }
  }
  
  class NotificationBuilder {
    constructor() {
      this.title;
      this.description;
      this.senderID;
      this.recipientID;
      this.collection;
      this.customAttributes = {};
    }
    withTitle(title) {
      this.title = title
      return this
    }
    withDescription(description) {
      this.description = description
      return this
    }
    withSenderID(senderID){
        this.senderID = senderID
        return this
    }
    withRecipientID(recipientID){
        this.recipientID = recipientID
        return this
    }
    withCollection(collection){
        this.collection = collection
        return this
    }
    withCustomAttributes(customObject){
        this.customAttributes = {...customObject,...this.customAttributes}
        return this
    }
    build() {
        const notification = new Notification(this);

        // Validate attributes before returning the built notification
        notification.validate();
    
        return notification;
    }
  }

  module.exports = NotificationBuilder
  