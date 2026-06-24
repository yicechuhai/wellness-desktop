const express = require('express');
const cors = require('cors');
const path = require('path');
const { router } = require('./routes.cjs');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', router);

const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

const port = process.env.PORT || 3001;

// Only listen if this is the main process (not required from electron main)
// In Electron, the server is started by main.js requiring this module
if (!process.env.ELECTRON_RUN_AS_NODE) {
  const server = app.listen(port, '127.0.0.1', () => {
    console.log('[Wellness] Server running on http://localhost:' + port);
  });
  module.exports = server;
} else {
  module.exports = app;
}
