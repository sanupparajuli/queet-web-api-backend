const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
require('dotenv').config();

/**
 * @desc Register a new user
 * @route POST /api/users/register
 * @access Public
 */
exports.registerUser = async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        user = new User({
            name,
            username,
            email,
            password: hashedPassword
        });

        // Save user to database
        await user.save();

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d' // Token expires in 7 days
        });

        res.status(201).json({ message: 'User registered successfully', token });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * @desc Login user
 * @route POST /api/users/login
 * @access Public
 */
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * @desc Get authenticated user profile
 * @route GET /api/users/profile
 * @access Private
 */
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password'); // Exclude password
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * @desc Update profile picture
 * @route PUT /api/users/profile-picture
 * @access Private
 */
exports.updateProfilePicture = async (req, res) => {
    try {
        const userId = req.user.userId; // Authenticated user ID from JWT middleware
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a valid image' });
        }

        // Find user by ID
        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Optional: Delete previous profile picture (if needed)
        if (user.profile_picture) {
            const oldImagePath = `uploads/${user.profile_picture}`;
            fs.unlink(oldImagePath, (err) => {
                if (err) console.log('Old profile picture not deleted:', err);
            });
        }

        // Update profile picture in database
        user.profile_picture = req.file.filename;
        await user.save();

        res.status(200).json({
            message: 'Profile picture updated successfully',
            profile_picture: req.file.filename
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, username, email, bio } = req.body;

        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update only the fields provided
        if (name) user.name = name;
        if (username) user.username = username;
        if (email) user.email = email;
        if (bio) user.bio = bio;

        await user.save();

        res.status(200).json({
            message: 'Profile updated successfully',
            user
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
