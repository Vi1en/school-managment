const mongoose = require('mongoose');

const classFeeSchema = new mongoose.Schema({
  className: {
    type: String,
    required: [true, 'Class name is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  totalFees: {
    type: Number,
    required: [true, 'Total fees is required'],
    min: [0, 'Total fees cannot be negative']
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
classFeeSchema.index({ className: 1 });
classFeeSchema.index({ isActive: 1 });

module.exports = mongoose.model('ClassFee', classFeeSchema);
