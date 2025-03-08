const Tweet = require('../models/Tweet');

exports.createTweet = async (req, res) => {
    try {
        const { content, image } = req.body;

        if (!content || content.length > 280) {
            return res.status(400).json({ message: 'Tweet content is required and should be within 280 characters' });
        }

        const tweet = new Tweet({
            user: req.user.userId, // Authenticated user
            content,
            image
        });

        await tweet.save();
        res.status(201).json({ message: 'Tweet created successfully', tweet });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


/**
 * @desc Get all tweets
 * @route GET /api/tweets
 * @access Public
 */
exports.getAllTweets = async (req, res) => {
    try {
        const tweets = await Tweet.find().populate('user', 'name username profile_picture').sort({ created_at: -1 });
        res.status(200).json(tweets);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};