const express = require('express');
const Bookmark = require('../models/Bookmark');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all bookmarks for the current user
router.get('/', auth, async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user._id });
    res.json(bookmarks.map((b) => b.question.toString()));
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Toggle bookmark for a question
router.post('/:questionId', auth, async (req, res) => {
  try {
    const { questionId } = req.params;

    const existing = await Bookmark.findOne({ user: req.user._id, question: questionId });

    if (existing) {
      await Bookmark.deleteOne({ _id: existing._id });
      res.json({ bookmarked: false });
    } else {
      await Bookmark.create({ user: req.user._id, question: questionId });
      res.json({ bookmarked: true });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
