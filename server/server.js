    // server/server.js
    // Testing database connection and session/passport initialization

    const express = require('express');
    const mongoose = require('mongoose');
    const dotenv = require('dotenv');
    const cors = require('cors');
    const passport = require('passport');
    const session = require('express-session');
    const MongoStore = require('connect-mongo');
    const path = require('path'); // Import path module

    // Load environment variables from .env file
    dotenv.config();

    // Import Passport configuration (needed for passport.initialize/session)
    require('./config/passport-setup');

    const app = express();
    const PORT = process.env.PORT || 5000;

    // --- Middleware ---
    app.use(cors({
        origin: 'http://localhost:8000', // Keep for local development
        credentials: true
    }));
    app.use(express.json());

    // Session middleware for Passport (using connect-mongo)
    app.use(session({
        secret: process.env.SESSION_SECRET || 'your_session_secret',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI,
            collectionName: 'sessions',
            ttl: 24 * 60 * 60 // Session TTL in seconds, 1 day
        }),
        cookie: {
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true
        }
    }));

    // Initialize Passport and session
    app.use(passport.initialize());
    app.use(passport.session());

    // --- Database Connection ---
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log('MongoDB connected successfully!'))
        .catch(err => console.error('MongoDB connection error:', err));

    // --- Serve Frontend Static Files ---
    app.use(express.static(path.join(__dirname, '..', 'public')));

    // --- Catch-all route for SPA ---
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
    });

    // --- Start Server ---
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
    