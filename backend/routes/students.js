const express = require('express');
const { body, validationResult } = require('express-validator');
const Student = require('../models/Student');
const Settings = require('../models/Settings');
const auth = require('../middleware/auth');
const { handleUpload } = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/students
// @desc    Get all students with optional filtering
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { class: currentClass, status, paymentStatus, search, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    if (currentClass) {
      query.currentClass = currentClass;
    }
    
    if (status) {
      query.passFailStatus = status;
    }
    
    if (paymentStatus) {
      query['feeDetails.paymentStatus'] = paymentStatus;
    }

    // Add search functionality for name and admission number
    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { admissionNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await Student.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Student.countDocuments(query);

    res.json({
      students,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/students/stats/dashboard
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats/dashboard', auth, async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const passedStudents = await Student.countDocuments({ passFailStatus: 'Pass' });
    const failedStudents = await Student.countDocuments({ passFailStatus: 'Fail' });
    const graduatedStudents = await Student.countDocuments({ graduationStatus: 'Graduated' });
    
    const paidStudents = await Student.countDocuments({ 'feeDetails.paymentStatus': 'Paid' });
    const partialPaidStudents = await Student.countDocuments({ 'feeDetails.paymentStatus': 'Partial' });
    const unpaidStudents = await Student.countDocuments({ 'feeDetails.paymentStatus': 'Unpaid' });

    // Calculate total fees
    const feeStats = await Student.aggregate([
      {
        $group: {
          _id: null,
          totalFees: { $sum: '$feeDetails.totalFee' },
          totalPaid: { $sum: '$feeDetails.amountPaid' },
          totalPending: { $sum: { $subtract: ['$feeDetails.totalFee', '$feeDetails.amountPaid'] } }
        }
      }
    ]);

    // Calculate average attendance
    const attendanceStats = await Student.aggregate([
      {
        $group: {
          _id: null,
          averageAttendance: { $avg: '$attendance' }
        }
      }
    ]);

    res.json({
      totalStudents,
      passedStudents,
      failedStudents,
      graduatedStudents,
      paidStudents,
      partialPaidStudents,
      unpaidStudents,
      feeStats: feeStats[0] || { totalFees: 0, totalPaid: 0, totalPending: 0 },
      averageAttendance: attendanceStats[0]?.averageAttendance || 0
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/students/:admissionNumber/marksheet/half-yearly
// @desc    Generate Half Yearly marksheet
// @access  Private
router.get('/:admissionNumber/marksheet/half-yearly', auth, async (req, res) => {
  try {
    const student = await Student.findOne({ admissionNumber: req.params.admissionNumber });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get settings for pass percentage
    const Settings = require('../models/Settings');
    const settings = await Settings.getSettings();

    // Calculate grade based on marks
    const getGrade = (marks) => {
      if (marks >= 90) return 'A+';
      if (marks >= 80) return 'A';
      if (marks >= 70) return 'B+';
      if (marks >= 60) return 'B';
      if (marks >= 50) return 'C+';
      if (marks >= 40) return 'C';
      return 'F';
    };

    // Calculate Half Yearly marks
    const unitTest1 = student.unitTest1Marks || 0;
    const unitTest2 = student.unitTest2Marks || 0;
    const halfYearly = student.halfYearlyMarks || 0;
    const totalMarks = unitTest1 + unitTest2 + halfYearly;
    const percentage = (totalMarks / 100) * 100;
    const grade = getGrade(percentage);
    const passPercentage = settings.passPercentage || 40;
    const status = percentage >= passPercentage ? 'PASS' : 'FAIL';



    const marksheet = {
      student: {
        name: student.studentName,
        admissionNumber: student.admissionNumber,
        fatherName: student.fatherName,
        motherName: student.motherName,
        currentClass: student.currentClass,
        dob: student.dob,
        address: student.address,
        photo: student.photo
      },
      marksheetType: 'Half Yearly',
      academicYear: new Date().getFullYear(),
      marks: {
        unitTest1: { obtained: unitTest1, outOf: 10 },
        unitTest2: { obtained: unitTest2, outOf: 10 },
        halfYearly: { obtained: halfYearly, outOf: 80 },
        total: { obtained: totalMarks, outOf: 100 }
      },
      subjectMarks: student.marks?.halfYearly || {},
      attendance: {
        percentage: student.attendance || 0,
        status: (student.attendance || 0) >= 75 ? 'Satisfactory' : 'Unsatisfactory'
      },
      result: {
        percentage: percentage.toFixed(2),
        grade: grade,
        status: status,
        passPercentage: passPercentage
      },
      generatedAt: new Date()
    };

    res.json(marksheet);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/students/:admissionNumber/marksheet/annual
// @desc    Generate Annual marksheet
// @access  Private
router.get('/:admissionNumber/marksheet/annual', auth, async (req, res) => {
  try {
    const student = await Student.findOne({ admissionNumber: req.params.admissionNumber });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get settings for pass percentage
    const Settings = require('../models/Settings');
    const settings = await Settings.getSettings();

    // Calculate grade based on marks
    const getGrade = (marks) => {
      if (marks >= 90) return 'A+';
      if (marks >= 80) return 'A';
      if (marks >= 70) return 'B+';
      if (marks >= 60) return 'B';
      if (marks >= 50) return 'C+';
      if (marks >= 40) return 'C';
      return 'F';
    };

    // Calculate Annual marks
    const unitTest3 = student.unitTest3Marks || 0;
    const unitTest4 = student.unitTest4Marks || 0;
    const annual = student.annualExamMarks || 0;
    const totalMarks = unitTest3 + unitTest4 + annual;
    const percentage = (totalMarks / 100) * 100;
    const grade = getGrade(percentage);
    const passPercentage = settings.passPercentage || 40;
    const status = percentage >= passPercentage ? 'PASS' : 'FAIL';


    const marksheet = {
      student: {
        name: student.studentName,
        admissionNumber: student.admissionNumber,
        fatherName: student.fatherName,
        motherName: student.motherName,
        currentClass: student.currentClass,
        dob: student.dob,
        address: student.address,
        photo: student.photo
      },
      marksheetType: 'Annual',
      academicYear: new Date().getFullYear(),
      marks: {
        unitTest3: { obtained: unitTest3, outOf: 10 },
        unitTest4: { obtained: unitTest4, outOf: 10 },
        annual: { obtained: annual, outOf: 80 },
        total: { obtained: totalMarks, outOf: 100 }
      },
      subjectMarks: student.marks?.annual || {},
      attendance: {
        percentage: student.attendance || 0,
        status: (student.attendance || 0) >= 75 ? 'Satisfactory' : 'Unsatisfactory'
      },
      result: {
        percentage: percentage.toFixed(2),
        grade: grade,
        status: status,
        passPercentage: passPercentage
      },
      generatedAt: new Date()
    };

    res.json(marksheet);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/students/:admissionNumber
// @desc    Get student by admission number
// @access  Private
router.get('/:admissionNumber', auth, async (req, res) => {
  try {
    const student = await Student.findOne({ admissionNumber: req.params.admissionNumber });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/students
// @desc    Add new student
// @access  Private
router.post('/', [
  auth,
  handleUpload,
  body('admissionNumber').notEmpty().trim(),
  body('studentName').notEmpty().trim(),
  body('currentClass').notEmpty().trim(),
  body('feeDetails.totalFee').isNumeric().withMessage('Total fee must be a number'),
  body('feeDetails.amountPaid').isNumeric().withMessage('Amount paid must be a number')
], async (req, res) => {
  try {
    // Convert FormData string values to numbers for fee fields
    if (req.body['feeDetails.totalFee']) {
      req.body['feeDetails.totalFee'] = parseFloat(req.body['feeDetails.totalFee']);
    }
    if (req.body['feeDetails.amountPaid']) {
      req.body['feeDetails.amountPaid'] = parseFloat(req.body['feeDetails.amountPaid']);
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if admission number already exists
    const existingStudent = await Student.findOne({ admissionNumber: req.body.admissionNumber });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student with this admission number already exists' });
    }

    // Prepare student data
    const studentData = { ...req.body };
    
    // Handle photo upload
    if (req.file) {
      // Store the file path relative to the backend
      studentData.photo = `/uploads/${req.file.filename}`;
    }

    const student = new Student(studentData);
    await student.save();

    res.status(201).json(student);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/students/:admissionNumber
// @desc    Update student
// @access  Private
router.put('/:admissionNumber', [
  auth,
  handleUpload,
  body('studentName').optional().notEmpty().trim(),
  body('currentClass').optional().notEmpty().trim(),
  body('feeDetails.totalFee').optional().isNumeric(),
  body('feeDetails.amountPaid').optional().isNumeric(),
  body('attendance').optional().isNumeric().isFloat({ min: 0, max: 100 }),
  body('unitTest1Marks').optional().isNumeric().isFloat({ min: 0, max: 100 }),
  body('unitTest2Marks').optional().isNumeric().isFloat({ min: 0, max: 100 }),
  body('halfYearlyMarks').optional().isNumeric().isFloat({ min: 0, max: 100 }),
  body('unitTest3Marks').optional().isNumeric().isFloat({ min: 0, max: 100 }),
  body('unitTest4Marks').optional().isNumeric().isFloat({ min: 0, max: 100 }),
  body('annualExamMarks').optional().isNumeric().isFloat({ min: 0, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Prepare update data
    const updateData = { ...req.body };
    
    // Handle photo upload
    if (req.file) {
      // Store the file path relative to the backend
      updateData.photo = `/uploads/${req.file.filename}`;
    }

    const student = await Student.findOneAndUpdate(
      { admissionNumber: req.params.admissionNumber },
      updateData,
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/students/:admissionNumber
// @desc    Delete student
// @access  Private
router.delete('/:admissionNumber', auth, async (req, res) => {
  try {
    const student = await Student.findOneAndDelete({ admissionNumber: req.params.admissionNumber });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/students/:admissionNumber/marksheet
// @desc    Generate student marksheet (legacy - shows both)
// @access  Private
router.get('/:admissionNumber/marksheet', auth, async (req, res) => {
  try {
    const student = await Student.findOne({ admissionNumber: req.params.admissionNumber });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get settings for pass percentage
    const Settings = require('../models/Settings');
    const settings = await Settings.getSettings();

    // Calculate grade based on average marks
    const getGrade = (marks) => {
      if (marks >= 90) return 'A+';
      if (marks >= 80) return 'A';
      if (marks >= 70) return 'B+';
      if (marks >= 60) return 'B';
      if (marks >= 50) return 'C+';
      if (marks >= 40) return 'C';
      return 'F';
    };

    const marksheet = {
      student: {
        name: student.studentName,
        admissionNumber: student.admissionNumber,
        fatherName: student.fatherName,
        motherName: student.motherName,
        currentClass: student.currentClass,
        dob: student.dob,
        address: student.address,
        photo: student.photo
      },
      academicYear: new Date().getFullYear(),
      examResults: {
        unitTest: {
          marks: student.unitTestMarks,
          grade: getGrade(student.unitTestMarks)
        },
        halfYearly: {
          marks: student.halfYearlyMarks,
          grade: getGrade(student.halfYearlyMarks)
        },
        annualExam: {
          marks: student.annualExamMarks,
          grade: getGrade(student.annualExamMarks)
        },
        average: {
          marks: student.averageMarks,
          grade: getGrade(student.averageMarks)
        }
      },
      attendance: {
        percentage: student.attendance,
        status: student.attendance >= 75 ? 'Satisfactory' : 'Unsatisfactory'
      },
      result: {
        status: student.passFailStatus,
        promotedTo: student.promotedToClass,
        passPercentage: settings.passPercentage
      },
      generatedOn: new Date().toISOString()
    };

    res.json(marksheet);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
