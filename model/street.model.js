var mongoose = require('mongoose');
var StreetSchema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

var streetSchema = new StreetSchema({
    document_owner: {
        type: ObjectId,
        ref: 'User'
    },
    street_photos: [{
        url: String,
        snapshot_position: String
    }],
    street: {
        street_id: { type: String, unique: true, required: true },
        gis_id: { type: String, unique: true, required: true },
        street_name: String,
        road_type: String,
        road_condition: String,
        road_carriage: String,
        refuse_disposal: String,
        drainage: String,
        electricity: String,
        area: String,
        location: String,
        lga: String,
        state: String,
        country: String,
        road_feature: [String],
        street_furniture: [String]
    },
    created: Date,
    properties: Number,
    location: {
        type: { type: String },
        coordinates: {
            latitude: Number,
            longitude: Number
        },
        whatthreewords: String
    },
    enumerator: {
        id: String,
        firstname: String,
        lastname: String,
        email: String,
        mobile: String
    },
    document_status: { type: Number, default: 1},
    signature: { type: String, default: '' }
});

module.exports = mongoose.model('StreetRecord', streetSchema, 'spider_streets');