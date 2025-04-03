const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');



const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'master-admin'],
    default: 'admin'
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

// ... existing pre-save hook for password hashing ...

module.exports = mongoose.model('Admin', adminSchema);