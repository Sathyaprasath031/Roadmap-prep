const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, enum: ['article', 'video', 'course', 'book', 'practice', 'tool'], required: true },
  description: { type: String, default: '' },
  free: { type: Boolean, default: true },
});

const stepSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  order: { type: Number, required: true },
  resources: [resourceSchema],
  topics: [{ type: String }],
});

const roadmapSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  icon: { type: String, default: '' },
  color: { type: String, default: '#6366f1' },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
  estimatedHours: { type: Number, default: 0 },
  steps: [stepSchema],
  tags: [{ type: String }],
}, { timestamps: true });

roadmapSchema.virtual('stepCount').get(function () {
  return this.steps?.length || 0;
});

roadmapSchema.set('toJSON', { virtuals: true });
roadmapSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Roadmap', roadmapSchema);
