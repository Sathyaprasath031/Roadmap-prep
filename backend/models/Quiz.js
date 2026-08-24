const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  answers: [{
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    selectedOption: { type: Number },
    correct: { type: Boolean },
  }],
  score: { type: Number, required: true },
  timeTaken: { type: Number, default: 0 },
}, { timestamps: true });

quizResultSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('QuizResult', quizResultSchema);
