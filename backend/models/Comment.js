const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roadmap: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap', required: true },
  stepOrder: { type: Number, required: true },
  content: { type: String, required: true, maxlength: 2000 },
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

commentSchema.index({ roadmap: 1, stepOrder: 1 });

module.exports = mongoose.model('Comment', commentSchema);
