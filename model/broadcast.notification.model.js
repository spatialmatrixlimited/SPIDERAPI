var mongoose = require('mongoose');
var BroadcastNotificationSchema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;
var broadcastNotificationSchema = new BroadcastNotificationSchema({
    message: {
        title: {
            type: String,
            default: ''
        },
        body:{
            type: String,
            default: ''
        }
    },
    users: [{
        type: ObjectId,
        ref: 'User'
    }],
    document_status: {
        type: Number,
        default: 1
    },
    read: [{
        type: ObjectId,
        ref: 'User'
    }],
    created: {
        type: Date
    }
});

module.exports = mongoose.model('BroadcastNotification', broadcastNotificationSchema, 'broadcast_notifications');