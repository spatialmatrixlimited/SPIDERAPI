//Database Model
let EntityRecord = require('../model/entity.model');
let PropertyRecord = require('../model/property.model');
let EntityPhoto = require('../model/entity.photo.model');

//App Library
let photoWriter = require('./photo.writer.controller');
let documentSignature = require('./signature.controller');
let sr = require('./server.response');

//Record Controller Object

let addEntityPhoto = (payload) => {
  return new Promise(resolve => {
    EntityRecord.findOneAndUpdate({
      'entity.entity_id': payload.id
    }, {
      '$push': {
        'property_photos': {
          'snapshot_position': payload.snapshot_position,
          'url': payload.url
        }
      }
    }).exec((err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(true);
      }
    });
  });
}

let entityRecord = {

  //add new street record
  addNewEntity: (req, res) => {
    let payload = req.body;
    let _signatures = [];
    documentSignature.isSigned(payload.signature).then(response => {
      if (response) {
        sr.serverResponse(res, _signatures[0].signature, true);
      } else {
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
            let photoRecord = new EntityPhoto({
              'entity.entity_id': payload.entity.entity_id,
              'entity.property_id': payload.entity.property_id,
              'entity.building_serial_number': payload.entity.building_serial_number
            });
            photoRecord.save().then(result => {
              PropertyRecord.findOneAndUpdate({
                'property.property_id': payload.property_id
              }, {
                $inc: {
                  entities: 1
                }
              }, (err, propertyData) => {
                documentSignature.sign(entityData.signature, entityData._id).then(response => {
                  sr.serverResponse(res, entityData.signature, true);
                });
              });
            });
          } else {
            sr.serverResponse(res, '', false);
          }
        }, (err) => {
          sr.serverResponse(res, '', false);
        });
      }
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
          sr.serverResponse(res, {}, false);
        } else {
          sr.serverResponse(res, data, true);
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
          sr.serverResponse(res, {}, false);
        } else {
          PropertyRecord.findOneAndUpdate({
            'property.property_id': data.property_id
          }, {
            $inc: {
              entities: -1
            }
          }, (err, _data) => {
            sr.serverResponse(res, {}, true);
          });
        }
      });
  },

  //update property entity image via mobile
  patchEntityPhoto: (req, res) => {
    let payload = req.body;
    documentSignature.isSigned(payload.signature).then(result => {
      if (result) {
        sr.serverResponse(res, payload.signature, true);
      } else {
        photoWriter({
          id: payload.entity_id,
          photo: payload.photo,
          document: 'entities'
        }).then(response => {
          if (response['success']) {
            let url = 'https://photos.spider.com.ng/spider/entities/' + response['filename'];
            addEntityPhoto({
              id: payload.entity_id,
              url: url,
              snapshot_position: payload.snapshot_position
            }).then(response => {
              EntityPhoto.findOneAndUpdate({
                'entity.entity_id': payload.entity_id
              }, {
                '$push': {
                  'property_photos': {
                    'snapshot_position': payload.snapshot_position,
                    'url': url
                  }
                },
                'signature': payload.signature
              }, {
                new: true
              }).exec((err, data) => {
                if (err) {
                  sr.serverResponse(res, {}, false);
                } else {
                  if (data) {
                    documentSignature.sign(payload.signature, payload.entity_id).then(response => {
                      sr.serverResponse(res, data.signature, true);
                    });
                  } else {
                    sr.serverResponse(res, {}, false);
                  }
                }
              });
            }).catch(err => {
              sr.serverResponse(res, {}, false);
            });
          } else {
            sr.serverResponse(res, {}, false);
          }
        });
      }
    });
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
          sr.serverResponse(res, [], false);
        } else {
          sr.serverResponse(res, data, true);
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
        sr.serverResponse(res, [], false);
      } else {
        sr.serverResponse(res, data, true);
      }
    });
  },

  //Get property entities
  getPropertyEntities: (req, res) => {
    EntityRecord.find({
      'property_id': req.params.id
    }, (err, data) => {
      if (err) {
        sr.serverResponse(res, [], false);
      } else {
        sr.serverResponse(res, data, false);
      }
    });
  }

}

module.exports = entityRecord;