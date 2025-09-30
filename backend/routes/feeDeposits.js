const express = require('express');
const { body, validationResult } = require('express-validator');
const FeeDeposit = require('../models/FeeDeposit');
const Student = require('../models/Student');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/fee-deposits
// @desc    Get all fee deposits with optional filtering
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { admissionNumber, month, year, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    if (admissionNumber) {
      query.admissionNumber = admissionNumber;
    }
    
    if (month) {
      query.month = month;
    }
    
    if (year) {
      query.year = parseInt(year);
    }

    const deposits = await FeeDeposit.find(query)
      .populate('studentId', 'studentName admissionNumber currentClass')
      .sort({ depositDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await FeeDeposit.countDocuments(query);

    res.json({
      deposits,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/fee-deposits/:id
// @desc    Get fee deposit by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const deposit = await FeeDeposit.findById(req.params.id)
      .populate('studentId', 'studentName admissionNumber currentClass');
    
    if (!deposit) {
      return res.status(404).json({ message: 'Fee deposit not found' });
    }

    res.json(deposit);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/fee-deposits
// @desc    Create new fee deposit
// @access  Private
router.post('/', [
  auth,
  body('admissionNumber').notEmpty().trim(),
  body('month').notEmpty().isIn(['January', 'February', 'March', 'April', 'May', 'June', 
                                 'July', 'August', 'September', 'October', 'November', 'December']),
  body('year').isNumeric().isInt({ min: 2020, max: 2030 }),
  body('amount').isNumeric().isFloat({ min: 0 }),
  body('paymentMethod').optional().isIn(['Cash', 'Cheque', 'Bank Transfer', 'Online', 'Other']),
  body('depositDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Find student by admission number
    const student = await Student.findOne({ admissionNumber: req.body.admissionNumber });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if deposit already exists for this month/year
    const existingDeposit = await FeeDeposit.findOne({
      admissionNumber: req.body.admissionNumber,
      month: req.body.month,
      year: req.body.year
    });

    if (existingDeposit) {
      return res.status(400).json({ message: 'Fee deposit already exists for this month and year' });
    }

    const depositData = {
      ...req.body,
      studentId: student._id,
      year: parseInt(req.body.year)
    };

    const deposit = new FeeDeposit(depositData);
    await deposit.save();

    // Update student's total amount paid
    const totalDeposits = await FeeDeposit.aggregate([
      { $match: { admissionNumber: req.body.admissionNumber } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalPaid = totalDeposits[0]?.total || 0;
    await Student.findOneAndUpdate(
      { admissionNumber: req.body.admissionNumber },
      { 'feeDetails.amountPaid': totalPaid }
    );

    res.status(201).json(deposit);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/fee-deposits/:id
// @desc    Update fee deposit
// @access  Private
router.put('/:id', [
  auth,
  body('amount').optional().isNumeric().isFloat({ min: 0 }),
  body('paymentMethod').optional().isIn(['Cash', 'Cheque', 'Bank Transfer', 'Online', 'Other']),
  body('depositDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const deposit = await FeeDeposit.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!deposit) {
      return res.status(404).json({ message: 'Fee deposit not found' });
    }

    // Update student's total amount paid
    const totalDeposits = await FeeDeposit.aggregate([
      { $match: { admissionNumber: deposit.admissionNumber } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalPaid = totalDeposits[0]?.total || 0;
    await Student.findOneAndUpdate(
      { admissionNumber: deposit.admissionNumber },
      { 'feeDetails.amountPaid': totalPaid }
    );

    res.json(deposit);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/fee-deposits/:id
// @desc    Delete fee deposit
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const deposit = await FeeDeposit.findByIdAndDelete(req.params.id);

    if (!deposit) {
      return res.status(404).json({ message: 'Fee deposit not found' });
    }

    // Update student's total amount paid
    const totalDeposits = await FeeDeposit.aggregate([
      { $match: { admissionNumber: deposit.admissionNumber } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalPaid = totalDeposits[0]?.total || 0;
    await Student.findOneAndUpdate(
      { admissionNumber: deposit.admissionNumber },
      { 'feeDetails.amountPaid': totalPaid }
    );

    res.json({ message: 'Fee deposit deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/fee-deposits/student/:admissionNumber
// @desc    Get all fee deposits for a specific student
// @access  Private
router.get('/student/:admissionNumber', auth, async (req, res) => {
  try {
    const deposits = await FeeDeposit.find({ admissionNumber: req.params.admissionNumber })
      .sort({ year: -1, month: -1 });

    res.json(deposits);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
