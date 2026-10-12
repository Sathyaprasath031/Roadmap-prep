const mongoose = require('mongoose');

const studyPlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  targetRole: { type: String, default: 'Software Engineer' },
  targetCompany: { type: String, default: '' },
  interviewDate: { type: Date, required: true },
  dailyHoursGoal: { type: Number, default: 2 },
  primaryRoadmap: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap', default: null },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
