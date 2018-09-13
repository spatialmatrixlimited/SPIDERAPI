var mongoose = require('mongoose');
var PropertyPhotoSchema = mongoose.Schema;

var propertyPhotoSchema = new PropertyPhotoSchema({
    property: {
        property_id: {
            type: String,
            index: true
        },
        street_id : {
            type: String,
            index: true
        },
        building_serial_number : {
            type: String,
            index: true
        }
    },
    property_photos: [{
        snapshot_position: String,
        url: String
    }],
    created: {
        type: Date
    },
    signature: { type: String, default: '' }
});

module.exports = mongoose.model('PropertyPhoto', propertyPhotoSchema, 'property_photos');