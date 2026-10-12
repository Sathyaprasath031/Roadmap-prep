const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Note = require('../models/Note');

// GET /api/notes - Get all notes created by current user
router.get('/', auth, async (req, res) => {
  try {
    const { targetType } = req.query;
    const query = { user: req.user._id };
    if (targetType) query.targetType = targetType;

    const notes = await Note.find(query)
      .populate('question', 'title category difficulty tags company')
      .populate('roadmap', 'title slug icon')
      .sort({ updatedAt: -1 });

    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// GET /api/notes/target - Get note for a specific question or roadmap step
router.get('/target', auth, async (req, res) => {
  try {
    const { targetType, targetId } = req.query;
    if (!targetType || !targetId) {
      return res.status(400).json({ error: 'targetType and targetId are required' });
    }

    const note = await Note.findOne({
      user: req.user._id,
      targetType,
      targetId: String(targetId),
    });

    res.json(note || null);
  } catch (error) {
    console.error('Error fetching target note:', error);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// POST /api/notes - Create or update a note
router.post('/', auth, async (req, res) => {
  try {
    const { targetType, targetId, title, content, questionId, roadmapId, stepOrder } = req.body;

    if (!targetType || !targetId || !content) {
      return res.status(400).json({ error: 'targetType, targetId, and content are required' });
    }

    const filter = {
      user: req.user._id,
      targetType,
      targetId: String(targetId),
    };

    const update = {
      title: title || '',
      content,
      question: questionId || (targetType === 'Question' ? targetId : null),
      roadmap: roadmapId || null,
      stepOrder: stepOrder != null ? stepOrder : null,
    };

    const note = await Note.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true,
      runValidators: true,
    })
      .populate('question', 'title category difficulty')
      .populate('roadmap', 'title slug icon');

    res.json(note);
  } catch (error) {
    console.error('Error saving note:', error);
    res.status(500).json({ error: 'Failed to save note' });
  }
});

// DELETE /api/notes/:id - Delete a note
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

module.exports = router;
