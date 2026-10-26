const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('node:path');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.includes('hotelpro_super')) {
  throw new Error('Set JWT_SECRET to a random secret of at least 32 characters.');
}

const app = express();

// Middleware
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map(s => s.trim());
app.disable('x-powered-by');
app.use(cors({ origin(origin, callback) {
  callback(null, !origin || allowedOrigins.includes(origin));
} }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Await Atlas on cold starts and reuse the connection for concurrent requests.
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch {
    res.status(503).json({ success: false, message: 'Database temporarily unavailable. Please try again.' });
  }
});

// Health / Welcome Route
app.get('/api/health', (req, res) => {
  if (mongoose.connection.readyState !== 1) return res.status(503).json({ status: 'unavailable' });
  res.status(200).json({
    status: 'online',
    message: 'HotelPro API is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

// Export app for testing purposes
if (require.main === module && process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    app.listen(PORT, () => console.log('HotelPro Backend Server listening on port ' + PORT));
  }).catch(error => { console.error(error.message); process.exitCode = 1; });
}

module.exports = app;
