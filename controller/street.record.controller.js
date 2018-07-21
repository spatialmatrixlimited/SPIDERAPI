//Database Model
let StreetRecord = require('../model/street.model');

//App Library
let hashMe = require('../lib/cryptic');
let makeCase = require('../lib/stringagent');
let imageProcessor = require('./image.processor');

//Other Library
let fs = require('fs');

let streetRecord = {

  //add new street record
  addNewStreet: (req, res) => {
    let payload = req.body;

    let newRecord = new StreetRecord({
      document_owner: payload.document_owner,
      street: payload.street,
      location: payload.location,
      enumerator: payload.enumerator,
      document_status: 1,
      created: new Date(),
      signature: payload.signature
    });

    newRecord.save().then((streetData) => {
      if (streetData) {
        console.log('STREET SIGNATURE (DATA)', streetData.signature);
        res.json({
          success: true,
          result: streetData.signature
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

  //delete street - disable street
  deleteStreet: (req, res) => {
    StreetRecord.findOneAndUpdate({
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
          res.json({
            success: true
          });
        }
      });
  },

  //update street photo via mobile device
  patchStreetPhoto: (req, res) => {
    let payload = req.body;
    let now = new Date().getTime();
    let data = payload.photo;
    let filename = `${payload.street_id}-${now}.jpg`;
    let dir = '/var/www/photos.spider.com.ng/html/spider/streets/';

    let base64Data = data.replace(/^data:image\/\w+;base64,/, "");
    let binaryData = Buffer.from(base64Data, 'base64');

    let wstream = fs.createWriteStream(dir + filename);
    wstream.on('finish', () => {
      imageProcessor(`${dir}${filename}`);
      StreetRecord.findOneAndUpdate({
        'street.street_id': payload.street_id
      }, {
        '$push': {
          'street_photos': {
            'title': payload.title,
            'snapshot_position': payload.snapshot_position,
            'url': 'https://photos.spider.com.ng/spider/streets/' + filename,
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
          console.log('STREET SIGNATURE (PHOTO)', data.signature);
          res.json({
            success: true,
            message: 'Operation successful!',
            result: data.signature
          });
        }
      });
    });
    wstream.write(binaryData);
    wstream.end();
  },

  //update street record
  patchStreet: (req, res) => {
    let payload = req.body;
    StreetRecord.findOneAndUpdate({
        '_id': payload.id
      }, {
        'street': payload.street,
        'modified_by': payload.modified_by,
        'modified': new Date()
      }, {
        new: true
      })
      .exec((err, data) => {
        if (err) {
          res.json({
            success: false
          });
        } else {
          res.json({
            success: true
          });
        }
      });
  },

  //update street image
  processStreetImage: (req, res) => {
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

  // Search all streets
  searchStreets: (req, res) => {
    let pagesize = req.params.limit;
    let skipby = req.params.start;
    let search = req.params.search;
    StreetRecord.find({
        'document_status': 1,
        'street.street_name': {
          '$regex': new RegExp(search, "i")
        }
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

  // Search all streets by Organisation
  searchOrganisationStreets: (req, res) => {
    let pagesize = req.params.limit;
    let skipby = req.params.start;
    let search = req.params.search;
    StreetRecord.find({
        'document_status': 1,
        'document_owner': req.params.owner,
        'street.street_name': {
          '$regex': new RegExp(search, "i")
        }
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


  // Get all streets by specific user
  getStreetsByUser: (req, res) => {
    StreetRecord.find({
      'document_status': 1,
      'enumerator.id': req.params.id
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

   // Get all streets by GIS ID
   getStreetsByGIS: (req, res) => {
    StreetRecord.find({
      'document_status': 1,
      'street.gis_id': req.params.id
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


  // Get all streets
  getStreets: (req, res) => {
    let pagesize = req.params.limit;
    let skipby = req.params.start;
    StreetRecord.find({
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


  // Get street (single)
  getStreet: (req, res) => {
    StreetRecord.find({
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

  //get all streets - ADMIN
  getAllStreets: (req, res) => {
    StreetRecord.find({
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

  //get all streets - Organisation
  getOrganisationStreets: (req, res) => {
    StreetRecord.find({
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

  //get all streets - Individual
  getIndividualStreets: (req, res) => {
    StreetRecord.find({
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

module.exports = streetRecord;