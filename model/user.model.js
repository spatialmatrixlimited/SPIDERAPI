var mongoose = require('mongoose');
var UserSchema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;
var userSchema = new UserSchema({
  document_owner: {
    type: ObjectId,
    ref: 'User'
  },
  playerid: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  personal: {
    firstname: {
      type: String,
      default: ''
    },
    lastname: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      lowercase: true
    },
    mobile: {
      type: String,
      default: ''
    },
    gender: {
      type: String,
      default: ''
    }
  },
  organisation: {
    name: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      lowercase: true
    },
    mobile: {
      type: String,
      default: ''
    }
  },
  security: {
    user_type: { type: String, default: 'Individual' },
    role: String,
    is_active: {
      type: Boolean,
      default: true
    },
    accesskey: String,
    accesscode: String
  },
  conversations: [{
    with: String,
    conversationId: String,
    created_on: {
      type: Date,
      default: Date.now
    }
  }],
  documentstatus: {
    type: Number,
    default: 1
  },
  created_on: {
    type: Date
  },
  last_seen: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema, 'users');