const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Database connection
let db = null;
const connectDB = async () => {
  try {
    if (!db) {
      const mongoUri = process.env.MONGODB_URI;
      if (!mongoUri) {
        console.error('MONGODB_URI not found');
        return false;
      }
      
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      db = mongoose.connection;
      console.log('MongoDB connected successfully');
      return true;
    }
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
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

// Helper function to create response
const createResponse = (statusCode, body, headers = {}) => {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify(body)
  };
};

// Auth helper
const authenticateToken = (headers) => {
  const authHeader = headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
  } catch (err) {
    return null;
  }
};

exports.handler = async (event, context) => {
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return createResponse(200, {});
  }

  let path = event.path;
  const method = event.httpMethod;
  const headers = event.headers || {};
  
  // Parse body with error handling
  let body = {};
  try {
    if (event.body) {
      // Check if it's FormData (multipart) or JSON
      if (event.body.startsWith('------WebKitFormBoundary') || event.body.includes('multipart/form-data')) {
        console.log('Received FormData, parsing manually...');
        console.log('FormData size:', event.body.length);
        
        // For FormData, we'll parse it manually with better error handling
        const lines = event.body.split('\r\n');
        const parsedData = {};
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.startsWith('Content-Disposition: form-data; name=')) {
            const nameMatch = line.match(/name="([^"]+)"/);
            if (nameMatch && i + 2 < lines.length) {
              const fieldName = nameMatch[1];
              const fieldValue = lines[i + 2];
              if (fieldValue && !fieldValue.startsWith('------')) {
                if (fieldName.includes('.')) {
                  // Handle nested objects like feeDetails.totalFee
                  const [parent, child] = fieldName.split('.');
                  if (!parsedData[parent]) parsedData[parent] = {};
                  parsedData[parent][child] = fieldValue;
                } else {
                  parsedData[fieldName] = fieldValue;
                }
              }
            }
          }
        }
        
        // Convert numeric fields
        if (parsedData.feeDetails) {
          parsedData.feeDetails.totalFee = parseFloat(parsedData.feeDetails.totalFee) || 0;
          parsedData.feeDetails.amountPaid = parseFloat(parsedData.feeDetails.amountPaid) || 0;
        }
        
        body = parsedData;
        console.log('Parsed FormData successfully:', Object.keys(body));
      } else {
        body = JSON.parse(event.body);
        console.log('Parsed JSON successfully');
      }
    }
  } catch (error) {
    console.error('Body parse error:', error);
    console.error('Body content length:', event.body?.length);
    console.error('Body content preview:', event.body?.substring(0, 200));
    return createResponse(400, { 
      message: 'Invalid request body format',
      error: error.message 
    });
  }

  // Handle Netlify Functions path - remove the function name from path
  if (path.startsWith('/.netlify/functions/api')) {
    path = path.replace('/.netlify/functions/api', '/api');
  }

  try {
    // Connect to database
    const dbConnected = await connectDB();
    if (!dbConnected) {
      return createResponse(500, { message: 'Database connection failed' });
    }

    // Health check
    if (path === '/api/health') {
      return createResponse(200, {
        message: 'School Management API is running',
        path: '/api/health',
        timestamp: new Date().toISOString()
      });
    }

    // Auth routes
    if (path === '/api/auth/login' && method === 'POST') {
      const { email, password } = body;
      
      if (!email || !password) {
        return createResponse(400, { message: 'Email and password are required' });
      }

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
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      return createResponse(200, {
        message: 'Login successful',
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      });
    }

    if (path === '/api/auth/me' && method === 'GET') {
      const user = authenticateToken(headers);
      if (!user) {
        return createResponse(401, { message: 'Access token required' });
      }

      const admin = await Admin.findById(user.id).select('-password');
      if (!admin) {
        return createResponse(404, { message: 'Admin not found' });
      }

      return createResponse(200, { admin });
    }

    // Students routes
    if (path === '/api/students' && method === 'GET') {
      const user = authenticateToken(headers);
      if (!user) {
        return createResponse(401, { message: 'Access token required' });
      }

      const students = await Student.find().sort({ createdAt: -1 });
      return createResponse(200, students);
    }

    if (path === '/api/students' && method === 'POST') {
      const user = authenticateToken(headers);
      if (!user) {
        return createResponse(401, { message: 'Access token required' });
      }

      try {
        console.log('Creating student with data:', JSON.stringify(body, null, 2));
        
        const { studentName, currentClass, feeDetails } = body;
        
        if (!studentName || !currentClass) {
          return createResponse(400, { message: 'Student name and class are required' });
        }

        const studentData = { ...body };
        
        // Generate unique admission number if not provided
        if (!studentData.admissionNumber) {
          const count = await Student.countDocuments();
          studentData.admissionNumber = String(count + 1).padStart(3, '0');
        }
        
        // Convert fee fields to numbers if they exist
        if (studentData.feeDetails) {
          studentData.feeDetails.totalFee = parseFloat(studentData.feeDetails.totalFee) || 0;
          studentData.feeDetails.amountPaid = parseFloat(studentData.feeDetails.amountPaid) || 0;
          studentData.feeDetails.remainingAmount = studentData.feeDetails.totalFee - studentData.feeDetails.amountPaid;
        }

        const student = new Student(studentData);
        await student.save();

        console.log('Student created successfully:', student._id);
        return createResponse(201, {
          message: 'Student created successfully',
          student
        });
      } catch (error) {
        console.error('Error creating student:', error);
        return createResponse(500, { 
          message: 'Error creating student',
          error: error.message 
        });
      }
    }

    if (path === '/api/students/stats/dashboard' && method === 'GET') {
      const user = authenticateToken(headers);
      if (!user) {
        return createResponse(401, { message: 'Access token required' });
      }

      const totalStudents = await Student.countDocuments();
      const paidStudents = await Student.countDocuments({ 'feeDetails.remainingAmount': 0 });
      const partialPaidStudents = await Student.countDocuments({ 
        $and: [
          { 'feeDetails.remainingAmount': { $gt: 0 } },
          { $expr: { $lt: ['$feeDetails.remainingAmount', '$feeDetails.totalFee'] } }
        ]
      });
      const unpaidStudents = await Student.countDocuments({ 
        $expr: { $eq: ['$feeDetails.remainingAmount', '$feeDetails.totalFee'] }
      });

      return createResponse(200, {
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
    }

    // Marksheets routes
    if (path === '/api/marksheets' && method === 'GET') {
      const user = authenticateToken(headers);
      if (!user) {
        return createResponse(401, { message: 'Access token required' });
      }

      const marksheets = await Marksheet.find().sort({ createdAt: -1 });
      return createResponse(200, marksheets);
    }

    if (path === '/api/marksheets' && method === 'POST') {
      const user = authenticateToken(headers);
      if (!user) {
        return createResponse(401, { message: 'Access token required' });
      }

      const { rollNumber, studentName, examType, academicYear, subjects } = body;
      
      if (!rollNumber || !studentName || !examType || !academicYear || !subjects) {
        return createResponse(400, { message: 'Required fields missing' });
      }

      // Check for duplicate
      const existingMarksheet = await Marksheet.findOne({
        rollNumber,
        examType,
        academicYear
      });

      if (existingMarksheet) {
        return createResponse(400, { message: 'Marksheet with this roll number, exam type, and academic year already exists' });
      }

      // Calculate totals and percentage
      let totalMarks = 0;
      let maxTotalMarks = 0;
      
      subjects.forEach(subject => {
        totalMarks += subject.marks || 0;
        maxTotalMarks += subject.maxMarks || 0;
      });

      const marksheetData = {
        ...body,
        totalMarks,
        maxTotalMarks,
        percentage: maxTotalMarks > 0 ? (totalMarks / maxTotalMarks) * 100 : 0,
        promotionStatus: (maxTotalMarks > 0 ? (totalMarks / maxTotalMarks) * 100 : 0) >= 40 ? 'Promoted' : 'Not Promoted'
      };

      const marksheet = new Marksheet(marksheetData);
      await marksheet.save();

      return createResponse(201, {
        message: 'Marksheet created successfully',
        marksheet
      });
    }

    // Default response
    return createResponse(404, {
      message: 'Route not found',
      path: path,
      method: method
    });

  } catch (error) {
    console.error('API Error:', error);
    return createResponse(500, {
      message: 'Server error',
      error: error.message
    });
  }
};