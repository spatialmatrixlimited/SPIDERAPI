//Database Model
let EntityRecord = require('../model/entity.model');
let PropertyRecord = require('../model/property.model');
let signatures = require('./signature.controller');

//App Library
let imageProcessor = require('./image.processor');

//Other Library
let fs = require('fs');

let entityRecord = {

  //add new street record
  addNewEntity: (req, res) => {
    let payload = req.body;
    let newRecord = new EntityRecord({
      document_owner: payload.document_owner,
      property_id: payload.property_id,
      entity: payload.entity,
      contact: payload.contact,
      location: payload.location,
      enumerator: payload.enumerator,
      document_status: 1,
      created: new Date(),
      signature: payload.signature
    });

    newRecord.save().then((entityData) => {
      if (entityData) {
        PropertyRecord.findOneAndUpdate({
          'property.property_id': payload.property_id
        }, {
          $inc: {
            entities: 1
          }
        }, (err, propertyData) => {
          signatures.insert({
            'id': entityData._id,
            'signature': entityData.signature
          }).then((signatureData) => {
            console.log('ENTITY SIGNATURE (DATA)', signatureData);
            res.json({
              success: true,
              result: entityData.signature
            });
          });
        });
      } else {
        res.json({
          success: false,
          result: ''
        });
      }
    }, (err) => {
      res.json({
        success: false,
        result: ''
      });
    });
  },

  //update entity record
  patchEntity: (req, res) => {
    let payload = req.body;
    EntityRecord.findOneAndUpdate({
        '_id': payload.id
      }, {
        'entity': payload.entity,
        'contact': payload.contact,
        'modified_by': payload.modified_by,
        'modified': new Date()
      }, {
        new: true
      })
      .exec((err, data) => {
        if (err) {
          res.json({
            success: false,
            message: 'Operation failed!',
            result: {}
          });
        } else {
          res.json({
            success: true,
            message: 'Operation successful!',
            result: data
          });
        }
      });
  },


  //delete entity - disbable entity
  deleteEntity: (req, res) => {
    EntityRecord.findOneAndUpdate({
        '_id': req.body.id
      }, {
        'document_status': 0
      })
      .exec((err, data) => {
        if (err) {
          res.json({
            success: false
          });
        } else {
          PropertyRecord.findOneAndUpdate({
            'property.property_id': data.property_id
          }, {
            $inc: {
              entities: -1
            }
          }, (err, _data) => {
            res.json({
              success: true
            });
          });
        }
      });
  },

  //update property entity image via mobile
  patchEntityPhoto: (req, res) => {
    let payload = req.body;
    let now = new Date().getTime();
    let data = payload.photo;
    let filename = `${payload.entity_id}_${now}.jpg`;
    let dir = '/var/www/photos.spider.com.ng/html/spider/entities/';

    let base64Data = data.replace(/^data:image\/\w+;base64,/, "");
    let binaryData = Buffer.from(base64Data, 'base64');

    let wstream = fs.createWriteStream(dir + filename);
    wstream.on('finish', () => {
      imageProcessor(`${dir}${filename}`);
      EntityRecord.findOneAndUpdate({
        'entity.entity_id': payload.entity_id
      }, {
        '$push': {
          'property_photos': {
            'title': payload.title,
            'snapshot_position': payload.snapshot_position,
            'url': 'https://photos.spider.com.ng/spider/entities/' + filename,
            'location': payload.location
          }
        }
      }, {
        new: true
      }).exec((err, data) => {
        if (err) {
          res.json({
            success: false,
            message: 'Operation failed!',
            result: ''
          });
        } else {
          signatures.insert({
            'id': data._id,
            'signature': data.signature
          }).then((signatureData) => {
            console.log('ENTITY SIGNATURE (PHOTO)', signatureData);
            res.json({
              success: true,
              message: 'Operation successful!',
              result: data.signature
            });
          });
          
        }
      });
    });
    wstream.write(binaryData);
    wstream.end();
  },

  processEntityImage: (req, res) => {
    const baseURL = '/var/www/photos.spider.com.ng/html/spider/entities/';
    let filename = req.body.filename;
    imageProcessor(`${baseURL}${filename}`).then(response => {
      res.json({
        success: true,
        message: 'Operation successful!',
        result: {
          url: `https://photos.spider.com.ng/spider/entities/${filename}`
        }
      });
    }).catch(err => {
      console.error(err);
    });
  },

  // Get all Entities
  getEntities: (req, res) => {
    var pagesize = req.params.limit;
    var skipby = req.params.start;
    EntityRecord.find({
        'document_status': 1
      }, (err, data) => {
        if (err) {
          res.json({
            success: false,
            result: []
          });
        } else {
          return res.json({
            success: true,
            result: data
          });
        }
      }).sort({
        'created': -1
      }).limit(parseInt(pagesize))
      .skip(parseInt(skipby));
  },


  // Get entity (single)
  getEntity: (req, res) => {
    EntityRecord.find({
      '_id': req.params.id
    }, (err, data) => {
      if (err) {
        res.json({
          success: false,
          result: []
        });
      } else {
        return res.json({
          success: true,
          result: data
        });
      }
    });
  },

  //Get property entities
  getPropertyEntities: (req, res) => {
    EntityRecord.find({
      'property_id': req.params.id
    }, (err, data) => {
      if (err) {
        res.json({
          success: false,
          result: []
        });
      } else {
        return res.json({
          success: true,
          result: data
        });
      }
    });
  }

}

module.exports = entityRecord;