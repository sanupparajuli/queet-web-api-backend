const mongoose = require("mongoose");
const Tweet = require("../models/Tweet"); // Import Tweet Model
const User = require("../models/User"); // Import User Model
require("dotenv").config();

describe("Tweet Model Test", () => {
  let userId; // Store a user ID for creating tweets

  beforeAll(async () => {
    // Connect to the test database
    await mongoose.connect(process.env.TEST_MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create a user for the test
    const user = new User({
      name: "Test User",
      username: "testuser",
      email: "testuser@gmail.com",
      password: "testpassword",
    });

    const savedUser = await user.save();
    userId = savedUser._id;
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase(); // Clear test database
    await mongoose.connection.close();
  });

  test("Should create & save a tweet successfully", async () => {
    const tweetData = {
      user: userId,
      content: "This is a test tweet!",
    };

    const tweet = new Tweet(tweetData);
    const savedTweet = await tweet.save();

    expect(savedTweet._id).toBeDefined();
    expect(savedTweet.user.toString()).toBe(userId.toString());
    expect(savedTweet.content).toBe(tweetData.content);
    expect(savedTweet.likes.length).toBe(0); // No likes initially
    expect(savedTweet.retweets.length).toBe(0); // No retweets initially
  });

  test("Should fail to save a tweet without user", async () => {
    const tweetData = {
      content: "This tweet should not be saved!",
    };

    const tweet = new Tweet(tweetData);
    let err;
    try {
      await tweet.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors.user).toBeDefined();
  });

  test("Should fail to save a tweet exceeding 280 characters", async () => {
    const longContent = "a".repeat(281); // Exceeding limit
    const tweetData = {
      user: userId,
      content: longContent,
    };

    const tweet = new Tweet(tweetData);
    let err;
    try {
      await tweet.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors.content).toBeDefined();
  });

  test(" Should allow a user to like a tweet", async () => {
    const tweet = new Tweet({ user: userId, content: "Like test tweet!" });
    const savedTweet = await tweet.save();

    // Simulate liking the tweet
    savedTweet.likes.push(userId);
    await savedTweet.save();

    const updatedTweet = await Tweet.findById(savedTweet._id);
    expect(updatedTweet.likes.length).toBe(1);
    expect(updatedTweet.likes[0].toString()).toBe(userId.toString());
  });

  test("Should allow a user to retweet", async () => {
    const tweet = new Tweet({ user: userId, content: "Retweet test!" });
    const savedTweet = await tweet.save();

    // Simulate retweeting
    savedTweet.retweets.push(userId);
    await savedTweet.save();

    const updatedTweet = await Tweet.findById(savedTweet._id);
    expect(updatedTweet.retweets.length).toBe(1);
    expect(updatedTweet.retweets[0].toString()).toBe(userId.toString());
  });

  test(" Should delete a tweet successfully", async () => {
    const tweet = new Tweet({ user: userId, content: "Delete test tweet!" });
    const savedTweet = await tweet.save();

    await Tweet.findByIdAndDelete(savedTweet._id);
    const deletedTweet = await Tweet.findById(savedTweet._id);
    expect(deletedTweet).toBeNull();
  });
});
