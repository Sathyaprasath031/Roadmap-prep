const mongoose = require('mongoose');

const reviewItemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  easeFactor: { type: Number, default: 2.5 },
  interval: { type: Number, default: 0 }, // in days
  repetitions: { type: Number, default: 0 },
  nextReviewDate: { type: Date, default: Date.now },
  lastReviewedAt: { type: Date, default: null },
  lastRating: { type: String, enum: ['forgot', 'struggled', 'got_it', null], default: null },
}, { timestamps: true });

reviewItemSchema.index({ user: 1, question: 1 }, { unique: true });
reviewItemSchema.index({ user: 1, nextReviewDate: 1 });

module.exports = mongoose.model('ReviewItem', reviewItemSchema);
