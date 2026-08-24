const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roadmap: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap', required: true },
  completedSteps: [{ type: Number }],
  bookmarkedQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  notes: { type: String, default: '' },
  startedAt: { type: Date, default: Date.now },
  lastAccessedAt: { type: Date, default: Date.now },
}, { timestamps: true });

progressSchema.index({ user: 1, roadmap: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
