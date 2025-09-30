const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  passPercentage: {
    type: Number,
    default: 40,
    min: 0,
    max: 100
  },
  schoolName: {
    type: String,
    default: 'School Management System'
  },
  academicYear: {
    type: String,
    default: new Date().getFullYear().toString()
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
