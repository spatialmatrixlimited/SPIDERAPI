//Database Model
let Notification = require('../model/notification.model');
let BroadcastNotification = require('../model/broadcast.notification.model');

//eMail Notification
let notificationMail = require('../views/notification.template');
let mailer = require('./mailer.controller');
let push = require('./push.notification.controller');

//Other library
sr = require('./server.response');

let notification = {

    //Add a new message
    add: (req, res) => {
        let payload = req.body;
        let newMessage = Notification({
            'message': payload.message,
            'user': payload.user.id,
            'created': payload.created
        });
        newMessage.save().then(
            (data) => {
                //send notification email
                let title = `Hello ${payload.user.firstname}, ${payload.message.title}`;
                mailer(payload.user.email, title, notificationMail.notificationTemplate(payload));


                //send push notification
                if(payload.user.oneId){
                    let message = {
                        player: payload.user.oneId,
                        message: payload.message.title
                    }
                    push.oneNotification(message);
                }
                    
                //return server response
                sr.serverResponse(res, {}, true);

            }, (err) => {
                sr.serverResponse(res, {}, false);
            });
    },

    //Add a new broadcast message
    broadcast: (req, res) => {
        let payload = req.body;
        let newMessage = BroadcastNotification({
            'message': payload.message,
            'users': payload.users,
            'created': payload.created
        });
        newMessage.save().then(
            (data) => {

                //send push notification
                let message = {
                    player: payload.oneIds,
                    message: payload.message.title
                }
                push.manyNotification(message);

                //return server response
                sr.serverResponse(res, {}, true);

            }, (err) => {
                sr.serverResponse(res, {}, false);
            });
    },

    // Get all user notifications
    get: (req, res) => {
        let skip = parseInt(req.params.skip);
        let limit = parseInt(req.params.limit);
        Notification.find({
            'document_status': 1,
            'user': req.params.id
        }, (err, data) => {
            if (err) {
                sr.serverResponse(res, [], false);
            } else {
                sr.serverResponse(res, data, true);
            }
        }).sort({
            'created': -1
        }).skip(skip).limit(limit);
    },

    // Get all broadcast
    getBroadcast: (req, res) => {
        BroacastNotification.find({
            'document_status': 1,
            'users': {
                '$in': [req.params.id]
            }
        }, (err, data) => {
            if (err) {
                sr.serverResponse(res, [], false);
            } else {
                sr.serverResponse(res, data, true);
            }
        }).sort({
            'created': -1
        });
    },

 
    // Get all 
    getAll: (req, res) => {
        Notification.find({
            'document_status': 1
        }, (err, data) => {
            if (err) {
                sr.serverResponse(res, [], false);
            } else {
                sr.serverResponse(res, data, true);
            }
        }).sort({
            'created': -1
        });
    },


    // Get support message
    getOne: (req, res) => {
        Notification.findOne({
            '_id': req.params.id
        }, (err, data) => {
            if (err) {
                sr.serverResponse(res, {}, false);
            } else {
                sr.serverResponse(res, data, true);
            }
        });
    },

    //Mark As Read
    read: (req,res) => {
        Notification.findOneAndUpdate({'_id': req.body.id},{
            'read': true
        },{ new: true },(err, doc)=>{
            if(err){
                sr.serverResponse(res,{}, false);
            }else{
                sr.serverResponse(res, doc, true);
            }
        });
    }
}

module.exports = notification;