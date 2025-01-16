// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  subscription: {
    type: Boolean,
    default: false, 
  },
  resetToken: String,
  resetTokenExpiration: Date,
});

// Add method to generate reset token
UserSchema.methods.generatePasswordResetToken = function() {
    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token and set to resetToken field
    this.resetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
  
    // Set expiration (15 minutes)
    this.resetTokenExpiration = Date.now() + 15 * 60 * 1000;
  
    return resetToken;
  };
  
  // Existing methods remain the same
  UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  });
  
  UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };
  
  module.exports = mongoose.model('User', UserSchema);
  
