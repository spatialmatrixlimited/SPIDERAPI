const EntityCollection = require('../model/app.entity.model');
const PropertyCollection = require('../model/app.property.model');
const StreetCollection = require('../model/app.street.model');
const crypt = require('../lib/cryptic');

const errorBox = [];
const successBox = [];

const logEntry = (type, payload, err) => {
    if(err) {
        const newLog = {
            _id: crypt.codeGen(),
            type: type,
            error: err,
            data: payload,
            created: new Date()
        }
        errorBox.push(newLog);
    } else {
        const newLog = {
            _id: crypt.codeGen(),
            type: type,
            error: {},
            data: payload,
            created: new Date()
        }
        successBox.push(newLog);
    }
}

const appCollection = {
    createNewEntity: (payload) => {
        return new Promise((resolve) => {

            const newEntry = new EntityCollection({
                'document_owner': payload.document_owner,
                'property_id': payload.property_id,
                'entity': payload.entity,
                'contact': payload.contact,
                'location.coordinates': [],
                'location.whatthreewords': '',
                'enumerator': payload.enumerator,
                'document_status': 1,
                'created': new Date()
            });

            newEntry.save().then((savedEntry, err) => {
                logEntry('Entity', err ? payload : savedEntry, err);
                resolve();
            });

        });
    },
    createNewEntityPhoto: (payload, url) => {
        return new Promise((resolve) => {

            EntityCollection.findOneAndUpdate({
                'entity.entity_id': payload.entity_id
            }, {
                '$push': {
                    'property_photos': {
                        'title': payload.snapshot_position,
                        'snapshot_position': payload.snapshot_position,
                        'url': url,
                        'location.coordinates': [],
                        'location.whatthreewords': ''
                    }
                }
            }).exec((err, data) => {
                logEntry('Entity Photo', err ? payload : savedEntry, err);
                resolve();
            });

        });
    },
    createNewProperty: (payload) => {
        return new Promise((resolve) => {
            const newEntry = new PropertyCollection({
                'document_owner': payload.document_owner,
                'property': payload.property,
                'contact': payload.contact,
                'location.coordinates': [payload.coordinates.longitude, payload.coordinates.latitude],
                'location.whatthreewords': '',
                'enumerator': payload.enumerator,
                'document_status': 1,
                'created': new Date(),
                'entities': payload.entities,
                'signature': payload.signature
            });

            newEntry.save().then((savedEntry, err) => {
                logEntry('Property', err ? payload : savedEntry, err);
                resolve();
            });

        });
    },
    createNewPropertyPhoto: (payload, url) => {
        return new Promise((resolve) => {

            PropertyCollection.findOneAndUpdate({
                'property.property_id': payload.property_id
            }, {
                '$push': {
                    'property_photos': {
                        'title': payload.snapshot_position,
                        'snapshot_position': payload.snapshot_position,
                        'url': url,
                        'location.coordinates': [],
                        'location.whatthreewords': ''
                    }
                }
            }).exec((err, data) => {
                logEntry('Property Photo', err ? payload : savedEntry, err);
                resolve();
            });

        });
    },
    createNewStreet: (payload) => {
        return new Promise((resolve) => {

            const newEntry = new StreetCollection({
                'document_owner': payload.document_owner,
                'street': payload.street,
                'location.coordinates': [payload.coordinates.longitude, payload.coordinates.latitude],
                'location.whatthreewords': '',
                'enumerator': payload.enumerator,
                'document_status': 1,
                'created': new Date(),
                'properties': payload.properties,
                'signature': payload.signature
            });

            newEntry.save().then((savedEntry, err) => {
                logEntry('Street', err ? payload : savedEntry, err);
                resolve();
            });

        });
    },
    createNewStreetPhoto: (payload, url) => {
        return new Promise((resolve) => {

            StreetCollection.findOneAndUpdate({
                'street.street_id': payload.street_id
            }, {
                '$push': {
                    'street_photos': {
                        'title': payload.snapshot_position,
                        'snapshot_position': payload.snapshot_position,
                        'url': url,
                        'location.coordinates': [],
                        'location.whatthreewords': ''
                    }
                }
            }).exec((err, data) => {
                logEntry('Street Photo', err ? payload : savedEntry, err);
                resolve();
            });

        });
    },
    errorLog: (req, res) => {
        res.status(200).send({ data: errorBox });
    },
    successLog: (req, res) => {
        res.status(200).send({ data: successBox });
    }

}

module.exports = appCollection;