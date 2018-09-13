//Database Model
let User = require('../model/user.model');

//App Library
let hashMe = require('../lib/cryptic');
let makeCase = require('../lib/stringagent');
let imageProcessor = require('./image.processor');
let sr = require('./server.response');

//eMail Notification
let jet = require('./mailjet.controller');
let accountNotification = require('../views/password.notify.template');
let mailer = require('./mailer.controller');

//Other Library
let fs = require('fs');

let userRecord = {

  //update user - push notification player id
  patchUserPlayerId: (req, res) => {
    User.findOneAndUpdate({
        '_id': req.body.id
      }, {
        'playerid': req.body.playerid
      }, {
        new: true
      })
      .exec((err, data) => {
        if (err) {
          sr.serverResponse(res, {}, false);
        } else {
          sr.serverResponse(res, data, true);
        }
      });
  },

  //update user - password
  patchUserSecurity: (req, res) => {
    let payload = req.body;
    var hashed = hashMe.saltHashPassword(payload.password);
    User.findOneAndUpdate({
        '_id': payload.id
      }, {
        'security.accesscode': hashed.salt,
        'security.accesskey': hashed.hash
      }, {
        new: true
      })
      .exec((err, data) => {
        if (err) {
          sr.serverResponse(res, {}, false);
        } else {
          //send welcome email
          let notificationPayload = {
            firstname: makeCase.titleCase(data.personal.firstname),
            email: data.personal.email,
            new_password: payload.password,
            title: `Hello ${makeCase.titleCase(data.personal.firstname)}, Account update on SPiDER by Mobiforce`
          };
          //jet.mailJet(notificationPayload.email, notificationPayload.title, accountNotification.passwordNotifyTemplate(notificationPayload));
          mailer(notificationPayload.email, notificationPayload.title, accountNotification.passwordNotifyTemplate(notificationPayload));

          sr.serverResponse(res, data, true);
        }
      });
  },

  //update user 
  patchUser: (req, res) => {
    User.findOneAndUpdate({
        '_id': req.body.id
      }, {
        'personal.firstname': req.body.firstname,
        'personalal.lastname': req.body.lastname,
        'personal.mobile': req.body.mobile,
        'organisation.name': req.body.organisation,
        'security.is_active': req.body.is_active,
        'security.role': req.body.role,
      }, {
        new: true
      })
      .exec((err, data) => {
        if (err) {
          sr.serverResponse(res, {}, false);
        } else {
          sr.serverResponse(res, data, true);
        }
      });
  },

  //update user 
  patchUserDevice: (req, res) => {
    User.findOneAndUpdate({
        '_id': req.body.id
      }, {
        'device.is_active': req.body.status,
      }, {
        new: true
      })
      .exec((err, data) => {
        if (err) {
          sr.serverResponse(res, {}, false);
        } else {
          sr.serverResponse(res, data, true);
        }
      });
  },

  //update user 
  removeDevice: (req, res) => {
    User.findOneAndUpdate({
        '_id': req.body.id
      }, {
        'device': {},
      }, {
        new: true
      })
      .exec((err, data) => {
        if (err) {
          sr.serverResponse(res, {}, false);
        } else {
          sr.serverResponse(res, data, true);
        }
      });
  },

  //update organisation user
  patchOrganisationUser: (req, res) => {
    User.findOneAndUpdate({
        '_id': req.body.id
      }, {
        'personal.firstname': req.body.firstname,
        'personal.lastname': req.body.lastname,
        'organisation.name': req.body.organisation,
        'organisation.mobile': req.body.mobile,
        'security.is_active': req.body.is_active,
        'security.role': req.body.role,
      }, {
        new: true
      })
      .exec((err, data) => {
        if (err) {
          sr.serverResponse(res, {}, false);
        } else {
          sr.serverResponse(res, data, true);
        }
      });
  },

  //delete user - disable user
  deleteUser: (req, res) => {
    User.findOneAndUpdate({
        '_id': req.body.id
      }, {
        'documentstatus': 0
      }, {
        new: true
      })
      .exec((err, data) => {
        if (err) {
          sr.serverResponse(res, {}, false);
        } else {
          sr.serverResponse(res, data, true);
        }
      });
  },

  //update user - avatar (mobile)
  patchAvatar: (req, res) => {
    var now = new Date();
    var data = req.body.profileimage;
    var filename = `${req.body.id }_${now}.jpg`;
    var dir = '/var/www/photos.spider.com.ng/cloud/images/';

    var base64Data = data.replace(/^data:image\/\w+;base64,/, "");
    var binaryData = Buffer.from(base64Data, 'base64');

    var wstream = fs.createWriteStream(dir + filename);
    wstream.on('finish', () => {
      imageProcessor(`${dir}${filename}`);
      User.findOneAndUpdate({
        '_id': req.body.id
      }, {
        'avatar': 'https://photos.spider.com.ng/cloud/images/' + filename,
        'last_seen': new Date()

      }, {
        new: true
      }).exec((err, data) => {
        if (err) {
          sr.serverResponse(res, {}, false);
        } else {
          sr.serverResponse(res, data, true);
        }
      });
    });
    wstream.write(binaryData);
    wstream.end();
  },

  processAvatar: (req, res) => {
    const baseURL = '/var/www/photos.spider.com.ng/cloud/images/';
    let filename = req.body.filename;
    imageProcessor(`${baseURL}${filename}`).then(response => {
      res.json({
        success: true,
        message: 'Operation successful!',
        result: {
          url: `https://photos.spider.com.ng/cloud/images/${filename}`
        }
      });
    }).catch(err => {
      console.error(err);
    });
  },

  // Get all users
  getUsers: (req, res) => {
    User.find({
      'documentstatus': 1
    }, (err, data) => {
      if (err) {
        sr.serverResponse(res, [], false);
      } else {
        sr.serverResponse(res, data, true);
      }
    }).sort({
      'last_seen': -1
    });
  },

  // Get all users for organisation
  getOrganisationUsers: (req, res) => {
    User.find({
      'documentstatus': 1,
      'document_owner': req.params.owner
    }, (err, data) => {
      if (err) {
        sr.serverResponse(res, [], false);
      } else {
        sr.serverResponse(res, data, true);
      }
    }).sort({
      'last_seen': -1
    });
  },


  // Get user (single)
  getUser: (req, res) => {
    User.find({
      '_id': req.params.id
    }, (err, data) => {
      if (err) {
        sr.serverResponse(res, [], false);
      } else {
        sr.serverResponse(res, data, true);
      }
    });
  },

  //verifyUser
  verifyUser: (req, res) => {
    console.log(req.params);
    User.findOne({
      'personal.email': req.params.email
    }, (err, data) => {
      if (err) {
        //res.status(404).send({success: false});
        sr.serverResponse(res, {}, false);
      } else {
        if (data) {
          //res.status(200).send({success: true, data: data});
          sr.serverResponse(res, {}, true);
        } else {
          //res.status(404).send({success: false});
          sr.serverResponse(res, {}, false);
        }

      }
    });
  },

  //verify Organisation User
  verifyOrganisation: (req, res) => {
    console.log(req.params);
    User.findOne({
      'organisation.email': req.params.email
    }, (err, data) => {
      if (err) {
        //res.status(404).send({success: false});
        sr.serverResponse(res, {}, false);
      } else {
        if (data) {
          //res.status(200).send({success: true, data: data});
          sr.serverResponse(res, {}, true);
        } else {
          //res.status(404).send({success: false});
          sr.serverResponse(res, {}, false);
        }

      }
    });
  }


}

module.exports = userRecord;