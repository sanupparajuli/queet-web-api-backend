const express = require('express');
const { retweet, unretweet } = require('../controllers/retweetController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/:tweetId', protect, retweet);
router.delete('/:tweetId', protect, unretweet);

module.exports = router;
