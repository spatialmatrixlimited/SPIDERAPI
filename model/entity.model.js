var mongoose = require('mongoose');
var EntitySchema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

var entitySchema = new EntitySchema(
    {
        document_owner: {
            type: ObjectId,
            ref: 'User'
        },
        property_id: String,
        building_serial_number: String,
        entity: {
            boys_quarter: Number,
            meter_number: String,
            entity_group: String,
            entity_name: String,
            meter_available: Boolean,
            meter_condition: String,
            meter_phases: String,
            entity_id: String,
            entity_category: String,
            meter_type: String,
            has_signage: Boolean
        },
        location: {
            whatthreewords: String,
            coordinates: {
                latitude: Number,
                longitude: Number
            },
            type: {type: String}
        },
        document_owner: String,
        enumerator: {
            id: String,
            firstname: String,
            lastname: String,
            mobile: String,
            email: String
        },
        contact: {
            contact_person: String,
            telephone: String,
            email: String
        },
        property_photos: [{
            url: String,
            snapshot_position: String
        }],
        document_status: { type: Number, default: 1},
        created: Date,
        modified: Date,
        signature: { type: String, default: '' }
    }
);

module.exports = mongoose.model('EntityRecord', entitySchema, 'spider_entities');