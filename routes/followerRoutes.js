const express = require('express');
const { followUser, unfollowUser } = require('../controllers/followerController'); // Ensure correct import
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/:userId', protect, followUser); // Follow a user
router.delete('/:userId', protect, unfollowUser); // Unfollow a user

module.exports = router;
