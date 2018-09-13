
let path = require('path');
loki = require('lokijs')

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


let isSigned = (dataSignature)=> {
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

let sign = (dataSignature, id) => {
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