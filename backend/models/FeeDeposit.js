const mongoose = require('mongoose');

const feeDepositSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  admissionNumber: {
    type: String,
    required: true
  },
  month: {
    type: String,
    required: true,
    enum: ['January', 'February', 'March', 'April', 'May', 'June', 
           'July', 'August', 'September', 'October', 'November', 'December']
  },
  year: {
    type: Number,
    required: true,
    min: 2020,
    max: 2030
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Cheque', 'Bank Transfer', 'Online', 'Other'],
    default: 'Cash'
  },
  depositDate: {
    type: Date,
    default: Date.now
  },
  remarks: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for better query performance
feeDepositSchema.index({ admissionNumber: 1, month: 1, year: 1 });
feeDepositSchema.index({ studentId: 1, depositDate: -1 });

module.exports = mongoose.model('FeeDeposit', feeDepositSchema);