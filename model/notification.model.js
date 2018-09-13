var mongoose = require('mongoose');
var NotificationSchema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;
var notificationSchema = new NotificationSchema({
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
    user: {
        type: ObjectId,
        ref: 'User'
    },
    document_status: {
        type: Number,
        default: 1
    },
    read: {
        type: Boolean,
        default: false
    },
    created: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', notificationSchema, 'notifications');