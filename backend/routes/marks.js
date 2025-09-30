const express = require('express');
const { body, validationResult } = require('express-validator');
const Student = require('../models/Student');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/marks/add
// @desc    Add/update marks for a student
// @access  Private
router.post('/add', [
  auth,
  body('admissionNumber', 'Admission number is required').not().isEmpty(),
  body('examType', 'Exam type is required').isIn(['unitTest', 'halfYearly', 'annual']),
  body('marks', 'Marks object is required').isObject()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { admissionNumber, examType, marks } = req.body;

  try {
    // Find the student
    const student = await Student.findOne({ admissionNumber });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Validate marks - ensure all values are numbers
    const validatedMarks = {};
    for (const [subject, mark] of Object.entries(marks)) {
      if (mark === '' || mark === null || mark === undefined) {
        validatedMarks[subject] = 0;
      } else {
        const numMark = parseFloat(mark);
        if (isNaN(numMark) || numMark < 0) {
          return res.status(400).json({ 
            message: `Invalid marks for ${subject}. Must be a non-negative number.` 
          });
        }
        validatedMarks[subject] = numMark;
      }
    }

    // Update the marks
    student.marks[examType] = validatedMarks;
    await student.save();

    res.json({ 
      message: 'Marks updated successfully',
      student: {
        admissionNumber: student.admissionNumber,
        studentName: student.studentName,
        currentClass: student.currentClass,
        marks: student.marks
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/marks/:admissionNumber
// @desc    Get marks for a specific student
// @access  Private
router.get('/:admissionNumber', auth, async (req, res) => {
  try {
    const student = await Student.findOne({ admissionNumber: req.params.admissionNumber });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({
      admissionNumber: student.admissionNumber,
      studentName: student.studentName,
      currentClass: student.currentClass,
      marks: student.marks || {
        unitTest: {},
        halfYearly: {},
        annual: {}
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/marks/class/:class
// @desc    Get marks for all students in a class
// @access  Private
router.get('/class/:class', auth, async (req, res) => {
  try {
    const students = await Student.find({ currentClass: req.params.class })
      .select('admissionNumber studentName currentClass marks')
      .sort({ studentName: 1 });

    res.json(students.map(student => ({
      admissionNumber: student.admissionNumber,
      studentName: student.studentName,
      currentClass: student.currentClass,
      marks: student.marks || {
        unitTest: {},
        halfYearly: {},
        annual: {}
      }
    })));
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/marks/subjects/list
// @desc    Get list of common subjects
// @access  Private
router.get('/subjects/list', auth, async (req, res) => {
  try {
    // Common subjects for school management
    const subjects = [
      'English',
      'Mathematics',
      'Science',
      'Social Studies',
      'Hindi',
      'Computer Science',
      'Physical Education',
      'Art',
      'Music',
      'Economics',
      'Business Studies',
      'Accountancy',
      'Physics',
      'Chemistry',
      'Biology',
      'History',
      'Geography',
      'Political Science',
      'Psychology',
      'Sociology'
    ];

    res.json({ subjects });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
