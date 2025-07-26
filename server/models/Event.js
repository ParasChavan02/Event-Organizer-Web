// server/models/Event.js
// Mongoose model for Event

const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String, // Store as string for flexibility (e.g., "10:00 AM")
        required: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        enum: ['conference', 'workshop', 'party', 'webinar', 'other'],
        default: 'other'
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId, // Link to the User who created the event
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Event', EventSchema);
