// server/models/User.js
// Mongoose model for User

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/.+@.+\..+/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        // Password is not required if logging in via Google
        // It will be set if user registers locally
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true // Allows multiple documents to have null googleId
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving the user (only if password is provided)
UserSchema.pre('save', async function(next) {
    if (this.isModified('password') && this.password) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// Method to compare passwords
UserSchema.methods.matchPassword = async function(enteredPassword) {
    if (!this.password) return false; // No password to compare if Google login
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
