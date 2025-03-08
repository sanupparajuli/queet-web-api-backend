const request = require('supertest');
const app = require('../server'); // Import the Express app
const mongoose = require('mongoose');
const Like = require('../models/Like');
const User = require('../models/User');
const Tweet = require('../models/Tweet');
const jwt = require('jsonwebtoken');

let userToken, userId, tweetId;

beforeAll(async () => {
    // Connect to the test database
    await mongoose.connect(process.env.TEST_MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    // Create a test user
    const user = new User({
        name: 'Test User',
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123'
    });
    await user.save();
    userId = user._id;

    // Generate JWT token for authentication
    userToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Create a test tweet
    const tweet = new Tweet({
        user: userId,
        content: 'This is a test tweet!'
    });
    await tweet.save();
    tweetId = tweet._id;
});

afterAll(async () => {
    await Like.deleteMany({});
    await Tweet.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
});

describe('Like API Tests', () => {
    test('Should successfully like a tweet', async () => {
        const res = await request(app)
            .post(`/api/tweets/${tweetId}/like`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe('Tweet liked successfully');
        expect(res.body.like).toHaveProperty('user', userId.toString());
        expect(res.body.like).toHaveProperty('tweet', tweetId.toString());
    });

    test('Should not allow duplicate likes', async () => {
        const res = await request(app)
            .post(`/api/tweets/${tweetId}/like`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Tweet already liked');
    });

    test('Should successfully unlike a tweet', async () => {
        const res = await request(app)
            .delete(`/api/tweets/${tweetId}/unlike`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Like removed successfully');
    });

    test('Should not unlike a tweet that is not liked', async () => {
        const res = await request(app)
            .delete(`/api/tweets/${tweetId}/unlike`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('Like not found');
    });

    test('Should not allow unauthorized users to like a tweet', async () => {
        const res = await request(app)
            .post(`/api/tweets/${tweetId}/like`);

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('Unauthorized');
    });
});
