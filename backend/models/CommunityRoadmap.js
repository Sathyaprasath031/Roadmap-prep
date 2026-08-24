const mongoose = require('mongoose');

const communityRoadmapSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  icon: { type: String, default: '📋' },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
  tags: [{ type: String }],
  steps: [{
    title: { type: String, required: true },
    description: { type: String, default: '' },
    order: { type: Number, required: true },
    resources: [{
      title: String,
      url: String,
      type: { type: String, enum: ['article', 'video', 'course', 'book', 'practice', 'tool'], default: 'article' },
      description: { type: String, default: '' },
    }],
    topics: [{ type: String }],
  }],
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  forks: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: true },
}, { timestamps: true });

communityRoadmapSchema.index({ isPublic: 1, createdAt: -1 });

module.exports = mongoose.model('CommunityRoadmap', communityRoadmapSchema);
