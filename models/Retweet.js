const mongoose = require('mongoose');

const RetweetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tweet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tweet',
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

// Prevent duplicate retweets by the same user
RetweetSchema.index({ user: 1, tweet: 1 }, { unique: true });

module.exports = mongoose.model('Retweet', RetweetSchema);
