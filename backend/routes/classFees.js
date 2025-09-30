const express = require('express');
const router = express.Router();
const ClassFee = require('../models/ClassFee');
const Student = require('../models/Student');
const auth = require('../middleware/auth');

// @route   GET /api/class-fees
// @desc    Get all class fees
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const classFees = await ClassFee.find({ isActive: true })
      .populate('createdBy', 'name email')
      .sort({ className: 1 });
    
    res.json(classFees);
  } catch (error) {
    console.error('Error fetching class fees:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/class-fees/:id
// @desc    Get class fee by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const classFee = await ClassFee.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!classFee) {
      return res.status(404).json({ message: 'Class fee not found' });
    }
    
    res.json(classFee);
  } catch (error) {
    console.error('Error fetching class fee:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/class-fees
// @desc    Create new class fee
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { className, totalFees, description } = req.body;
    
    // Check if class fee already exists
    const existingClassFee = await ClassFee.findOne({ 
      className: className.toUpperCase() 
    });
    
    if (existingClassFee) {
      return res.status(400).json({ 
        message: 'Class fee for this class already exists' 
      });
    }
    
    const classFee = new ClassFee({
      className: className.toUpperCase(),
      totalFees,
      description,
      createdBy: req.admin.id
    });
    
    await classFee.save();
    
    // Update all students in this class with the new fee
    await updateStudentsInClass(className.toUpperCase(), totalFees);
    
    res.status(201).json(classFee);
  } catch (error) {
    console.error('Error creating class fee:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/class-fees/:id
// @desc    Update class fee
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { className, totalFees, description, isActive } = req.body;
    
    const classFee = await ClassFee.findById(req.params.id);
    if (!classFee) {
      return res.status(404).json({ message: 'Class fee not found' });
    }
    
    // Check if class name is being changed and if it conflicts
    if (className && className.toUpperCase() !== classFee.className) {
      const existingClassFee = await ClassFee.findOne({ 
        className: className.toUpperCase(),
        _id: { $ne: req.params.id }
      });
      
      if (existingClassFee) {
        return res.status(400).json({ 
          message: 'Class fee for this class already exists' 
        });
      }
    }
    
    const oldClassName = classFee.className;
    const oldTotalFees = classFee.totalFees;
    
    classFee.className = className ? className.toUpperCase() : classFee.className;
    classFee.totalFees = totalFees !== undefined ? totalFees : classFee.totalFees;
    classFee.description = description !== undefined ? description : classFee.description;
    classFee.isActive = isActive !== undefined ? isActive : classFee.isActive;
    
    await classFee.save();
    
    // If fees changed, update all students in this class
    if (totalFees !== undefined && totalFees !== oldTotalFees) {
      await updateStudentsInClass(classFee.className, totalFees);
    }
    
    res.json(classFee);
  } catch (error) {
    console.error('Error updating class fee:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/class-fees/:id
// @desc    Delete class fee (soft delete)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const classFee = await ClassFee.findById(req.params.id);
    if (!classFee) {
      return res.status(404).json({ message: 'Class fee not found' });
    }
    
    classFee.isActive = false;
    await classFee.save();
    
    res.json({ message: 'Class fee deleted successfully' });
  } catch (error) {
    console.error('Error deleting class fee:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/class-fees/:id/apply-to-students
// @desc    Apply class fee to all students in the class
// @access  Private
router.post('/:id/apply-to-students', auth, async (req, res) => {
  try {
    const classFee = await ClassFee.findById(req.params.id);
    if (!classFee) {
      return res.status(404).json({ message: 'Class fee not found' });
    }
    
    const updatedCount = await updateStudentsInClass(classFee.className, classFee.totalFees);
    
    res.json({ 
      message: `Class fee applied to ${updatedCount} students`,
      updatedCount 
    });
  } catch (error) {
    console.error('Error applying class fee to students:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to update students in a class with new fees
async function updateStudentsInClass(className, totalFees) {
  try {
    const result = await Student.updateMany(
      { currentClass: className },
      { 
        $set: { 
          'feeDetails.totalFee': totalFees,
          updatedAt: new Date()
        }
      }
    );
    
    return result.modifiedCount;
  } catch (error) {
    console.error('Error updating students in class:', error);
    throw error;
  }
}

module.exports = router;
