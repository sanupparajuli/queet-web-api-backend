const Like = require('../models/Like');
const Tweet = require('../models/Tweet');
console.log('🔍 Like Model:', Like); // Add this debug log

exports.likeTweet = async (req, res) => {
    try {
        console.log('🔍 Checking req.user:', req.user);

        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const tweetId = req.params.tweetId;
        const userId = req.user.userId;

        console.log('🔍 Checking Tweet ID:', tweetId);
        console.log('🔍 Checking User ID:', userId);

        // Debugging: Check if Like model exists
        console.log('🔍 Like Model:', Like);

        // Check if tweet exists
        const tweet = await Tweet.findById(tweetId);
        if (!tweet) {
            return res.status(404).json({ message: 'Tweet not found' });
        }

        // Check if the user has already liked the tweet
        const existingLike = await Like.findOne({ user: userId, tweet: tweetId });
        console.log('🔍 Existing Like:', existingLike);

        if (existingLike) {
            return res.status(400).json({ message: 'Tweet already liked' });
        }

        // Create a new like
        const like = new Like({ user: userId, tweet: tweetId });
        await like.save();

        // Add user to tweet's like array
        tweet.likes.push(userId);
        await tweet.save();

        console.log('✅ Tweet Liked Successfully:', like);
        res.status(201).json({ message: 'Tweet liked', like });

    } catch (error) {
        console.error('❌ Error in likeTweet:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
