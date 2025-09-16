const mongoose = require('mongoose');

const marksheetSchema = new mongoose.Schema({
  googleId: { type: String, required: true, index: true },
  filename: { type: String },
  subjects: [{
    name: String,
    marks: Number,
    maxMarks: Number,
    grade: String,
    confidence: Number
  }],
  totalMarks: Number,
  totalMaxMarks: Number,
  percentage: Number,
  confidence: Number,
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Marksheet', marksheetSchema, 'marksheets');