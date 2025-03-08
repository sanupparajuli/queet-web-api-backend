const express = require('express');
const { likeTweet, unlikeTweet, getLikesForTweet } = require('../controllers/likeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/:tweetId', protect, likeTweet); // Like a tweet
router.delete('/:tweetId', protect, unlikeTweet); // Unlike a tweet
router.get('/:tweetId', getLikesForTweet); // Get all likes for a tweet

module.exports = router;
