const mongoose = require("mongoose");
const User = require("../models/User"); // Import the User model
require("dotenv").config();

describe("User Model Test", () => {
  beforeAll(async () => {
    // Connect to a test database
    await mongoose.connect(process.env.TEST_MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test(" Should create & save a user successfully", async () => {
    const userData = {
      name: "John Doe",
      username: "johndoe123",
      email: "johndoe@gmail.com",
      password: "securepassword",
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.name).toBe(userData.name);
    expect(savedUser.username).toBe(userData.username);
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.password).toBe(userData.password); // ⚠️ Ideally, password should be hashed
  });

  test(" Should not save user without required fields", async () => {
    const user = new User({});
    let err;
    try {
      await user.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
  });

  test(" Should not allow duplicate usernames", async () => {
    const userData = {
      name: "Jane Doe",
      username: "johndoe123", // Duplicate username
      email: "janedoe@gmail.com",
      password: "securepassword",
    };

    const user = new User(userData);
    let err;
    try {
      await user.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.code).toBe(11000); // MongoDB duplicate key error
  });
});
