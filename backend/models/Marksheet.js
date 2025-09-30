const mongoose = require('mongoose');

const marksheetSchema = new mongoose.Schema({
  rollNumber: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  class: {
    type: String,
    required: true
  },
  fatherName: {
    type: String,
    required: true
  },
  dob: {
    type: Date,
    required: true
  },
  bloodGroup: {
    type: String,
    required: true
  },
  photo: {
    type: String,
    default: null
  },
  // logo: {
  //   type: String,
  //   default: null
  // },
  subjects: [{
    subjectName: {
      type: String,
      required: true
    },
    subjectCode: {
      type: String,
      required: true
    },
    UT1: {
      type: Number,
      default: 0
    },
    UT2: {
      type: Number,
      default: 0
    },
    UT3: {
      type: Number,
      default: 0
    },
    UT4: {
      type: Number,
      default: 0
    },
    halfYearly: {
      type: Number,
      default: 0
    },
    annual: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    },
    grade: {
      type: String,
      default: 'F'
    }
  }],
  totalMarks: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  overallGrade: {
    type: String,
    default: 'F'
  },
  rank: {
    type: String,
    default: 'N/A'
  },
  promotionStatus: {
    type: String,
    enum: ['Promoted', 'Not Promoted'],
    default: 'Not Promoted'
  },
  attendance: {
    totalDays: {
      type: Number,
      default: 0
    },
    presentDays: {
      type: Number,
      default: 0
    }
  },
  examType: {
    type: String,
    enum: ['Half-Yearly', 'Annual'],
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  academicYear: {
    type: String,
    default: '2025-26'
  }
}, {
  timestamps: true
});

// Create compound unique index for rollNumber, examType, and academicYear
marksheetSchema.index({ rollNumber: 1, examType: 1, academicYear: 1 }, { unique: true });

// Calculate totals and grades before saving
marksheetSchema.pre('save', function(next) {
  if (this.subjects && this.subjects.length > 0) {
    let totalMarks = 0;
    
    this.subjects.forEach(subject => {
      if (this.examType === 'Half-Yearly') {
        subject.total = subject.UT1 + subject.UT2 + subject.halfYearly;
      } else {
        subject.total = subject.UT3 + subject.UT4 + subject.annual;
      }
      
      // Calculate grade based on total marks
      if (subject.total >= 90) subject.grade = 'A+';
      else if (subject.total >= 80) subject.grade = 'A';
      else if (subject.total >= 70) subject.grade = 'B';
      else if (subject.total >= 60) subject.grade = 'C';
      else if (subject.total >= 50) subject.grade = 'D';
      else subject.grade = 'F';
      
      totalMarks += subject.total;
    });
    
    this.totalMarks = totalMarks;
    this.percentage = Math.round((totalMarks / (this.subjects.length * 100)) * 100);
    
    // Calculate overall grade
    if (this.percentage >= 90) this.overallGrade = 'A+';
    else if (this.percentage >= 80) this.overallGrade = 'A';
    else if (this.percentage >= 70) this.overallGrade = 'B';
    else if (this.percentage >= 60) this.overallGrade = 'C';
    else if (this.percentage >= 50) this.overallGrade = 'D';
    else this.overallGrade = 'F';
    
    // Determine promotion status
    this.promotionStatus = this.percentage >= 50 ? 'Promoted' : 'Not Promoted';
  }
  
  next();
});

// Calculate rank after all marksheets are saved for the same class and exam type
marksheetSchema.post('save', async function() {
  try {
    // Prevent infinite loops by checking if this is a rank update
    if (this.isModified('rank')) {
      return;
    }
    
    // Get all marksheets for the same class and exam type
    const classMarksheets = await this.constructor.find({
      class: this.class,
      examType: this.examType,
      academicYear: this.academicYear
    }).sort({ percentage: -1, totalMarks: -1 });
    
    // Update ranks based on position
    for (let i = 0; i < classMarksheets.length; i++) {
      const marksheet = classMarksheets[i];
      const rank = i + 1;
      
      // Only update if rank has changed
      if (marksheet.rank !== rank.toString()) {
        await this.constructor.findByIdAndUpdate(
          marksheet._id, 
          { rank: rank.toString() },
          { runValidators: false } // Prevent triggering hooks again
        );
      }
    }
  } catch (error) {
    console.error('Error calculating rank:', error);
  }
});

module.exports = mongoose.model('Marksheet', marksheetSchema);
