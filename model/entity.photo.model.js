var mongoose = require('mongoose');
var EntityPhotoSchema = mongoose.Schema;

var entityPhotoSchema = new EntityPhotoSchema({
    entity: {
        entity_id : {
            type: String,
            index: true
        },
        property_id: {
            type: String,
            index: true
        },
        building_serial_number: {
            type: String,
            index: true
        }
    },
    property_photos: [{
        snapshot_position: String,
        url: String
    }],
    created: {
        type: Date, default: Date.now
    },
    signature: { type: String, default: '' }
});

module.exports = mongoose.model('EntityPhoto', entityPhotoSchema, 'entity_photos');