    // server/server.js
    // Testing static file serving and catch-all route

    const express = require('express');
    const path = require('path'); // Import path module

    const app = express();
    const PORT = process.env.PORT || 5000;

    // --- Serve Frontend Static Files ---
    // This middleware serves all static files (HTML, CSS, JS, images) from the 'public' directory.
    app.use(express.static(path.join(__dirname, '..', 'public')));

    // --- Catch-all route for Single Page Application (SPA) ---
    // This route is essential for SPAs. If a request doesn't match any static files,
    // it will fall back to serving the `index.html`.
    // This MUST be the very LAST route definition in your server.js.
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
    });

    // --- Start Server ---
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
    