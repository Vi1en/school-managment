const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  admissionNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  fatherName: {
    type: String,
    trim: true
  },
  motherName: {
    type: String,
    trim: true
  },
  dob: {
    type: Date
  },
  address: {
    type: String,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  bloodGroup: {
    type: String,
    trim: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  feeDetails: {
    totalFee: {
      type: Number,
      default: 0
    },
    amountPaid: {
      type: Number,
      default: 0
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Partial', 'Unpaid'],
      default: 'Unpaid'
    }
  },
  attendance: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  // Half Yearly Marksheet Components
  unitTest1Marks: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  unitTest2Marks: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  halfYearlyMarks: {
    type: Number,
    min: 0,
    max: 80,
    default: 0
  },
  // Annual Marksheet Components
  unitTest3Marks: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  unitTest4Marks: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  annualExamMarks: {
    type: Number,
    min: 0,
    max: 80,
    default: 0
  },
  averageMarks: {
    type: Number,
    default: 0
  },
  passFailStatus: {
    type: String,
    enum: ['Pass', 'Fail'],
    default: 'Fail'
  },
  currentClass: {
    type: String,
    required: true
  },
  promotedToClass: {
    type: String,
    default: function() {
      return this.currentClass;
    }
  },
  graduationStatus: {
    type: String,
    enum: ['In Progress', 'Graduated', 'Dropped Out'],
    default: 'In Progress'
  },
  graduationDate: {
    type: Date
  },
  marks: {
    unitTest: {
      type: Map,
      of: Number,
      default: {}
    },
    halfYearly: {
      type: Map,
      of: Number,
      default: {}
    },
    annual: {
      type: Map,
      of: Number,
      default: {}
    }
  },
  photo: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate average marks and promotion status
studentSchema.pre('save', function(next) {
  // Calculate Half Yearly marks (Unit Test 1 + Unit Test 2 + Half Yearly)
  const halfYearlyTotal = this.unitTest1Marks + this.unitTest2Marks + this.halfYearlyMarks;
  
  // Calculate Annual marks (Unit Test 3 + Unit Test 4 + Annual Exam)
  const annualTotal = this.unitTest3Marks + this.unitTest4Marks + this.annualExamMarks;
  
  // Calculate overall average marks
  this.averageMarks = (halfYearlyTotal + annualTotal) / 2;

  // Get pass percentage from environment or default to 40
  const passPercentage = process.env.PASS_PERCENTAGE || 40;

  // Determine pass/fail status based on both marksheets
  const halfYearlyPass = halfYearlyTotal >= (passPercentage * 100 / 100); // 40% of 100
  const annualPass = annualTotal >= (passPercentage * 100 / 100); // 40% of 100
  
  if (halfYearlyPass && annualPass) {
    this.passFailStatus = 'Pass';
    
    // Handle class 12 completion
    if (this.currentClass === '12') {
      this.graduationStatus = 'Graduated';
      this.graduationDate = new Date();
      this.promotedToClass = 'Graduated';
    } else {
      // Increment class for promotion (for classes below 12)
      const currentClassNum = parseInt(this.currentClass);
      if (!isNaN(currentClassNum)) {
        this.promotedToClass = (currentClassNum + 1).toString();
      }
    }
  } else {
    this.passFailStatus = 'Fail';
    this.promotedToClass = this.currentClass;
    
    // If failed in class 12, they don't graduate
    if (this.currentClass === '12') {
      this.graduationStatus = 'In Progress';
    }
  }

  // Update payment status based on fee details
  if (this.feeDetails.amountPaid >= this.feeDetails.totalFee) {
    this.feeDetails.paymentStatus = 'Paid';
  } else if (this.feeDetails.amountPaid > 0) {
    this.feeDetails.paymentStatus = 'Partial';
  } else {
    this.feeDetails.paymentStatus = 'Unpaid';
  }

  next();
});

module.exports = mongoose.model('Student', studentSchema);
