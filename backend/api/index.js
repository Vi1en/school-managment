const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'https://frontend-kaks7hnc7-manab-mallicks-projects.vercel.app',
    'https://frontend-6hyh264xm-manab-mallicks-projects.vercel.app',
    'https://frontend-maqnijuta-manab-mallicks-projects.vercel.app',
    'https://frontend-h7290e37f-manab-mallicks-projects.vercel.app',
    'https://frontend-og324zom2-manab-mallicks-projects.vercel.app',
    'https://frontend-ogh754sn7-manab-mallicks-projects.vercel.app',
    'https://frontend-6mongcf82-manab-mallicks-projects.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(express.json());

// Connect to MongoDB
let isConnected = false;

async function connectDB() {
  if (isConnected) {
    return;
  }
  
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/school-management';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

// Connect to database on first request
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Apply CORS to all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
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

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'School Management API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;
