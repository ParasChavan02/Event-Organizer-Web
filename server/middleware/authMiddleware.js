// server/middleware/authMiddleware.js
// Middleware to verify JWT token and attach user to request

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// This middleware is now less critical as Passport JWT strategy handles it,
// but it's good to keep for understanding or if you want a custom JWT verification.
// For this setup, `passport.authenticate('jwt', { session: false })` is used directly in routes.

// Example of a custom JWT middleware (not used if Passport JWT is used directly)
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach user to the request object
            req.user = await User.findById(decoded.id).select('-password'); // Exclude password
            next();
        } catch (error) {
            console.error('Token verification failed:', error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// module.exports = { protect }; // If you were to use this custom middleware
