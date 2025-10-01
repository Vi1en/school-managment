const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Apply CORS immediately - before any other middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

app.use(express.json());

// Connect to MongoDB
let isConnected = false;

async function connectDB() {
  if (isConnected) {
    return;
  }
  
  try {
    const mongoUri = process.env.MONGODB_URI;
    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    isConnected = true;
    console.log('Successfully connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error; // Re-throw to see the error in logs
  }
}

// Connect to database on first request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({ message: 'Database connection failed', error: error.message });
  }
});


// Routes
app.use('/api/auth', require('../routes/auth'));
app.use('/api/students', require('../routes/students'));
app.use('/api/settings', require('../routes/settings'));
app.use('/api/fee-deposits', require('../routes/feeDeposits'));
app.use('/api/class-fees', require('../routes/classFees'));
app.use('/api/marks', require('../routes/marks'));
app.use('/api/marksheets', require('../routes/marksheets'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Debug route to check environment variables
app.get('/api/debug', (req, res) => {
  res.json({ 
    message: 'Debug info',
    hasMongoUri: !!process.env.MONGODB_URI,
    mongoUriLength: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0,
    nodeEnv: process.env.NODE_ENV
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'School Management API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  console.error('Error stack:', err.stack);
  
  // If response was already sent, don't send another
  if (res.headersSent) {
    return next(err);
  }
  
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: err.message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;
