const EntityCollection = require('../model/app.entity.model');
const PropertyCollection = require('../model/app.property.model');
const StreetCollection = require('../model/app.street.model');

const controller = {
    bulkInsertEntity: (payload) => {
        return new Promise((resolve, reject) => {
            EntityCollection.insertMany(payload, (err, uniques) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(uniques);
                }
            });

        });
    },
    bulkInsertProperty: (payload) => {
        return new Promise((resolve, reject) => {
            PropertyCollection.insertMany(payload, (err, uniques) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(uniques);
                }
            });

        });
    },

    bulkInsertStreet: (payload) => {
        return new Promise((resolve, reject) => {
            StreetCollection.insertMany(payload, (err, uniques) => {
                if (err) {
                    reject(err);
                } else {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(uniques);
                    }
                }
            });

        });
    }
}

module.exports = controller;