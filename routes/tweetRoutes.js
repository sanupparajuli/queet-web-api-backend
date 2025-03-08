const express = require('express');
const { createTweet, getAllTweets, getTweetById, updateTweet, deleteTweet } = require('../controllers/tweetController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Routes
router.post('/create_tweet', protect, createTweet); // Create a tweet
router.get('/show_tweet', getAllTweets); // Get all tweets
ule.exports = router;
