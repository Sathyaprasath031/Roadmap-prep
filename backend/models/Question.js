const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  answer: { type: String, required: true },
  category: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  tags: [{ type: String }],
  roadmap: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap' },
  company: [{ type: String }],
  frequency: { type: Number, default: 0 },
  eli5Answer: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
