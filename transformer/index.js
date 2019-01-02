const Entity = require('../model/entity.model');
const Property = require('../model/property.model');
const Street = require('../model/street.model');
const controller = require('./transformer.controller');
const adapter = require('./adapter');

exports.transformEntity = () => {
    console.log('Getting Entities');
    return new Promise((resolve, reject)=>{
        Entity.find({
            created: {
                $gte: new Date("2018-12-08T00:00:00.000Z"),
                $lt: new Date("2018-12-31T00:00:00.000Z")
            }
        },(err, docs)=>{
            console.log('Entities Received');
            if(err){
                reject(err);
            } else {
                adapter(docs, 'entity').then(bulkDoc=>{
                    controller.bulkInsertEntity(bulkDoc).then(result=>{
                        resolve(result);
                    }).catch(err=>{
                        reject(err);
                    });
                });
            }
        });
    });
}

exports.transformProperty = () => {
    console.log('Getting Properties');
    return new Promise((resolve, reject)=>{
        Property.find({
            created: {
                $gte: new Date("2018-12-08T00:00:00.000Z"),
                $lt: new Date("2018-12-31T00:00:00.000Z")
            }
        },(err, docs)=>{
            console.log('Streets Properties');
            if(err){
                reject(err);
            } else {
                adapter(docs, 'property').then(bulkDoc=>{
                    controller.bulkInsertProperty(bulkDoc).then(result=>{
                        resolve(result);
                    }).catch(err=>{
                        reject(err);
                    });
                });
            }
        });
    });
}

exports.transformStreet = () => {
    console.log('Getting Streets');
    return new Promise((resolve, reject)=>{
        Street.find({
            created: {
                $gte: new Date("2018-12-08T00:00:00.000Z"),
                $lt: new Date("2018-12-31T00:00:00.000Z")
            }
        },(err, docs)=>{
            console.log('Streets Received');
            if(err){
                reject(err);
            } else {
                adapter(docs, 'street').then(bulkDoc=>{
                    controller.bulkInsertStreet(bulkDoc).then(result=>{
                        resolve(result);
                    }).catch(err=>{
                        reject(err);
                    });
                });
            }
        });
    });
}