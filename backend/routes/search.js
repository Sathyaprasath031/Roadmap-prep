const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Question = require('../models/Question');
const Roadmap = require('../models/Roadmap');
const Note = require('../models/Note');
const User = require('../models/User');

// Optional auth helper
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId);
    }
  } catch (e) {
    // ignore token decode failure for optional auth
  }
  next();
};

// GET /api/search?q=query - Global search across questions, roadmaps, and personal notes
router.get('/', optionalAuth, async (req, res) => {
  try {
    const query = (req.query.q || '').trim();
    if (!query || query.length < 2) {
      return res.json({ questions: [], roadmaps: [], notes: [] });
    }

    const regex = new RegExp(query, 'i');

    // 1. Search Questions
    const questionsPromise = Question.find({
      $or: [
        { title: regex },
        { description: regex },
        { tags: regex },
        { company: regex },
        { category: regex },
      ],
    })
      .limit(8)
      .select('title category difficulty tags company');

    // 2. Search Roadmaps
    const roadmapsPromise = Roadmap.find({
      $or: [
        { title: regex },
        { description: regex },
        { tags: regex },
        { 'steps.title': regex },
        { 'steps.topics': regex },
      ],
    })
      .limit(6)
      .select('title slug description icon difficulty estimatedHours');

    // 3. Search Personal Notes (if user is authenticated)
    let notesPromise = Promise.resolve([]);
    if (req.user) {
      notesPromise = Note.find({
        user: req.user._id,
        $or: [
          { title: regex },
          { content: regex },
        ],
      })
        .limit(6)
        .populate('question', 'title')
        .populate('roadmap', 'title slug');
    }

    const [questions, roadmaps, notes] = await Promise.all([
      questionsPromise,
      roadmapsPromise,
      notesPromise,
    ]);

    res.json({
      questions,
      roadmaps,
      notes,
    });
  } catch (error) {
    console.error('Error during global search:', error);
    res.status(500).json({ error: 'Failed to perform search' });
  }
});

module.exports = router;
