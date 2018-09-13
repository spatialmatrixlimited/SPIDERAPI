//Database Model
let StreetRecord = require('../model/street.model');
let StreetPhoto = require('../model/street.photo.model');

//App Library
let photoWriter = require('./photo.writer.controller');
let documentSignature = require('./signature.controller');
let sr = require('./server.response');


//Record Controller Object

let addStreetPhoto = (payload) => {
  return new Promise(resolve => {
    StreetRecord.findOneAndUpdate({
      'street.street_id': payload.id
    }, {
      '$push': {
        'street_photos': {
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

let streetRecord = {

  //add new street record
  addNewStreet: (req, res) => {
    let payload = req.body;
    documentSignature.isSigned(payload.signature).then(result => {
      if (result) {
        sr.serverResponse(res, payload.signature, true);
      } else {

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

            let photoRecord = new StreetPhoto({
              'street.street_id': payload.street.street_id
            });

            photoRecord.save().then(saved => {
              documentSignature.sign(streetData.signature, streetData._id).then(response => {
                sr.serverResponse(res, streetData.signature, true);
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

  //delete street - disable street
  deleteStreet: (req, res) => {
    StreetRecord.findOneAndUpdate({
        '_id': req.body.id
      }, {
        'document_status': 0
      })
      .exec((err, data) => {
        if (err) {
          sr.serverResponse(res, {}, false);
        } else {
          sr.serverResponse(res, {}, true);
        }
      });
  },

  //update street photo via mobile device
  patchStreetPhoto: (req, res) => {
    let payload = req.body;
    documentSignature.isSigned(payload.signature).then(result => {
      if (result) {
        sr.serverResponse(res, payload.signature, true);
      } else {
        photoWriter({
          id: payload.street_id,
          photo: payload.photo,
          document: 'streets'
        }).then(response => {
          if (response['success']) {
            let url = 'https://photos.spider.com.ng/spider/streets/' + response['filename'];
            addStreetPhoto({
              id: payload.street_id,
              snapshot_position: payload.snapshot_position,
              url: url
            }).then(response => {
              StreetPhoto.findOneAndUpdate({
                'street.street_id': payload.street_id
              }, {
                '$push': {
                  'street_photos': {
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
                  documentSignature.sign(payload.signature, payload.street_id).then(reply => {
                    sr.serverResponse(res, data.signature, true);
                  });
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
        if (err || !data) {
          sr.serverResponse(res, {}, false);
        } else {
          sr.serverResponse(res, {}, true);
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
          sr.serverResponse(res, [], false);
        } else {
          sr.serverResponse(res, data, true);
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
          sr.serverResponse(res, [], false);
        } else {
          sr.serverResponse(res, data, true);
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
        sr.serverResponse(res, [], false);
      } else {
        sr.serverResponse(res, data, true);
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
        sr.serverResponse(res, [], false);
      } else {
        sr.serverResponse(res, data, true);
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
          sr.serverResponse(res, [], false);
        } else {
          sr.serverResponse(res, data, true);
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
        sr.serverResponse(res, [], false);
      } else {
        sr.serverResponse(res, data, true);
      }
    });
  },

  //get all streets - ADMIN
  getAllStreets: (req, res) => {
    let skip = parseInt(req.params.skip);
    StreetRecord.find({
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

  //get all streets - Organisation
  getOrganisationStreets: (req, res) => {
    let skip = parseInt(req.params.skip);
    StreetRecord.find({
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

  //get all streets - Individual
  getIndividualStreets: (req, res) => {
    StreetRecord.find({
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
  }

}

module.exports = streetRecord;