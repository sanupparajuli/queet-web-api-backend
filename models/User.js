const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    profile_picture: {
        type: String, // Store URL or file path
        default: ""
    },
    bio: {
        type: String,
        maxlength: 160, // Twitter bio limit
        default: ""
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Self-referencing for followers
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Self-referencing for following
    }],
    created_at: {
        type: Date,
        default: Date.now
    }
});

// Create and export User model
module.exports = mongoose.model('User', UserSchema);
