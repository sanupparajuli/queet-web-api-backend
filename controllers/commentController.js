const Comment = require('../models/Comment');

/**
 * @desc Add a comment to a tweet
 * @route POST /api/comments/:tweetId
 * @access Private
 */
exports.addComment = async (req, res) => {
    try {
        const { content } = req.body;
        const tweetId = req.params.tweetId;
        const userId = req.user.userId;

        if (!content) return res.status(400).json({ message: 'Comment content is required' });

        const comment = new Comment({ user: userId, tweet: tweetId, content });
        await comment.save();

        res.status(201).json({ message: 'Comment added', comment });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
