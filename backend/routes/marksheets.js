const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { handleUpload } = require('../middleware/upload');
const Marksheet = require('../models/Marksheet');
const Student = require('../models/Student');

// @route   POST /api/marksheets
// @desc    Create a new marksheet
// @access  Private
router.post('/', [
  auth,
  body('rollNumber').notEmpty().trim(),
  body('studentName').notEmpty().trim(),
  body('class').notEmpty().trim(),
  body('fatherName').notEmpty().trim(),
  body('dob').isISO8601(),
  body('bloodGroup').notEmpty().trim(),
  body('examType').isIn(['Half-Yearly', 'Annual']),
  body('subjects').isArray({ min: 1 }),
  body('attendance.totalDays').isNumeric(),
  body('attendance.presentDays').isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    console.log('Creating marksheet with data:', req.body);
    const marksheetData = { ...req.body };

    // Check if marksheet already exists for this roll number, exam type, and academic year
    const existingMarksheet = await Marksheet.findOne({ 
      rollNumber: marksheetData.rollNumber,
      examType: marksheetData.examType,
      academicYear: marksheetData.academicYear
    });
    if (existingMarksheet) {
      return res.status(400).json({ 
        message: `Marksheet for roll number ${marksheetData.rollNumber} already exists for ${marksheetData.examType} exam in ${marksheetData.academicYear}` 
      });
    }

    // Fetch student photo from student record if rollNumber matches admissionNumber
    const student = await Student.findOne({ admissionNumber: marksheetData.rollNumber });
    if (student && student.photo) {
      marksheetData.photo = student.photo;
    }

    const marksheet = new Marksheet(marksheetData);
    await marksheet.save();

    console.log('Marksheet created successfully:', marksheet._id);
    res.status(201).json(marksheet);
  } catch (error) {
    console.error('Error creating marksheet:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/marksheets
// @desc    Get all marksheets
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const marksheets = await Marksheet.find().sort({ createdAt: -1 });
    res.json(marksheets);
  } catch (error) {
    console.error('Error fetching marksheets:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/marksheets/:rollNumber
// @desc    Get marksheet by roll number
// @access  Private
router.get('/:rollNumber', auth, async (req, res) => {
  try {
    const marksheet = await Marksheet.findOne({ rollNumber: req.params.rollNumber });
    
    if (!marksheet) {
      return res.status(404).json({ message: 'Marksheet not found' });
    }

    res.json(marksheet);
  } catch (error) {
    console.error('Error fetching marksheet:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/marksheets/:rollNumber
// @desc    Update marksheet
// @access  Private
router.put('/:rollNumber', [
  auth,
  handleUpload,
  body('studentName').optional().notEmpty().trim(),
  body('class').optional().notEmpty().trim(),
  body('fatherName').optional().notEmpty().trim(),
  body('dob').optional().isISO8601(),
  body('bloodGroup').optional().notEmpty().trim(),
  body('examType').optional().isIn(['Half-Yearly', 'Annual']),
  body('subjects').optional().isArray({ min: 1 }),
  body('attendance.totalDays').optional().isNumeric(),
  body('attendance.presentDays').optional().isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updateData = { ...req.body };
    
    // Handle uploaded files (only for photo if needed)
    if (req.file && req.file.fieldname === 'photo') {
      updateData.photo = `/uploads/${req.file.filename}`;
    }

    // Fetch student photo from student record if rollNumber matches admissionNumber
    const student = await Student.findOne({ admissionNumber: req.params.rollNumber });
    if (student && student.photo) {
      updateData.photo = student.photo;
    }

    const marksheet = await Marksheet.findOneAndUpdate(
      { rollNumber: req.params.rollNumber },
      updateData,
      { new: true, runValidators: true }
    );

    if (!marksheet) {
      return res.status(404).json({ message: 'Marksheet not found' });
    }

    res.json(marksheet);
  } catch (error) {
    console.error('Error updating marksheet:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/marksheets/:rollNumber
// @desc    Delete marksheet
// @access  Private
router.delete('/:rollNumber', auth, async (req, res) => {
  try {
    const marksheet = await Marksheet.findOneAndDelete({ rollNumber: req.params.rollNumber });

    if (!marksheet) {
      return res.status(404).json({ message: 'Marksheet not found' });
    }

    res.json({ message: 'Marksheet deleted successfully' });
  } catch (error) {
    console.error('Error deleting marksheet:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/marksheets/class/:class
// @desc    Get marksheets by class
// @access  Private
router.get('/class/:class', auth, async (req, res) => {
  try {
    const marksheets = await Marksheet.find({ class: req.params.class }).sort({ rollNumber: 1 });
    res.json(marksheets);
  } catch (error) {
    console.error('Error fetching marksheets by class:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
