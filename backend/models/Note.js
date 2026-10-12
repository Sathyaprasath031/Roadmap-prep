const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, enum: ['Question', 'Step'], required: true },
  targetId: { type: String, required: true }, // Question ID or 'roadmapId-stepOrder'
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', default: null },
  roadmap: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap', default: null },
  stepOrder: { type: Number, default: null },
  title: { type: String, default: '' },
  content: { type: String, required: true },
}, { timestamps: true });

noteSchema.index({ user: 1, targetType: 1, targetId: 1 });
noteSchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model('Note', noteSchema);
