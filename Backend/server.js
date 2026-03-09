require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// Validate environment variables
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not defined in .env');
  process.exit(1);
}

if (!process.env.MONGODB_URI) {
  console.error('FATAL: MONGODB_URI is not defined in .env');
  process.exit(1);
}

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/', globalLimiter);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// API routes
app.use('/api/admin', authLimiter, require('./routes/auth'));
app.use('/api/auth', authLimiter, require('./routes/userAuth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/products', require('./routes/products'));
app.use('/api/recipes', require('./routes/recipes'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/store-config', require('./routes/storeConfig'));
app.use('/api/offers', require('./routes/offers'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/admin-users', require('./routes/adminUsers'));
app.use('/api/admin/analytics', require('./routes/analytics'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: "ok" });
});

// Serve frontend build
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// Catch-all handler for frontend routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});