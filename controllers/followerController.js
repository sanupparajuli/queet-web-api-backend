const Follower = require('../models/Follower');

/**
 * @desc Follow a user
 * @route POST /api/followers/:userId
 * @access Private
 */
exports.followUser = async (req, res) => {
    try {
        const followerId = req.user.userId;
        const followingId = req.params.userId;

        if (followerId === followingId) return res.status(400).json({ message: 'You cannot follow yourself' });

        const existingFollow = await Follower.findOne({ follower: followerId, following: followingId });
        if (existingFollow) return res.status(400).json({ message: 'Already following this user' });

        const follow = new Follower({ follower: followerId, following: followingId });
        await follow.save();

        res.status(201).json({ message: 'User followed', follow });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * @desc Unfollow a user
 * @route DELETE /api/followers/:userId
 * @access Private
 */
exports.unfollowUser = async (req, res) => {
    try {
        const followerId = req.user.userId;
        const followingId = req.params.userId;

        const follow = await Follower.findOneAndDelete({ follower: followerId, following: followingId });
        if (!follow) return res.status(400).json({ message: 'Not following this user' });

        res.status(200).json({ message: 'User unfollowed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
