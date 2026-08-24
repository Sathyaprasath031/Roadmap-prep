const express = require('express');
const NotificationPreference = require('../models/Notification');
const Progress = require('../models/Progress');
const Roadmap = require('../models/Roadmap');
const auth = require('../middleware/auth');

const router = express.Router();

// Get notification preferences
router.get('/preferences', auth, async (req, res) => {
  try {
    let prefs = await NotificationPreference.findOne({ user: req.user._id });
    if (!prefs) {
      prefs = new NotificationPreference({ user: req.user._id });
      await prefs.save();
    }
    res.json(prefs);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update notification preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const { emailEnabled, weeklyReminder, motivationalNudge } = req.body;
    let prefs = await NotificationPreference.findOne({ user: req.user._id });
    if (!prefs) {
      prefs = new NotificationPreference({ user: req.user._id });
    }
    if (emailEnabled !== undefined) prefs.emailEnabled = emailEnabled;
    if (weeklyReminder !== undefined) prefs.weeklyReminder = weeklyReminder;
    if (motivationalNudge !== undefined) prefs.motivationalNudge = motivationalNudge;
    await prefs.save();
    res.json(prefs);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's progress summary (for email content)
router.get('/progress-summary', auth, async (req, res) => {
  try {
    const progress = await Progress.find({ user: req.user._id }).populate('roadmap');
    const roadmaps = await Roadmap.find();

    const summary = progress.map((p) => {
      const roadmap = roadmaps.find((r) => r._id.toString() === (p.roadmap?._id?.toString() || p.roadmap?.toString()));
      const totalSteps = roadmap?.steps?.length || 0;
      const completedSteps = p.completedSteps?.length || 0;
      const percent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
      return {
        title: roadmap?.title || 'Unknown Roadmap',
        completedSteps,
        totalSteps,
        percent,
        lastAccessed: p.lastAccessedAt,
      };
    });

    const startedCount = summary.length;
    const completedRoadmaps = summary.filter((s) => s.percent === 100).length;

    res.json({ summary, startedCount, completedRoadmaps, totalRoadmaps: roadmaps.length });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
