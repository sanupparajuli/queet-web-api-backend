const request = require('supertest');
const app = require('../server'); // Import the Express app
const mongoose = require('mongoose');
const Retweet = require('../models/Retweet');
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
        content: 'This is a test tweet for retweeting!'
    });
    await tweet.save();
    tweetId = tweet._id;
});

afterAll(async () => {
    await Retweet.deleteMany({});
    await Tweet.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
});

describe('Retweet API Tests', () => {
    test('Should successfully retweet a tweet', async () => {
        const res = await request(app)
            .post(`/api/tweets/${tweetId}/retweet`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe('Tweet retweeted successfully');
        expect(res.body.retweet).toHaveProperty('user', userId.toString());
        expect(res.body.retweet).toHaveProperty('tweet', tweetId.toString());
    });

    test('Should not allow duplicate retweets', async () => {
        const res = await request(app)
            .post(`/api/tweets/${tweetId}/retweet`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Tweet already retweeted');
    });

    test('Should successfully unretweet a tweet', async () => {
        const res = await request(app)
            .delete(`/api/tweets/${tweetId}/unretweet`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Retweet removed successfully');
    });

    test(' Should not unretweet a non-existent retweet', async () => {
        const res = await request(app)
            .delete(`/api/tweets/${tweetId}/unretweet`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('Retweet not found');
    });

    test('Should not allow unauthorized users to retweet', async () => {
        const res = await request(app)
            .post(`/api/tweets/${tweetId}/retweet`);

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('Unauthorized');
    });
});
