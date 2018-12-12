    //Database models
    var User = require('../model/user.model');

    //Security Configuration
    var asset = require('../config/assets');
    var jwt = require('jsonwebtoken');

    //App Library
    var hashMe = require('../lib/cryptic');
    var analytics = require('../lib/analytics');

    //Other Library
    var geocoder = require('geocoder');

    //Serve Response Function
    let serverResponse = (res, data, token, success) =>{
      return res.json({
        success: success,
        token:  token,
        result: data
      });
    }

    var authenticate = (req, res, data) => {
      var hashThis = hashMe.hashPassword(req.body.password, data.security.accesscode);
      if (hashThis.hashed === data.security.accesskey) {

        //log signin  rate for analytics
        analytics.logSignIn(req);
        
        User.findOneAndUpdate({
          '_id': data._id
        }, {
          'personal.one_signal_id': req.body.oneId ? req.body.oneId : '',
          'last_seen': new Date()
        }, {
          fields: {
            'security.accesscode': 0,
            'security.accesskey': 0,
            'documentstatus': 0
          },
          new: true
        }, (err, userdata) => {
          if (err) {
            serverResponse(res, {}, '', false);
          } else {
            var sessionToken = jwt.sign(data._id, asset.secret, {
              expiresIn: 60 * 60 * 24
            });
            serverResponse(res, userdata, sessionToken, true);
          }
        });
      } else {
        serverResponse(res, {}, '', false);
      }
    }

    var failed = (req, res) => {
      res.json({
        success: false,
        message: 'Authentication failed, account not found for ' + req.body.email,
        userdata: {}
      });
    }

    var auth = {

      /****************************************************************************************
          AUTHENTICATE
      ****************************************************************************************/

      //Authenticate user
      authenticateMobileUser: (req, res) => {

      console.log(req.body);
        User.findOne({
          'personal.email': req.body.email,
          'documentstatus': 1,
          'security.is_active': true
        }, (err, data) => {
          if (err) {
            failed(req, res);
          }
          if (!data) {
            failed(req, res);
          } else {
            if (data.device && data.device.is_available) {
              if (data.device.is_active) {
                if(data.device.specification.uuid == req.body.device.specification.uuid){
                  authenticate(req, res, data);
                }else{
                  failed(req, res);
                }
              } else {
                failed(req, res);
              }
            } else {
              //add device to account
              User.findOneAndUpdate({
                '_id': data._id
              }, {
                'device': req.body.device
              }, {
                new: true
              }, (err, user_data) => {
                if (err) {
                  failed(req, res);
                } else {
                  authenticate(req, res, user_data);
                }
              });
            }
          }
        });
      },

      //Authenticate user
      authenticateUser: (req, res) => {

        User.findOne({
          'personal.email': req.body.email,
          'documentstatus': 1,
          'security.is_active': true
        }, (err, data) => {
          if (err) throw err;

          if (!data) {
            failed(req, res);
          } else {
            var hashThis = hashMe.hashPassword(req.body.password, data.security.accesscode);
            if (hashThis.hashed === data.security.accesskey) {

              //log signin  rate for analytics
              analytics.logSignIn(req);

              User.findOneAndUpdate({
                '_id': data._id
              }, {
                'last_seen': new Date()
              }, {
                fields: {
                  'security.accesscode': 0,
                  'security.accesskey': 0,
                  'documentstatus': 0
                },
                new: true
              }, (err, userdata) => {
                if (err) {
                  failed(req, res);
                } else {
                  var sessionToken = jwt.sign(data._id, asset.secret, {
                    expiresIn: 60 * 60 * 24
                  });
                  serverResponse(res, userdata, sessionToken, true);
                }
              });

            } else {
              failed(req, res);
            }
          }
        });
      },

      //Authenticate organization user
      authenticateOrganisationUser: (req, res) => {

        User.findOne({
          'organisation.email': req.body.email,
          'documentstatus': 1,
          'security.is_active': true
        }, (err, data) => {
          if (err) throw err;

          if (!data) {
            failed(req, res);
          } else {
            var hashThis = hashMe.hashPassword(req.body.password, data.security.accesscode);
            if (hashThis.hashed === data.security.accesskey) {

              //log signin  rate for analytics
              analytics.logSignIn(req);

              User.findOneAndUpdate({
                '_id': data._id
              }, {
                'last_seen': new Date()
              }, {
                fields: {
                  'security.accesscode': 0,
                  'security.accesskey': 0,
                  'documentstatus': 0
                },
                new: true
              }, (err, userdata) => {
                if (err) {
                  failed(req, res);
                } else {
                  var sessionToken = jwt.sign(data._id, asset.secret, {
                    expiresIn: 60 * 60 * 24
                  });
                  serverResponse(res, userdata, sessionToken, true);
                }
              });

            } else {
              failed(req, res);
            }
          }
        });
      }

    }

    module.exports = auth;