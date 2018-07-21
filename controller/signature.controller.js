let path = require('path');
loki = require('lokijs')

let _signatures = ()=>{
    let signatures;
    const signatureStorage = path.resolve(__dirname, '../../db/signatures.db.json');

    let databaseInitialize = {
        SIGNATURE: () => {
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
        autoloadCallback: databaseInitialize.SIGNATURE,
        autosave: true,
        autosaveInterval: 5000
    });

    return signatures;
};


module.exports = _signatures;

