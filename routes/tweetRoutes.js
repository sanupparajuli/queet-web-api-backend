const express = require('express');
const { createTweet, getAllTweets, getTweetById, updateTweet, deleteTweet } = require('../controllers/tweetController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Routes
router.post('/create_tweet', protect, createTweet); // Create a tweet
router.get('/show_tweet', getAllTweets); // Get all tweets
router.get('/:id', getTweetById); // Get a specific tweet
router.put('/:id', protect, updateTweet); // Update a tweet
router.delete('/:id', protect, deleteTweet); // Delete a tweet

module.exports = router;
