//Database Model
let PropertyRecord = require('../model/property.model');
let StreetRecord = require('../model/street.model');
let PropertyPhoto = require('../model/property.photo.model');
let alasql = require('alasql');
let BSN = require('../model/bsn.model');

//App Library
let pw = require('./photo.writer.controller');
let documentSignature = require('./signature.controller');
let sr = require('./server.response');
let imageProcessor = require('./image.processor');

let getPropsIds = (dist) => {
  return new Promise(resolve => {
    let propIds = [];
    dist.forEach(element => {
      propIds.push(element.property.property_id);
    });
    resolve(propIds);
  })
}

let getDistinct = (data) => {
  return new Promise(resolve => {
    let dist = alasql('SELECT DISTINCT property FROM ?', [data]);
    resolve(dist);
  });
}

let updateBSN = (bsn) => {
  return new Promise((resolve, reject)=>{
    BSN.findOneAndUpdate({'bsn': bsn, 'modified': new Date()},{'used': true})
    .then(data=>{
      resolve(true);
    })
    .catch(err=>{
      reject(err);
    })
  });
}



//Record Controller Object

let addPropertyPhoto = (payload) => {
  return new Promise(resolve => {
    PropertyRecord.findOneAndUpdate({
      'property.property_id': payload.id
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

let propertyRecord = {

  //add new street record
  addNewProperty: (req, res) => {
    let payload = req.body;
    documentSignature.isSigned(payload.signature).then(result => {
      if (result) {
        sr.serverResponse(res, payload.signature, true);
      } else {
        let newRecord = new PropertyRecord({
          document_owner: payload.document_owner,
          property: payload.property,
          contact: payload.contact,
          location: payload.location,
          enumerator: payload.enumerator,
          document_status: 1,
          created: new Date(),
          signature: payload.signature
        });

        newRecord.save().then((propertyData) => {
          if (propertyData) {
            let newPhoto = new PropertyPhoto({
              'property.property_id': payload.property.property_id,
              'property.street_id': payload.property.street_id,
              'property.building_serial_number': payload.property.building_serial_number
            });

            newPhoto.save().then(saved => {
              StreetRecord.findOneAndUpdate({
                'street.street_id': payload.property.street_id
              }, {
                $inc: {
                  properties: 1
                }
              }, (err, streetData) => {
                documentSignature.sign(propertyData.signature, propertyData._id).then(response => {
                  updateBSN(payload.property.building_serial_number)
                  .then(status => sr.serverResponse(res, propertyData.signature, true))
                  .catch(err=> sr.serverResponse(res, propertyData.signature, true) );
                });
              });
            });
          } else {
            sr.serverResponse(res, {}, false);
          }
        }, (err) => {
          sr.serverResponse(res, {}, false);
        });
      }
    });
  },

  //update property record
  patchProperty: (req, res) => {
    let payload = req.body;
    PropertyRecord.findOneAndUpdate({
        '_id': payload.id
      }, {
        'property': payload.property,
        'modified_by': payload.modified_by,
        'contact': payload.contact,
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


  //delete property - disbable property
  deleteProperty: (req, res) => {
    PropertyRecord.findOneAndUpdate({
        '_id': req.body.id
      }, {
        'document_status': 0
      })
      .exec((err, data) => {
        if (err) {
          sr.serverResponse(res, {}, false);
        } else {
          StreetRecord.findOneAndUpdate({
            'street.street_id': data.property.street_id
          }, {
            $inc: {
              properties: -1
            }
          }, (err, streetData) => {
            sr.serverResponse(res, {}, true);
          });
        }
      });
  },

  //update property image via mobile
  patchPropertyPhoto: (req, res) => {
    let payload = req.body;
    documentSignature.isSigned(payload.signature).then(result => {
      if (result) {
        sr.serverResponse(res, payload.signature, true);
      } else {
        pw.photoWriter({
          id: payload.property_id,
          photo: payload.photo,
          document: 'properties'
        }).then(response => {
          if (response['success']) {
            let url = 'https://photos.spider.com.ng/spider/properties/' + response['filename'];
            addPropertyPhoto({
              id: payload.property_id,
              snapshot_position: payload.snapshot_position,
              url: url
            }).then(response=>{
              PropertyPhoto.findOneAndUpdate({
                'property.property_id': payload.property_id
              }, {
                '$push': {
                  'property_photos': {
                    'snapshot_position': payload.snapshot_position,
                    'url': url
                  }
                }
              }, {
                new: true
              }).exec((err, data) => {
  
                if (err || !data) {
                  sr.serverResponse(res, {}, false);
                } else {
                  documentSignature.sign(payload.signature, payload.property_id).then(reply => {
                    sr.serverResponse(res, data.signature, true);
                  });
                }
  
              });
            }).catch(err=>{
              sr.serverResponse(res, {}, false);
            })
          } else {
            sr.serverResponse(res, {}, false);
          }
        });
      }
    });
  },

  processPropertyImage: (req, res) => {
    const baseURL = '/var/www/downloads.femalehire.com/cloud/images/';
    let filename = req.body.filename;
    imageProcessor(`${baseURL}${filename}`).then(response => {
      res.json({
        success: true,
        message: 'Operation successful!',
        result: {
          url: `https://downloads.femalehire.com/cloud/images/${filename}`
        }
      });
    }).catch(err => {
      console.error(err);
    });
  },

  // Get all properties
  getProperties: (req, res) => {
    var pagesize = req.params.limit;
    var skipby = req.params.start;
    PropertyRecord.find({
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

  //Get all properties for a street
  getPropertiesByStreet: (req, res) => {
    PropertyRecord.find({
      'property.street_id': req.params.id,
      'document_status': 1
    }, (err, data) => {
      if (err) {
        sr.serverResponse(res, [], false);
      } else {
        sr.serverResponse(res, data, true);
      }
    });
  },


  // Get property (single)
  getProperty: (req, res) => {
    PropertyRecord.find({
      '_id': req.params.id
    }, (err, data) => {
      if (err) {
        sr.serverResponse(res, [], false);
      } else {
        sr.serverResponse(res, data, true);
      }
    });
  },

  // Get all properties - ADMIN
  getAllProperties: (req, res) => {
    let skip = parseInt(req.params.skip);
    PropertyRecord.find({
        'document_status': 1
      }, (err, data) => {
        if (err) {
          sr.serverResponse(res, [], false);
        } else {
          sr.serverResponse(res, data, true);
        }
      }).sort({
        'created': -1
      }).limit(500)
      .skip(parseInt(skip));
  },

  // Get all properties - Organisations
  getOrganisationProperties: (req, res) => {
    let skip = parseInt(req.params.skip);
    PropertyRecord.find({
        'document_status': 1,
        'document_owner': req.params.owner
      }, (err, data) => {
        if (err) {
          sr.serverResponse(res, [], false);
        } else {
          sr.serverResponse(res, data, true);
        }
      }).sort({
        'created': -1
      }).limit(500)
      .skip(parseInt(skip));
  },

  // Get all properties - Individual
  getIndividualProperties: (req, res) => {
    PropertyRecord.find({
      'document_status': 1,
      'document_owner': req.params.owner
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

  // Get all properties - Individual
  getDistinctProperties: (req, res) => {
    PropertyRecord.find({
      'document_status': 1
    }, (err, data) => {
      if (err) {
        sr.serverResponse(res, [], false);
      } else {
        getDistinct(data).then(docs => {
          return res.json({
            all: data.length,
            distinct: docs.length,
            first: docs[0]
          });
        });
      }
    }).limit(3000);
  }

}

module.exports = propertyRecord;