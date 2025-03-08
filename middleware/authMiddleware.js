const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
    let token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // Handle "Bearer" prefix
        if (token.startsWith('Bearer ')) {
            token = token.split(' ')[1];
        }

        console.log('🔹 Received Token:', token); // Debugging line

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded Token:', decoded); // Debugging line

        req.user = decoded; // Attach user info to request
        next();
    } catch (error) {
        console.error('JWT Verification Error:', error.message);
        res.status(401).json({ message: 'Invalid token' });
    }
};
