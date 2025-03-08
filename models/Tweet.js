const mongoose = require('mongoose');

const TweetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to User model
        required: true
    },
    content: {
        type: String,
        required: true,
        maxlength: 280 // Twitter's character limit
    },
    image: {
        type: String, // Optional image URL
        default: ''
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Users who liked the tweet
    }],
    retweets: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Users who retweeted the tweet
    }],
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Tweet', TweetSchema);
