//Database Model
let PropertyRecord = require('../model/property.model');
let StreetRecord = require('../model/street.model');
//App Library
let imageProcessor = require('./image.processor');

//Other Library
let fs = require('fs');

let propertyRecord = {

  //add new street record
  addNewProperty: (req, res) => {
    let payload = req.body;
    let newRecord = new PropertyRecord({
      document_owner: payload.document_owner ? payload.document_owner : '',
      property: payload.property,
      contact: payload.contact,
      location: payload.location,
      enumerator: payload.enumerator,
      document_status: 1,
      created: new Date()
    });

    newRecord.save().then((propertyData) => {
      if (propertyData) {
        StreetRecord.findOneAndUpdate({
          'street.street_id': payload.property.street_id
        }, {
          $inc: {
            properties: 1
          }
        }, (err, streetData) => {
          res.json({
            success: true,
            result: propertyData
          });
        });
      } else {
        res.json({
          success: false,
          result: {}
        });
      }
    }, (err) => {
      res.json({
        success: false,
        result: {}
      });
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
          'entities': payload.entities,
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
  

  //delete property - disbable property
  deleteProperty: (req, res) => {
    PropertyRecord.findOneAndUpdate({
        '_id': req.params.id
      }, {
        'documentstatus': 0
      })
      .exec((err, data) => {
        if (err) {
          res.json({
            success: false
          });
        } else {
          StreetRecord.findOneAndUpdate({
            'street.street_id': data.property.street_id
          }, {
            $inc: {
              properties: -1
            }
          }, (err, streetData) => {

            res.json({
              success: true
            });
          });
        }
      });
  },

  //update property image via mobile
  patchPropertyPhoto: (req, res) => {
    let payload = req.body;
    let now = new Date().getTime();
    let data = payload.photo;
    let filename = `${payload.property_id}_${now}.jpg`;
    let dir = '/var/www/photos.spider.com.ng/html/spider/properties/';

    let base64Data = data.replace(/^data:image\/\w+;base64,/, "");
    let binaryData = Buffer.from(base64Data, 'base64');

    let wstream = fs.createWriteStream(dir + filename);
    wstream.on('finish', () => {
      imageProcessor(`${dir}${filename}`);
      PropertyRecord.findOneAndUpdate({
        'property.property_id': payload.property_id
      }, {
        '$push': {
          'property_photos': {
            'title': payload.title,
            'snapshot_position': payload.snapshot_position,
            'url': 'https://photos.spider.com.ng/spider/properties/' + filename,
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
    });
    wstream.write(binaryData);
    wstream.end();
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

  //Get all properties for a street
  getPropertiesByStreet: (req, res) => {
    PropertyRecord.find({
      'property.street_id': req.params.id
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


  // Get property (single)
  getProperty: (req, res) => {
    PropertyRecord.find({
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

  // Get all properties - ADMIN
  getAllProperties: (req, res) => {
    PropertyRecord.find({
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
    });
  },

  // Get all properties - Organisations
  getOrganisationProperties: (req, res) => {
    PropertyRecord.find({
      'document_status': 1,
      'document_owner': req.params.owner
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
    });
  },

  // Get all properties - Individual
  getIndividualProperties: (req, res) => {
    PropertyRecord.find({
      'document_status': 1,
      'document_owner': req.params.owner
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
    });
  }

}

module.exports = propertyRecord;