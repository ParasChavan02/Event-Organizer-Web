    // server/minimal-server.js
    const express = require('express');
    const app = express();
    const PORT = process.env.PORT || 5000;

    app.get('/', (req, res) => {
      res.send('Minimal server is running!');
    });

    app.listen(PORT, () => {
      console.log(`Minimal server running on port ${PORT}`);
    });
    