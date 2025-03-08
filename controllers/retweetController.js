const Retweet = require('../models/Retweet');
const Tweet = require('../models/Tweet');

/**
 * @desc Retweet a tweet
 * @route POST /api/retweets/:tweetId
 * @access Private
 */
exports.retweet = async (req, res) => {
    try {
        const tweetId = req.params.tweetId;
        const userId = req.user.userId;

        const tweet = await Tweet.findById(tweetId);
        if (!tweet) return res.status(404).json({ message: 'Tweet not found' });

        const existingRetweet = await Retweet.findOne({ user: userId, tweet: tweetId });
        if (existingRetweet) return res.status(400).json({ message: 'Tweet already retweeted' });

        const retweet = new Retweet({ user: userId, tweet: tweetId });
        await retweet.save();

        res.status(201).json({ message: 'Tweet retweeted', retweet });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
