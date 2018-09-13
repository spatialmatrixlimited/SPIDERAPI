var mongoose = require('mongoose');
var BSNSchema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

var bsnSchema = new BSNSchema({
  bsn : { type: Number, unique: true, required: true },
  assigned: { type: Boolean, default: false },
  user: { type: ObjectId, ref: 'User', required: false },
  used : { type: Boolean, default: false },
  created : { type: Date, default: Date.now },
  modified: Date
});

module.exports = mongoose.model('BSN', bsnSchema,'bsn');
