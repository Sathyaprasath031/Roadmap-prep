const mongoose = require('mongoose');

const mockSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'Mock Interview Session' },
  category: { type: String, default: 'General' },
  difficulty: { type: String, default: 'Mixed' },
  durationMinutes: { type: Number, default: 30 },
  timeSpentSeconds: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  questions: [{
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    userNotes: { type: String, default: '' },
    selfConfidence: { type: String, enum: ['solid', 'fuzzy', 'unclear', null], default: null },
  }],
}, { timestamps: true });

mockSessionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('MockSession', mockSessionSchema);
