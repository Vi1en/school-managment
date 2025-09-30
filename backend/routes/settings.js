const express = require('express');
const { body, validationResult } = require('express-validator');
const Settings = require('../models/Settings');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/settings
// @desc    Get settings
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json(settings);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/settings
// @desc    Update settings
// @access  Private
router.put('/', [
  auth,
  body('passPercentage').optional().isNumeric().isFloat({ min: 0, max: 100 }),
  body('schoolName').optional().notEmpty().trim(),
  body('academicYear').optional().notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings(req.body);
    } else {
      Object.assign(settings, req.body);
    }

    await settings.save();

    // If pass percentage is updated, recalculate all students
    if (req.body.passPercentage !== undefined) {
      const Student = require('../models/Student');
      const students = await Student.find();
      
      for (const student of students) {
        await student.save(); // This will trigger the pre-save middleware
      }
    }

    res.json(settings);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
