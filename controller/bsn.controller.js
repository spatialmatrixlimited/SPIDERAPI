let BSN = require('../model/bsn.model');
let sr = require('./server.response');

let bsn = {
    assignBSN: (req, res) => {
        let payload = req.body;
        BSN.updateMany({
            '$and': [{
                'assigned': false
            }, {
                '_id': {
                    '$in': payload.bsn
                }
            }]
        }, {
            'user': payload.user.id,
            'assigned': true
        }).then(data => {
            if (data.nModified > 0) {
                sr.serverResponse(res, {}, true);
            } else {
                sr.serverResponse(res, {}, false);
            }
        }).catch(err => {
            sr.serverResponse(res, {}, false);
        });
    },

    getUserBSN: (req, res) => {
        BSN.find({
                'user': req.params.id,
                'used': false
            })
            .then(docs => {
                console.log(docs);
                sr.serverResponse(res, docs, true);
            })
            .catch(err => {
                sr.serverResponse(res, [], false);
            });
    },

    loadBSN: (req, res) => {
        BSN.insertMany(req.body).then(data => {
            if (data) {
                sr.serverResponse(res, data, true);
            } else {
                sr.serverResponse(res, [], false);
            }
        }).catch(err => {
            sr.serverResponse(res, [], false);
        });
    },

    getBSN: (req, res) => {
        let skip = parseInt(req.params.skip);
        BSN.find({}, (err, docs) => {
            if (err) {
                sr.serverResponse(res, [], false);
            } else {
                sr.serverResponse(res, docs, true);
            }
        }).sort({
            assigned: 1
        }).skip(skip).limit(500).populate('user', 'personal');
    },

    removeBSN: (req, res) => {
        BSN.findOneAndRemove({
            _id: req.params.id
        }, (err, doc) => {
            if (err) {
                sr.serverResponse(res, {}, false);
            } else {
                sr.serverResponse(res, {}, true);
            }
        });
    }
}
module.exports = bsn;