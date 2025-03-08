const request = require('supertest');
const app = require('../server'); // Import the Express app
const mongoose = require('mongoose');
const Follower = require('../models/Follower');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

let userToken, followerId, followingId;

beforeAll(async () => {
    // Connect to the test database
    await mongoose.connect(process.env.TEST_MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    // Create test users
    const follower = new User({
        name: 'Follower User',
        username: 'followerUser',
        email: 'follower@example.com',
        password: 'password123'
    });
    await follower.save();
    followerId = follower._id;

    const following = new User({
        name: 'Following User',
        username: 'followingUser',
        email: 'following@example.com',
        password: 'password123'
    });
    await following.save();
    followingId = following._id;

    // Generate JWT token for authentication
    userToken = jwt.sign({ userId: follower._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
    await Follower.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
});

describe('Follower API Tests', () => {
    test('Should successfully follow a user', async () => {
        const res = await request(app)
            .post(`/api/users/${followingId}/follow`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe('User followed successfully');
        expect(res.body.follower).toHaveProperty('follower', followerId.toString());
        expect(res.body.follower).toHaveProperty('following', followingId.toString());
    });

    test('Should not allow duplicate follows', async () => {
        const res = await request(app)
            .post(`/api/users/${followingId}/follow`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('User already followed');
    });

    test('Should successfully unfollow a user', async () => {
        const res = await request(app)
            .delete(`/api/users/${followingId}/unfollow`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('User unfollowed successfully');
    });

    test('Should not unfollow a user that is not followed', async () => {
        const res = await request(app)
            .delete(`/api/users/${followingId}/unfollow`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('Follow relationship not found');
    });

    test('Should not allow unauthorized users to follow', async () => {
        const res = await request(app)
            .post(`/api/users/${followingId}/follow`);

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('Unauthorized');
    });
});
