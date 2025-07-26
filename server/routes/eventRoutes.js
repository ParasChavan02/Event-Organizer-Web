// server/routes/eventRoutes.js
// Routes for event management

const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const passport = require('passport'); // Required for JWT authentication

// Middleware to protect routes (ensure user is authenticated)
// We'll use Passport's JWT strategy
const authenticateJWT = passport.authenticate('jwt', { session: false });

// @route   POST /api/events
// @desc    Create a new event
// @access  Private (requires authentication)
router.post('/', authenticateJWT, async (req, res) => {
    const { name, date, time, location, description, category } = req.body;

    if (!name || !date || !time || !location) {
        return res.status(400).json({ message: 'Please provide event name, date, time, and location.' });
    }

    try {
        const newEvent = new Event({
            name,
            date,
            time,
            location,
            description,
            category,
            organizer: req.user.id // Get organizer ID from authenticated user
        });

        const event = await newEvent.save();
        res.status(201).json({ message: 'Event created successfully!', event });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ message: 'Server error creating event' });
    }
});

// @route   GET /api/events
// @desc    Get all events for the authenticated user
// @access  Private (requires authentication)
router.get('/', authenticateJWT, async (req, res) => {
    try {
        const events = await Event.find({ organizer: req.user.id }).sort({ date: 1, time: 1 });
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Server error fetching events' });
    }
});

// @route   GET /api/events/:id
// @desc    Get a single event by ID
// @access  Private (requires authentication and ownership)
router.get('/:id', authenticateJWT, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Ensure the event belongs to the authenticated user
        if (event.organizer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to view this event' });
        }

        res.json(event);
    } catch (error) {
        console.error('Error fetching single event:', error);
        // Check for invalid ID format
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid event ID' });
        }
        res.status(500).json({ message: 'Server error fetching event' });
    }
});

// @route   PUT /api/events/:id
// @desc    Update an event by ID
// @access  Private (requires authentication and ownership)
router.put('/:id', authenticateJWT, async (req, res) => {
    const { name, date, time, location, description, category } = req.body;

    try {
        let event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Ensure the event belongs to the authenticated user
        if (event.organizer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this event' });
        }

        // Update fields if provided
        event.name = name || event.name;
        event.date = date || event.date;
        event.time = time || event.time;
        event.location = location || event.location;
        event.description = description || event.description;
        event.category = category || event.category;

        await event.save();
        res.json({ message: 'Event updated successfully!', event });
    } catch (error) {
        console.error('Error updating event:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid event ID' });
        }
        res.status(500).json({ message: 'Server error updating event' });
    }
});

// @route   DELETE /api/events/:id
// @desc    Delete an event by ID
// @access  Private (requires authentication and ownership)
router.delete('/:id', authenticateJWT, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Ensure the event belongs to the authenticated user
        if (event.organizer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this event' });
        }

        await Event.deleteOne({ _id: req.params.id }); // Use deleteOne for Mongoose 6+
        res.json({ message: 'Event deleted successfully!' });
    } catch (error) {
        console.error('Error deleting event:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid event ID' });
        }
        res.status(500).json({ message: 'Server error deleting event' });
    }
});

module.exports = router;
