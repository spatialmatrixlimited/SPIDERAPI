let path = require('path');
loki = require('lokijs')

let signatures;
const signatureStorage = path.resolve(__dirname, '../../db/signatures.db.json');

let databaseInitialize = {
    EMAIL: () => {
        signatures = SIGNATURES.getCollection("signatures")
        if (signatures === null) {
            signatures = SIGNATURES.addCollection('signatures', {
                indices: ['id']
            });
        }
    }
}


let SIGNATURES = new loki(signatureStorage, {
    autoload: true,
    autoloadCallback: databaseInitialize.EMAIL,
    autosave: true,
    autosaveInterval: 5000
});

module.exports = signatures;

