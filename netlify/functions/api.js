const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { body, validationResult } = require('express-validator');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Database connection
let db = null;
const connectDB = async () => {
  try {
    if (!db) {
      const mongoUri = process.env.MONGODB_URI;
      if (!mongoUri) {
        console.error('MONGODB_URI not found');
        return;
      }
      
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      db = mongoose.connection;
      console.log('MongoDB connected successfully');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

// Models
const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' }
}, { timestamps: true });

const StudentSchema = new mongoose.Schema({
  admissionNumber: { type: String, required: true, unique: true },
  studentName: { type: String, required: true },
  fatherName: { type: String, required: true },
  motherName: { type: String, required: true },
  dob: { type: Date, required: true },
  currentClass: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  address: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  photo: { type: String },
  feeDetails: {
    totalFee: { type: Number, required: true },
    amountPaid: { type: Number, required: true },
    remainingAmount: { type: Number, required: true }
  }
}, { timestamps: true });

const MarksheetSchema = new mongoose.Schema({
  rollNumber: { type: String, required: true },
  studentName: { type: String, required: true },
  fatherName: { type: String, required: true },
  motherName: { type: String, required: true },
  dob: { type: Date, required: true },
  currentClass: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  address: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  photo: { type: String },
  examType: { type: String, required: true },
  academicYear: { type: String, required: true },
  subjects: [{
    name: { type: String, required: true },
    code: { type: String, required: true },
    marks: { type: Number, required: true },
    maxMarks: { type: Number, required: true }
  }],
  totalMarks: { type: Number, required: true },
  maxTotalMarks: { type: Number, required: true },
  percentage: { type: Number, required: true },
  rank: { type: Number },
  promotionStatus: { type: String, enum: ['Promoted', 'Not Promoted'], default: 'Not Promoted' }
}, { timestamps: true });

// Create unique index for marksheet
MarksheetSchema.index({ rollNumber: 1, examType: 1, academicYear: 1 }, { unique: true });

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);
const Marksheet = mongoose.models.Marksheet || mongoose.model('Marksheet', MarksheetSchema);

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    message: 'School Management API is running',
    path: '/api/health',
    timestamp: new Date().toISOString()
  });
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    await connectDB();
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    await connectDB();
    
    const admin = await Admin.findById(req.user.id).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({ admin });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Students routes
app.get('/api/students', authenticateToken, async (req, res) => {
  try {
    await connectDB();
    
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/students', upload.single('photo'), [
  body('studentName').notEmpty().withMessage('Student name is required'),
  body('currentClass').notEmpty().withMessage('Current class is required'),
  body('feeDetails.totalFee').isNumeric().withMessage('Total fee must be a number'),
  body('feeDetails.amountPaid').isNumeric().withMessage('Amount paid must be a number')
], async (req, res) => {
  try {
    await connectDB();
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const studentData = { ...req.body };
    
    // Handle photo upload
    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      studentData.photo = `data:image/jpeg;base64,${base64}`;
    }

    // Convert fee fields to numbers
    if (studentData.feeDetails) {
      studentData.feeDetails.totalFee = parseFloat(studentData.feeDetails.totalFee) || 0;
      studentData.feeDetails.amountPaid = parseFloat(studentData.feeDetails.amountPaid) || 0;
      studentData.feeDetails.remainingAmount = studentData.feeDetails.totalFee - studentData.feeDetails.amountPaid;
    }

    const student = new Student(studentData);
    await student.save();

    res.status(201).json({
      message: 'Student created successfully',
      student
    });
  } catch (error) {
    console.error('Create student error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Student with this admission number already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/students/stats/dashboard', authenticateToken, async (req, res) => {
  try {
    await connectDB();
    
    const totalStudents = await Student.countDocuments();
    const paidStudents = await Student.countDocuments({ 'feeDetails.remainingAmount': 0 });
    const partialPaidStudents = await Student.countDocuments({ 
      'feeDetails.remainingAmount': { $gt: 0, $lt: { $expr: '$feeDetails.totalFee' } }
    });
    const unpaidStudents = await Student.countDocuments({ 
      'feeDetails.remainingAmount': { $eq: { $expr: '$feeDetails.totalFee' } }
    });

    res.json({
      totalStudents,
      paidStudents,
      partialPaidStudents,
      unpaidStudents,
      failedStudents: 0,
      passedStudents: 0,
      graduatedStudents: 0,
      averageAttendance: 0,
      feeStats: {
        totalCollected: 0,
        totalPending: 0
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Marksheets routes
app.get('/api/marksheets', authenticateToken, async (req, res) => {
  try {
    await connectDB();
    
    const marksheets = await Marksheet.find().sort({ createdAt: -1 });
    res.json(marksheets);
  } catch (error) {
    console.error('Get marksheets error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/marksheets', [
  body('rollNumber').notEmpty().withMessage('Roll number is required'),
  body('studentName').notEmpty().withMessage('Student name is required'),
  body('examType').notEmpty().withMessage('Exam type is required'),
  body('academicYear').notEmpty().withMessage('Academic year is required')
], async (req, res) => {
  try {
    await connectDB();
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const marksheetData = req.body;

    // Check for duplicate
    const existingMarksheet = await Marksheet.findOne({
      rollNumber: marksheetData.rollNumber,
      examType: marksheetData.examType,
      academicYear: marksheetData.academicYear
    });

    if (existingMarksheet) {
      return res.status(400).json({ message: 'Marksheet with this roll number, exam type, and academic year already exists' });
    }

    // Calculate totals and percentage
    let totalMarks = 0;
    let maxTotalMarks = 0;
    
    marksheetData.subjects.forEach(subject => {
      totalMarks += subject.marks || 0;
      maxTotalMarks += subject.maxMarks || 0;
    });

    marksheetData.totalMarks = totalMarks;
    marksheetData.maxTotalMarks = maxTotalMarks;
    marksheetData.percentage = maxTotalMarks > 0 ? (totalMarks / maxTotalMarks) * 100 : 0;

    // Set promotion status
    marksheetData.promotionStatus = marksheetData.percentage >= 40 ? 'Promoted' : 'Not Promoted';

    const marksheet = new Marksheet(marksheetData);
    await marksheet.save();

    res.status(201).json({
      message: 'Marksheet created successfully',
      marksheet
    });
  } catch (error) {
    console.error('Create marksheet error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Marksheet with this roll number, exam type, and academic year already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Default route
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    message: 'Something went wrong!',
    error: err.message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Netlify function handler
exports.handler = async (event, context) => {
  // Connect to database
  await connectDB();
  
  // Convert Netlify event to Express request
  const appHandler = app;
  
  return new Promise((resolve) => {
    const { httpMethod, path, headers, body, queryStringParameters } = event;
    
    const req = {
      method: httpMethod,
      url: path,
      headers: headers || {},
      body: body ? JSON.parse(body) : {},
      query: queryStringParameters || {}
    };
    
    const res = {
      status: (code) => ({
        json: (data) => resolve({
          statusCode: code,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })
      }),
      json: (data) => resolve({
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
    };
    
    appHandler(req, res, () => {
      resolve({
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: 'Not found' })
      });
    });
  });
};