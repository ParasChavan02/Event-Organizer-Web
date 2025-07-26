// server/server.js
// Main entry point for the Express application

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

// Import route files
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');

// Import Passport configuration
require('./config/passport-setup');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
// CORS configuration: Allow requests from your local frontend.
// For deployment, if both frontend and backend are on the same domain,
// you can remove the 'origin' property or simplify to app.use(cors()).
// If frontend is on a different domain, replace 'http://localhost:8000'
// with your deployed frontend URL (e.g., 'https://your-netlify-site.netlify.app').
app.use(cors({
    origin: 'http://localhost:8000', // Keep this for local development
    credentials: true
}));

// Parse JSON request bodies
app.use(express.json());

// Session middleware for Passport (using connect-mongo for production-readiness)
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
        secure: process.env.NODE_ENV === 'production', // Set to true in production
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

// --- API Routes ---
// IMPORTANT: These routes MUST be defined FIRST, before any static file serving
// or catch-all routes, so that API requests are handled correctly by the backend.
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

// --- Serve Frontend Static Files ---
// IMPORTANT: This middleware MUST come AFTER API routes.
// It serves all static files (HTML, CSS, JS, images) from the 'public' directory.
// If a requested file (like /js/script.js or /css/style.css) exists in 'public',
// this middleware will serve it.
app.use(express.static(path.join(__dirname, '..', 'public')));

// --- Catch-all route for Single Page Application (SPA) ---
// IMPORTANT: This route MUST be the VERY LAST route definition in your server.js.
// If a request does NOT match any of the API routes AND does NOT match any static files
// in the 'public' directory, then this route will serve the 'index.html'.
// This is crucial for client-side routing (e.g., if you navigate to /create-event directly).
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});


// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
