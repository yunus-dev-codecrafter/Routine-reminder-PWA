require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const cron = require('node-cron');
const webpush = require('web-push');
const store = require('./data/store');

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const app = express();
const PORT = process.env.PORT || 3000;

// Attach store to app and initialize data files
app.locals.store = store;
store.init().then(() => {
  console.log('Data store initialized');
}).catch((err) => {
  console.error('Data store initialization error:', err && err.message ? err.message : err);
});

// Optional HTTPS configuration. Provide `SSL_KEY_PATH` and `SSL_CERT_PATH` in
// the environment to enable an HTTPS server alongside HTTP (default SSL_PORT 3443).
const SSL_KEY_PATH = process.env.SSL_KEY_PATH;
const SSL_CERT_PATH = process.env.SSL_CERT_PATH;
const SSL_PORT = process.env.SSL_PORT || 3443;

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health/status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// VAPID public key endpoint for clients
app.get('/api/vapid-public-key', (req, res) => {
  res.json({
    publicKey: process.env.VAPID_PUBLIC_KEY
  });
});

// Create HTTP server
const httpServer = http.createServer(app);

httpServer.listen(PORT, () => {
  console.log(`HTTP server running: http://localhost:${PORT}`);
});

// If SSL key/cert paths are provided, start an HTTPS server as well
if (SSL_KEY_PATH && SSL_CERT_PATH) {
  try {
    const key = fs.readFileSync(path.resolve(SSL_KEY_PATH));
    const cert = fs.readFileSync(path.resolve(SSL_CERT_PATH));
    const httpsServer = https.createServer({ key, cert }, app);
    httpsServer.listen(SSL_PORT, () => {
      console.log(`HTTPS server running: https://localhost:${SSL_PORT}`);
    });
  } catch (err) {
    console.error('Failed to start HTTPS server:', err.message);
  }
}
