const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Database connection with better error handling
let db = null;
const connectDB = async () => {
  try {
    if (!db) {
      const mongoUri = process.env.MONGODB_URI;
      if (!mongoUri) {
        console.error('MONGODB_URI not found in environment variables');
        return false;
      }
      
      console.log('Attempting to connect to MongoDB...');
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      db = mongoose.connection;
      
      db.on('connected', () => console.log('MongoDB connected successfully'));
      db.on('error', (err) => console.error('MongoDB connection error:', err));
      db.on('disconnected', () => console.log('MongoDB disconnected'));
      
      return true;
    }
    
    return db.readyState === 1;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    db = null;
    return false;
  }
};

// Enhanced Models
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
    totalFee: { type: Number, required: true, default: 0 },
    amountPaid: { type: Number, required: true, default: 0 },
    remainingAmount: { type: Number, required: true, default: 0 }
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
    ut1: { type: Number, default: 0 },
    ut2: { type: Number, default: 0 },
    halfYearly: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    maxMarks: { type: Number, default: 100 }
  }],
  totalMarks: { type: Number, required: true, default: 0 },
  maxTotalMarks: { type: Number, required: true, default: 0 },
  percentage: { type: Number, required: true, default: 0 },
  grade: { type: String, required: true, default: 'F' },
  rank: { type: String, default: 'N/A' },
  totalDays: { type: Number, default: 105 },
  daysPresent: { type: Number, default: 95 },
  attendancePercentage: { type: Number, default: 0 }
}, { timestamps: true });

// Create indexes for better performance
MarksheetSchema.index({ rollNumber: 1, examType: 1, academicYear: 1 }, { unique: true });
StudentSchema.index({ currentClass: 1 });

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);
const Marksheet = mongoose.models.Marksheet || mongoose.model('Marksheet', MarksheetSchema);

// JWT Authentication
const authenticateToken = (headers) => {
  try {
    const authHeader = headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return null;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
};

// Response helper
const createResponse = (statusCode, data) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  },
  body: JSON.stringify(data)
});

// CORS handler
const handleCORS = () => createResponse(200, { message: 'CORS preflight' });

