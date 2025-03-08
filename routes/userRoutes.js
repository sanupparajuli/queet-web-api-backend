const express = require('express');
const { registerUser, loginUser, getUserProfile, updateProfilePicture, updateUserProfile } = require('../controllers/userController');

const router = express.Router();

// Register & Login Routes
router.post('/register', registerUser);
router.post('/login', loginUser);


module.exports = router;
