
const path = require('path');
const loki = require('lokijs')

var signatures;
const signatureStorage = path.resolve(__dirname, '../../db/signatures.db.json');

const databaseInitialize = {
  SIGNATURE: () => {
    signatures = SIGNATURES.getCollection("signatures")
    if (signatures === null) {
      signatures = SIGNATURES.addCollection('signatures', {
        indices: ['id']
      });
    }
  }
}


const SIGNATURES = new loki(signatureStorage, {
  autoload: true,
  autoloadCallback: databaseInitialize.SIGNATURE,
  autosave: true,
  autosaveInterval: 5000
});


const isSigned = (dataSignature)=> {
    return new Promise((resolve)=>{
        let _signatures = [];
        _signatures = signatures.find({
          'signature': dataSignature
        });
        if (_signatures.length > 0) {
          resolve(true)
        } else {
            resolve(false);
        }
    });
}

const sign = (dataSignature, id) => {
    return new Promise((resolve)=>{
        signatureData = signatures.insert({
            'id': id,
            'signature': dataSignature
          });
          resolve(true);
    });
}

exports.isSigned = isSigned;
exports.sign = sign;