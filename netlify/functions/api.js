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
  fatherName: { type: String, default: '' },
  motherName: { type: String, default: '' },
  dob: { type: Date },
  currentClass: { type: String, required: true },
  bloodGroup: { type: String, default: '' },
  address: { type: String, default: '' },
  phoneNumber: { type: String, default: '' },
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

const FeeDepositSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  admissionNumber: { type: String, required: true },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, default: 'Cash' },
  depositDate: { type: Date, default: Date.now },
  remarks: { type: String, default: '' }
}, { timestamps: true });

const ClassFeeSchema = new mongoose.Schema({
  className: { type: String, required: true, unique: true },
  totalFees: { type: Number, required: true },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Create indexes for better performance
MarksheetSchema.index({ rollNumber: 1, examType: 1, academicYear: 1 }, { unique: true });
StudentSchema.index({ currentClass: 1 });
FeeDepositSchema.index({ admissionNumber: 1, month: 1, year: 1 });
ClassFeeSchema.index({ className: 1 });

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);
const Marksheet = mongoose.models.Marksheet || mongoose.model('Marksheet', MarksheetSchema);
const FeeDeposit = mongoose.models.FeeDeposit || mongoose.model('FeeDeposit', FeeDepositSchema);
const ClassFee = mongoose.models.ClassFee || mongoose.model('ClassFee', ClassFeeSchema);

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

        // Get query parameters
        const query = event.queryStringParameters || {};
        const searchTerm = query.search;

        let students;
        if (searchTerm) {
          // Search by name, admission number, or class
          students = await Student.find({
            $or: [
              { studentName: { $regex: searchTerm, $options: 'i' } },
              { admissionNumber: { $regex: searchTerm, $options: 'i' } },
              { currentClass: { $regex: searchTerm, $options: 'i' } }
            ]
          }).sort({ createdAt: -1 });
        } else {
          students = await Student.find().sort({ createdAt: -1 });
        }

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

        // Enhanced validation
        const { admissionNumber, studentName, currentClass, feeDetails } = parsedBody;
        
        // Required field validation
        if (!admissionNumber || !admissionNumber.trim()) {
          return createResponse(400, { message: 'Admission Number is required' });
        }
        if (!studentName || !studentName.trim()) {
          return createResponse(400, { message: 'Student Name is required' });
        }
        if (!currentClass || !currentClass.trim()) {
          return createResponse(400, { message: 'Current Class is required' });
        }
        if (!feeDetails || !feeDetails.totalFee || feeDetails.totalFee <= 0) {
          return createResponse(400, { message: 'Total Fee must be greater than 0' });
        }

        // Process and validate data
        const studentData = {
          admissionNumber: admissionNumber.trim(),
          studentName: studentName.trim(),
          fatherName: parsedBody.fatherName?.trim() || '',
          motherName: parsedBody.motherName?.trim() || '',
          dob: parsedBody.dob ? new Date(parsedBody.dob) : undefined,
          currentClass: currentClass.trim(),
          bloodGroup: parsedBody.bloodGroup?.trim() || '',
          address: parsedBody.address?.trim() || '',
          phoneNumber: parsedBody.phoneNumber?.trim() || '',
          photo: parsedBody.photo || '',
          feeDetails: {
            totalFee: parseFloat(feeDetails.totalFee) || 0,
            amountPaid: parseFloat(feeDetails.amountPaid) || 0,
            remainingAmount: (parseFloat(feeDetails.totalFee) || 0) - (parseFloat(feeDetails.amountPaid) || 0)
          }
        };

        console.log('Creating student with data:', {
          admissionNumber: studentData.admissionNumber,
          studentName: studentData.studentName,
          currentClass: studentData.currentClass,
          feeDetails: studentData.feeDetails
        });

        const student = new Student(studentData);
        await student.save();

        console.log('Student created successfully:', student._id);

        return createResponse(201, { 
          message: 'Student created successfully',
          student: {
            _id: student._id,
            admissionNumber: student.admissionNumber,
            studentName: student.studentName,
            currentClass: student.currentClass
          }
        });
      } catch (error) {
        console.error('Student creation error:', error);
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          code: error.code,
          errors: error.errors
        });
        
        if (error.code === 11000) {
          return createResponse(400, { message: 'Student with this admission number already exists' });
        }
        
        if (error.name === 'ValidationError') {
          const validationErrors = Object.values(error.errors).map(err => `${err.path}: ${err.message}`);
          return createResponse(400, { 
            message: 'Validation failed', 
            errors: validationErrors 
          });
        }
        
        return createResponse(500, { 
          message: 'Failed to create student', 
          error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
      }
    }

    // Dashboard stats endpoint
    if (path === '/api/students/stats/dashboard' && method === 'GET') {
      try {
        const user = authenticateToken(headers);
        if (!user) {
          return createResponse(401, { message: 'Access token required' });
        }

        const totalStudents = await Student.countDocuments();
        
        // Calculate payment status counts
        const students = await Student.find({}, 'feeDetails');
        let paidStudents = 0;
        let partialPaidStudents = 0;
        let unpaidStudents = 0;
        let totalCollected = 0;
        let totalPending = 0;

        students.forEach(student => {
          const { totalFee = 0, amountPaid = 0 } = student.feeDetails || {};
          totalCollected += amountPaid;
          totalPending += Math.max(0, totalFee - amountPaid);

          if (totalFee === 0) {
            // No fee set
            return;
          } else if (amountPaid >= totalFee) {
            paidStudents++;
          } else if (amountPaid > 0) {
            partialPaidStudents++;
          } else {
            unpaidStudents++;
          }
        });

        // Calculate academic performance (mock data for now)
        const passedStudents = Math.floor(totalStudents * 0.8); // 80% pass rate
        const failedStudents = totalStudents - passedStudents;
        const graduatedStudents = Math.floor(totalStudents * 0.1); // 10% graduated

        const stats = {
          totalStudents,
          paidStudents,
          partialPaidStudents,
          unpaidStudents,
          failedStudents,
          passedStudents,
          graduatedStudents,
          averageAttendance: 95, // Mock data
          feeStats: {
            totalCollected,
            totalPending
          }
        };

        return createResponse(200, stats);
      } catch (error) {
        console.error('Dashboard stats error:', error);
        return createResponse(500, { message: 'Failed to fetch dashboard stats', error: error.message });
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

    // Fee Deposits routes
    if (path === '/api/fee-deposits' && method === 'GET') {
      try {
        const user = authenticateToken(headers);
        if (!user) {
          return createResponse(401, { message: 'Access token required' });
        }

        const deposits = await FeeDeposit.find().populate('studentId', 'studentName admissionNumber').sort({ createdAt: -1 });
        return createResponse(200, { deposits });
      } catch (error) {
        console.error('Fee deposits fetch error:', error);
        return createResponse(500, { message: 'Failed to fetch fee deposits', error: error.message });
      }
    }

    if (path === '/api/fee-deposits' && method === 'POST') {
      try {
        const user = authenticateToken(headers);
        if (!user) {
          return createResponse(401, { message: 'Access token required' });
        }

        const { admissionNumber, month, year, amount, paymentMethod, depositDate, remarks } = parsedBody;
        
        if (!admissionNumber || !month || !year || !amount) {
          return createResponse(400, { message: 'Required fields missing' });
        }

        // Find student by admission number
        const student = await Student.findOne({ admissionNumber });
        if (!student) {
          return createResponse(400, { message: 'Student not found' });
        }

        const deposit = new FeeDeposit({
          studentId: student._id,
          admissionNumber,
          month,
          year: parseInt(year),
          amount: parseFloat(amount),
          paymentMethod: paymentMethod || 'Cash',
          depositDate: depositDate ? new Date(depositDate) : new Date(),
          remarks: remarks || ''
        });

        await deposit.save();
        return createResponse(201, { message: 'Fee deposit created successfully', deposit });
      } catch (error) {
        console.error('Fee deposit creation error:', error);
        return createResponse(500, { message: 'Failed to create fee deposit', error: error.message });
      }
    }

    if (path.startsWith('/api/fee-deposits/') && method === 'PUT') {
      try {
        const user = authenticateToken(headers);
        if (!user) {
          return createResponse(401, { message: 'Access token required' });
        }

        const depositId = path.split('/')[3];
        const { admissionNumber, month, year, amount, paymentMethod, depositDate, remarks } = parsedBody;

        const deposit = await FeeDeposit.findById(depositId);
        if (!deposit) {
          return createResponse(404, { message: 'Fee deposit not found' });
        }

        // Update deposit
        deposit.admissionNumber = admissionNumber || deposit.admissionNumber;
        deposit.month = month || deposit.month;
        deposit.year = year ? parseInt(year) : deposit.year;
        deposit.amount = amount ? parseFloat(amount) : deposit.amount;
        deposit.paymentMethod = paymentMethod || deposit.paymentMethod;
        deposit.depositDate = depositDate ? new Date(depositDate) : deposit.depositDate;
        deposit.remarks = remarks !== undefined ? remarks : deposit.remarks;

        await deposit.save();
        return createResponse(200, { message: 'Fee deposit updated successfully', deposit });
      } catch (error) {
        console.error('Fee deposit update error:', error);
        return createResponse(500, { message: 'Failed to update fee deposit', error: error.message });
      }
    }

    if (path.startsWith('/api/fee-deposits/') && method === 'DELETE') {
      try {
        const user = authenticateToken(headers);
        if (!user) {
          return createResponse(401, { message: 'Access token required' });
        }

        const depositId = path.split('/')[3];
        const deposit = await FeeDeposit.findByIdAndDelete(depositId);
        
        if (!deposit) {
          return createResponse(404, { message: 'Fee deposit not found' });
        }

        return createResponse(200, { message: 'Fee deposit deleted successfully' });
      } catch (error) {
        console.error('Fee deposit deletion error:', error);
        return createResponse(500, { message: 'Failed to delete fee deposit', error: error.message });
      }
    }

    // Class Fees routes
    if (path === '/api/class-fees' && method === 'GET') {
      try {
        const user = authenticateToken(headers);
        if (!user) {
          return createResponse(401, { message: 'Access token required' });
        }

        const classFees = await ClassFee.find().sort({ className: 1 });
        return createResponse(200, { classFees });
      } catch (error) {
        console.error('Class fees fetch error:', error);
        return createResponse(500, { message: 'Failed to fetch class fees', error: error.message });
      }
    }

    if (path === '/api/class-fees' && method === 'POST') {
      try {
        const user = authenticateToken(headers);
        if (!user) {
          return createResponse(401, { message: 'Access token required' });
        }

        const { className, totalFees, description } = parsedBody;
        
        if (!className || !totalFees) {
          return createResponse(400, { message: 'Class name and total fees are required' });
        }

        const classFee = new ClassFee({
          className,
          totalFees: parseFloat(totalFees),
          description: description || '',
          isActive: true
        });

        await classFee.save();
        return createResponse(201, { message: 'Class fee created successfully', classFee });
      } catch (error) {
        console.error('Class fee creation error:', error);
        return createResponse(500, { message: 'Failed to create class fee', error: error.message });
      }
    }

    if (path.startsWith('/api/class-fees/') && method === 'PUT') {
      try {
        const user = authenticateToken(headers);
        if (!user) {
          return createResponse(401, { message: 'Access token required' });
        }

        const classFeeId = path.split('/')[3];
        const { className, totalFees, description, isActive } = parsedBody;

        const classFee = await ClassFee.findById(classFeeId);
        if (!classFee) {
          return createResponse(404, { message: 'Class fee not found' });
        }

        classFee.className = className || classFee.className;
        classFee.totalFees = totalFees ? parseFloat(totalFees) : classFee.totalFees;
        classFee.description = description !== undefined ? description : classFee.description;
        classFee.isActive = isActive !== undefined ? isActive : classFee.isActive;

        await classFee.save();
        return createResponse(200, { message: 'Class fee updated successfully', classFee });
      } catch (error) {
        console.error('Class fee update error:', error);
        return createResponse(500, { message: 'Failed to update class fee', error: error.message });
      }
    }

    if (path.startsWith('/api/class-fees/') && method === 'DELETE') {
      try {
        const user = authenticateToken(headers);
        if (!user) {
          return createResponse(401, { message: 'Access token required' });
        }

        const classFeeId = path.split('/')[3];
        const classFee = await ClassFee.findByIdAndDelete(classFeeId);
        
        if (!classFee) {
          return createResponse(404, { message: 'Class fee not found' });
        }

        return createResponse(200, { message: 'Class fee deleted successfully' });
      } catch (error) {
        console.error('Class fee deletion error:', error);
        return createResponse(500, { message: 'Failed to delete class fee', error: error.message });
      }
    }

    if (path.startsWith('/api/class-fees/') && path.endsWith('/apply-to-students') && method === 'POST') {
      try {
        const user = authenticateToken(headers);
        if (!user) {
          return createResponse(401, { message: 'Access token required' });
        }

        const classFeeId = path.split('/')[3];
        const classFee = await ClassFee.findById(classFeeId);
        
        if (!classFee) {
          return createResponse(404, { message: 'Class fee not found' });
        }

        // Find all students in this class
        const students = await Student.find({ currentClass: classFee.className });
        
        // Update their fee details
        for (const student of students) {
          student.feeDetails.totalFee = classFee.totalFees;
          student.feeDetails.remainingAmount = classFee.totalFees - (student.feeDetails.amountPaid || 0);
          await student.save();
        }

        return createResponse(200, { 
          message: `Class fee applied to ${students.length} students`,
          studentsUpdated: students.length
        });
      } catch (error) {
        console.error('Apply class fee error:', error);
        return createResponse(500, { message: 'Failed to apply class fee to students', error: error.message });
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
