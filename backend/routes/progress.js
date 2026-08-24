const express = require('express');
const Progress = require('../models/Progress');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const progress = await Progress.find({ user: req.user._id }).populate('roadmap');
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:roadmapId/step/:stepIndex', auth, async (req, res) => {
  try {
    const { roadmapId, stepIndex } = req.params;
    const { completed } = req.body;

    let progress = await Progress.findOne({ user: req.user._id, roadmap: roadmapId });

    if (!progress) {
      progress = new Progress({ user: req.user._id, roadmap: roadmapId, completedSteps: [] });
    }

    const idx = parseInt(stepIndex);
    if (completed) {
      if (!progress.completedSteps.includes(idx)) {
        progress.completedSteps.push(idx);
      }
    } else {
      progress.completedSteps = progress.completedSteps.filter((s) => s !== idx);
    }

    progress.lastAccessedAt = new Date();
    await progress.save();

    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:roadmapId/bookmark/:questionId', auth, async (req, res) => {
  try {
    const { roadmapId, questionId } = req.params;

    let progress = await Progress.findOne({ user: req.user._id, roadmap: roadmapId });

    if (!progress) {
      progress = new Progress({ user: req.user._id, roadmap: roadmapId, bookmarkedQuestions: [] });
    }

    const idx = progress.bookmarkedQuestions.indexOf(questionId);
    if (idx > -1) {
      progress.bookmarkedQuestions.splice(idx, 1);
    } else {
      progress.bookmarkedQuestions.push(questionId);
    }

    await progress.save();
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
