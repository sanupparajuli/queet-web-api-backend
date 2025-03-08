const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const connectDB = require('./database/db');



// Load environment variables
require('dotenv').config();



// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve uploaded files as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/tweets', require('./routes/tweetRoutes')); // Include tweet routes
// Server Start
const PORT = 8080;

app.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
});

