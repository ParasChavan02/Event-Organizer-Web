    // server/config/passport-setup.js
    // Passport.js configuration for local and Google OAuth strategies

    const passport = require('passport');
    const LocalStrategy = require('passport-local').Strategy;
    const GoogleStrategy = require('passport-google-oauth20').Strategy;
    const JwtStrategy = require('passport-jwt').Strategy;
    const ExtractJwt = require('passport-jwt').ExtractJwt;
    const User = require('../models/User');
    const dotenv = require('dotenv');

    dotenv.config(); // Ensure environment variables are loaded

    // Define the base URL for your deployed application
    // Use process.env.RENDER_EXTERNAL_URL if available (Render's default env var)
    // Otherwise, fallback to a hardcoded local URL for development
    const BASE_URL = process.env.RENDER_EXTERNAL_URL || 'http://localhost:8000';

    // --- Local Strategy (for email/password login) ---
    passport.use(new LocalStrategy({
        usernameField: 'email' // Use email as the username field
    }, async (email, password, done) => {
        try {
            const user = await User.findOne({ email });

            if (!user) {
                return done(null, false, { message: 'Incorrect email or password.' });
            }
            // If user exists but has no password (e.g., Google registered), prevent local login
            if (!user.password) {
                return done(null, false, { message: 'This email is registered via Google. Please use Google login.' });
            }

            const isMatch = await user.matchPassword(password);
            if (!isMatch) {
                return done(null, false, { message: 'Invalid credentials' });
            }

            return done(null, user); // User authenticated successfully
        } catch (error) {
            return done(error);
        }
    }));

    // --- Google OAuth Strategy ---
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        // UPDATED: Construct absolute callback URL using BASE_URL
        callbackURL: `${BASE_URL}/api/auth/google/callback`
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user already exists in our DB
            let currentUser = await User.findOne({ googleId: profile.id });

            if (currentUser) {
                // User already exists, log them in
                done(null, currentUser);
            } else {
                // User does not exist, create a new user
                // Use the first email from the profile, if available
                const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;

                // Check if an account with this email already exists but without a Google ID
                // This handles cases where a user might have registered locally and then tries to log in with Google
                if (email) {
                    let existingUserByEmail = await User.findOne({ email: email });
                    if (existingUserByEmail) {
                        // If user exists by email but doesn't have a googleId, link the googleId
                        if (!existingUserByEmail.googleId) {
                            existingUserByEmail.googleId = profile.id;
                            await existingUserByEmail.save();
                            return done(null, existingUserByEmail);
                        }
                        // If user exists by email AND has a googleId, it's the same user
                        return done(null, existingUserByEmail);
                    }
                }

                // Create new user if no existing user found by googleId or email
                const newUser = new User({
                    googleId: profile.id,
                    email: email, // Email from Google profile
                    // Password field will be empty for Google-registered users
                });
                await newUser.save();
                done(null, newUser);
            }
        } catch (error) {
            done(error, false);
        }
    }));

    // --- JWT Strategy (for protecting API routes) ---
    const jwtOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Expect JWT in 'Bearer <token>' header
        secretOrKey: process.env.JWT_SECRET // Same secret used to sign the token
    };

    passport.use(new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
        try {
            const user = await User.findById(jwt_payload.id);
            if (user) {
                return done(null, user); // User found
            } else {
                return done(null, false); // User not found
            }
        } catch (error) {
            return done(error, false);
        }
    }));

    // Passport session serialization/deserialization (needed for session-based login,
    // though we primarily use JWTs for API, Passport still uses sessions for OAuth flow)
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
    