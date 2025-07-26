// server/routes/authRoutes.js
// Routes for user authentication

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');

// Helper function to generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h', // Token expires in 1 hour
    });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        user = new User({ email, password });
        await user.save();

        const token = generateToken(user._id);
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if user has a local password (not Google registered)
        if (!user.password) {
            return res.status(400).json({ message: 'This email is registered via Google. Please use Google login.' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user._id);
        res.json({
            message: 'Logged in successfully',
            token,
            user: {
                id: user._id,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// @route   GET /api/auth/google
// @desc    Authenticate with Google
// @access  Public
router.get('/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'] // Request profile and email information
    })
);

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback route
// @access  Public
router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: 'http://localhost:8000/index.html?authStatus=failed', // Redirect on failure
        session: false // We are using JWTs, so no need for session after auth
    }),
    (req, res) => {
        // Successful authentication, generate JWT and redirect
        const token = generateToken(req.user.id);
        // Redirect to frontend with token in URL (or set as cookie)
        // For simplicity, we'll pass it in the URL hash, frontend JS will pick it up
        res.redirect(`http://localhost:8000/index.html#token=${token}&email=${req.user.email}`);
    }
);

// @route   GET /api/auth/user
// @desc    Get current authenticated user details
// @access  Private (requires JWT)
router.get('/user', passport.authenticate('jwt', { session: false }), (req, res) => {
    // req.user is populated by the JWT strategy
    res.json({
        id: req.user.id,
        email: req.user.email
    });
});

// @route   GET /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Public (but typically triggered after client-side action)
router.get('/logout', (req, res) => {
    // For JWT based authentication, logout is primarily handled on the client-side
    // by removing the token. This endpoint can be used for session-based logout
    // or to clear any server-side session data if applicable.
    req.logout((err) => { // Passport's logout method
        if (err) { return next(err); }
        res.json({ message: 'Logged out successfully' });
    });
});


module.exports = router;