// Main handler
exports.handler = async (event, context) => {
  // Set timeout
  context.callbackWaitsForEmptyEventLoop = false;
  
  try {
    // Connect to database
    const dbConnected = await connectDB();
    if (!dbConnected) {
      return createResponse(500, { 
        message: 'Database connection failed',
        error: 'Unable to connect to MongoDB'
      });
    }

    const { httpMethod: method, path, headers, body } = event;
    
    // Handle CORS
    if (method === 'OPTIONS') {
      return handleCORS();
    }

    // Parse body
    let parsedBody = {};
    if (body) {
      try {
        parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
      } catch (parseError) {
        console.error('Body parsing error:', parseError);
        return createResponse(400, { 
          message: 'Invalid JSON in request body',
          error: parseError.message 
        });
      }
    }

    console.log(`Processing ${method} ${path}`);

    // Health check
    if (path === '/api/health') {
      return createResponse(200, {
        message: 'School Management API is running',
        timestamp: new Date().toISOString(),
        database: {
          status: dbConnected ? 'connected' : 'disconnected',
          readyState: db?.readyState || 0
        }
      });
    }

    // Test endpoint
    if (path === '/api/test') {
      try {
        const studentCount = await Student.countDocuments();
        const marksheetCount = await Marksheet.countDocuments();
        
        return createResponse(200, {
          message: 'API is working',
          timestamp: new Date().toISOString(),
          database: {
            status: 'connected',
            readyState: db.readyState
          },
          counts: {
            students: studentCount,
            marksheets: marksheetCount
          }
        });
      } catch (error) {
        return createResponse(500, {
          message: 'Database test failed',
          error: error.message
        });
      }
    }

    // Auth routes
    if (path === '/api/auth/login' && method === 'POST') {
      const { email, password } = parsedBody;
      
      if (!email || !password) {
        return createResponse(400, { message: 'Email and password are required' });
      }

      try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
          return createResponse(400, { message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
          return createResponse(400, { message: 'Invalid credentials' });
        }

        const token = jwt.sign(
          { id: admin._id, email: admin.email },
          process.env.JWT_SECRET || 'fallback-secret',
          { expiresIn: '7d' }
        );

        return createResponse(200, {
          message: 'Login successful',
          token,
          user: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role
          }
        });
      } catch (error) {
        console.error('Login error:', error);
        return createResponse(500, { message: 'Login failed', error: error.message });
      }
    }

    // Student routes
    if (path === '/api/students' && method === 'GET') {
      try {
        const user = authenticateToken(headers);
        if (!user) {
          return createResponse(401, { message: 'Access token required' });
        }

        const students = await Student.find().sort({ createdAt: -1 });
        return createResponse(200, { students });
      } catch (error) {
        console.error('Students fetch error:', error);
        return createResponse(500, { message: 'Failed to fetch students', error: error.message });
      }
    }

    if (path === '/api/students' && method === 'POST') {
      try {
        const user = authenticateToken(headers);
        if (!user) {
          return createResponse(401, { message: 'Access token required' });
        }

        const studentData = {
          ...parsedBody,
          feeDetails: {
            totalFee: parseFloat(parsedBody.feeDetails?.totalFee) || 0,
            amountPaid: parseFloat(parsedBody.feeDetails?.amountPaid) || 0,
            remainingAmount: parseFloat(parsedBody.feeDetails?.totalFee) - parseFloat(parsedBody.feeDetails?.amountPaid) || 0
          }
        };

        const student = new Student(studentData);
        await student.save();

        return createResponse(201, { 
          message: 'Student created successfully',
          student 
        });
      } catch (error) {
        console.error('Student creation error:', error);
        if (error.code === 11000) {
          return createResponse(400, { message: 'Student with this admission number already exists' });
        }
        return createResponse(500, { message: 'Failed to create student', error: error.message });
      }
    }

    // Marksheet routes
    if (path === '/api/marksheets' && method === 'POST') {
      try {
        const user = authenticateToken(headers);
        if (!user) {
          return createResponse(401, { message: 'Access token required' });
        }

        const { 
          rollNumber, 
          studentName, 
          examType, 
          academicYear, 
          subjects, 
          currentClass, 
          fatherName, 
          motherName, 
          dob, 
          bloodGroup, 
          address, 
          phoneNumber, 
          photo,
          totalDays = 105,
          daysPresent = 95
        } = parsedBody;

        // Validate required fields
        if (!rollNumber || !studentName || !examType || !academicYear || !subjects || !currentClass) {
          return createResponse(400, { 
            message: 'Required fields missing',
            required: ['rollNumber', 'studentName', 'examType', 'academicYear', 'subjects', 'currentClass']
          });
        }

        // Process subjects and calculate totals
        const processedSubjects = subjects.map(subject => {
          const ut1 = parseFloat(subject.ut1) || 0;
          const ut2 = parseFloat(subject.ut2) || 0;
          const halfYearly = parseFloat(subject.halfYearly) || 0;
          const total = ut1 + ut2 + halfYearly;
          const maxMarks = parseFloat(subject.maxMarks) || 100;

          return {
            name: subject.name,
            code: subject.code,
            ut1,
            ut2,
            halfYearly,
            total,
            maxMarks
          };
        });

        const totalMarks = processedSubjects.reduce((sum, subject) => sum + subject.total, 0);
        const maxTotalMarks = processedSubjects.reduce((sum, subject) => sum + subject.maxMarks, 0);
        const percentage = maxTotalMarks > 0 ? (totalMarks / maxTotalMarks) * 100 : 0;
        const attendancePercentage = totalDays > 0 ? (daysPresent / totalDays) * 100 : 0;

        // Calculate grade
        let grade = 'F';
        if (percentage >= 90) grade = 'A+';
        else if (percentage >= 80) grade = 'A';
        else if (percentage >= 70) grade = 'B+';
        else if (percentage >= 60) grade = 'B';
        else if (percentage >= 50) grade = 'C+';
        else if (percentage >= 40) grade = 'C';
        else if (percentage >= 30) grade = 'D';

        const marksheetData = {
          rollNumber,
          studentName,
          fatherName: fatherName || '',
          motherName: motherName || '',
          dob: new Date(dob),
          currentClass,
          bloodGroup: bloodGroup || '',
          address: address || '',
          phoneNumber: phoneNumber || '',
          photo: photo || '',
          examType,
          academicYear,
          subjects: processedSubjects,
          totalMarks,
          maxTotalMarks,
          percentage: Math.round(percentage * 100) / 100,
          grade,
          totalDays,
          daysPresent,
          attendancePercentage: Math.round(attendancePercentage * 100) / 100
        };

        // Check for existing marksheet
        const existingMarksheet = await Marksheet.findOne({
          rollNumber,
          examType,
          academicYear
        });

        let marksheet;
        if (existingMarksheet) {
          // Update existing marksheet
          marksheet = await Marksheet.findOneAndUpdate(
            { rollNumber, examType, academicYear },
            marksheetData,
            { new: true, runValidators: true }
          );
        } else {
          // Create new marksheet
          marksheet = new Marksheet(marksheetData);
          await marksheet.save();
        }

        return createResponse(200, {
          message: 'Marksheet created/updated successfully',
          marksheet
        });

      } catch (error) {
        console.error('Marksheet creation error:', error);
        return createResponse(500, { 
          message: 'Failed to create/update marksheet', 
          error: error.message 
        });
      }
    }

    if (path === '/api/marksheets' && method === 'GET') {
      try {
        const user = authenticateToken(headers);
        if (!user) {
          return createResponse(401, { message: 'Access token required' });
        }

        const marksheets = await Marksheet.find().sort({ createdAt: -1 });
        return createResponse(200, { marksheets });
      } catch (error) {
        console.error('Marksheets fetch error:', error);
        return createResponse(500, { message: 'Failed to fetch marksheets', error: error.message });
      }
    }

    // 404 for unmatched routes
    return createResponse(404, { message: 'Route not found' });

  } catch (error) {
    console.error('Handler error:', error);
    return createResponse(500, { 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};
