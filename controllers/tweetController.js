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

/**
 * @desc Get a single tweet by ID
 * @route GET /api/tweets/:id
 * @access Public
 */
exports.getTweetById = async (req, res) => {
    try {
        const tweet = await Tweet.findById(req.params.id).populate('user', 'name username profile_picture');
        if (!tweet) {
            return res.status(404).json({ message: 'Tweet not found' });
        }
        res.status(200).json(tweet);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * @desc Update a tweet (only by the owner)
 * @route PUT /api/tweets/:id
 * @access Private
 */
exports.updateTweet = async (req, res) => {
    try {
        const { content, image } = req.body;
        let tweet = await Tweet.findById(req.params.id);

        if (!tweet) {
            return res.status(404).json({ message: 'Tweet not found' });
        }

        // Ensure only the owner can update the tweet
        if (tweet.user.toString() !== req.user.userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Update fields
        tweet.content = content || tweet.content;
        tweet.image = image || tweet.image;
        await tweet.save();

        res.status(200).json({ message: 'Tweet updated successfully', tweet });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * @desc Delete a tweet (only by the owner)
 * @route DELETE /api/tweets/:id
 * @access Private
 */
