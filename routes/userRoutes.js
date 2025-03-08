const express = require('express');
const { registerUser, loginUser, getUserProfile, updateProfilePicture, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Import Multer

const router = express.Router();

// Register & Login Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Profile Routes
router.get('/profile', protect, getUserProfile);
router.put('/profile-picture', protect, upload.single('profile_picture'), updateProfilePicture);
router.put('/update_profile', protect, updateUserProfile);

module.exports = router;
