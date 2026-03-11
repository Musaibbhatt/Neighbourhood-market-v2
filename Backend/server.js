require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

// Don't buffer Mongo queries when not connected (fail fast)
mongoose.set('bufferCommands', false);
mongoose.set('bufferTimeoutMS', 1000);

const app = express();
const PORT = process.env.PORT || 5000;

/* ---------------------------------------------------
   1. Validate environment variables
--------------------------------------------------- */

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not defined in .env');
  process.exit(1);
}

if (!process.env.MONGODB_URI) {
  console.error('FATAL: MONGODB_URI is not defined in .env');
  process.exit(1);
}

/* ---------------------------------------------------
   2. Rate limiting
--------------------------------------------------- */

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes"
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: "Too many login/signup attempts, please try again later"
});

/* ---------------------------------------------------
   3. Middleware
--------------------------------------------------- */

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(globalLimiter);

/* ---------------------------------------------------
   4. MongoDB connection
--------------------------------------------------- */

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch(err => {
    console.error("❌ MongoDB connection error:");
    console.error(err);
  });

/* ---------------------------------------------------
   5. API Routes
--------------------------------------------------- */

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

/* ---------------------------------------------------
   6. Health Check
--------------------------------------------------- */

app.get('/api/health', (req, res) => {
  res.json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
  });
});

/* ---------------------------------------------------
   7. Serve Frontend
--------------------------------------------------- */

const frontendPath = path.join(__dirname, "../frontend/dist");

app.use(express.static(frontendPath));

/* SPA fallback (important for React/Vue routing) */
app.use((req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

/* ---------------------------------------------------
   8. Global Error Handler
--------------------------------------------------- */

app.use((err, req, res, next) => {
  console.error("--- SERVER ERROR DETECTED ---");
  console.error("Message:", err.message);
  console.error("Stack:", err.stack);
  console.error("-----------------------------");

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message
  });
});

/* ---------------------------------------------------
   9. Start Server
--------------------------------------------------- */

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📂 Serving frontend from: ${frontendPath}`);
});