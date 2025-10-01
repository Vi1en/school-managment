const mongoose = require('mongoose');

// Student Schema (simplified for testing)
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
    remainingAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['paid', 'partial', 'unpaid'], default: 'unpaid' }
  }
}, { timestamps: true });

const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);

exports.handler = async (event, context) => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          message: 'MONGODB_URI not configured',
          hasUri: false
        })
      };
    }

    console.log('Connecting to MongoDB with URI:', mongoUri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Test database connection by counting students
    const studentCount = await Student.countDocuments();
    const students = await Student.find().limit(5).select('admissionNumber studentName currentClass');

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Database connection successful',
        hasUri: true,
        studentCount: studentCount,
        sampleStudents: students,
        connectionStatus: 'connected'
      })
    };
  } catch (error) {
    console.error('Database connection error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Database connection failed',
        error: error.message,
        hasUri: !!process.env.MONGODB_URI
      })
    };
  }
};
