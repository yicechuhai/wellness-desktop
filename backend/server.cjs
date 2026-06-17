const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes.cjs');

const app = express();
app.use(cors());
app.use(express.json());

// API routes
app.use('/api', routes);

// Serve frontend static files
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

const port = process.env.PORT || 3001;
app.listen(port, '127.0.0.1', () => {
  console.log('[Wellness] Server running on http://localhost:' + port);
});
