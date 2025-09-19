const express = require('express');
const cors = require('cors');

require('dotenv').config();
const mongoose = require('mongoose');

const app = express();

const PORT = process.env.PORT || 3001;


// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CareerPathak API is running' });
});

// Auth middleware (placeholder)
const authenticateUser = (req, res, next) => {
  // For now, we'll skip real JWT validation in hackathon
  // In production, validate JWT token here
  req.user = { id: 'demo-user-id', email: 'demo@example.com' };
  next();
};

// Routes
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/users', require('./routes/users'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/scholarships', require('./routes/scholarships'));
app.use('/api/streams', require('./routes/streams'));
app.use('/api/ai-recommended-colleges', require('./routes/ai-college-recommendations'));
app.use('/api/career-path', require('./routes/careerPath'));

// Error handling
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});


// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 CareerPathak API server running on http://localhost:${PORT}`);
});

module.exports = app;
