const request = require('supertest');
const app = require('../server'); // Import the Express app
const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Tweet = require('../models/Tweet');
const jwt = require('jsonwebtoken');

let userToken, userId, tweetId, commentId;

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
    await Comment.deleteMany({});
    await Tweet.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
});

describe('Comment API Tests', () => {
    test('Should successfully add a comment to a tweet', async () => {
        const res = await request(app)
            .post(`/api/tweets/${tweetId}/comment`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ content: 'This is a test comment' });

        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe('Comment added successfully');
        expect(res.body.comment).toHaveProperty('user', userId.toString());
        expect(res.body.comment).toHaveProperty('tweet', tweetId.toString());
        expect(res.body.comment.content).toBe('This is a test comment');

        commentId = res.body.comment._id;
    });

    test('Should not allow adding a comment without content', async () => {
        const res = await request(app)
            .post(`/api/tweets/${tweetId}/comment`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({});

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Comment content is required');
    });

    test('Should fetch all comments for a tweet', async () => {
        const res = await request(app)
            .get(`/api/tweets/${tweetId}/comments`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.comments)).toBe(true);
        expect(res.body.comments.length).toBeGreaterThanOrEqual(1);
    });

    test('Should delete a comment successfully', async () => {
        const res = await request(app)
            .delete(`/api/tweets/${tweetId}/comment/${commentId}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Comment deleted successfully');
    });

    test('Should not delete a non-existent comment', async () => {
        const res = await request(app)
            .delete(`/api/tweets/${tweetId}/comment/${commentId}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('Comment not found');
    });

    test('Should not allow unauthorized users to comment', async () => {
        const res = await request(app)
            .post(`/api/tweets/${tweetId}/comment`)
            .send({ content: 'Unauthorized comment' });

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('Unauthorized');
    });
});
