const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const StudyPlan = require('../models/StudyPlan');
const Progress = require('../models/Progress');
const Roadmap = require('../models/Roadmap');

// GET /api/study-plan - Get current study plan with countdown metrics
router.get('/', auth, async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({ user: req.user._id }).populate('primaryRoadmap');
    if (!plan) {
      return res.json(null);
    }

    const now = new Date();
    const targetDate = new Date(plan.interviewDate);
    const diffTime = targetDate.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    let roadmapProgress = null;
    if (plan.primaryRoadmap) {
      const progressDoc = await Progress.findOne({
        user: req.user._id,
        roadmap: plan.primaryRoadmap._id,
      });

      const totalSteps = plan.primaryRoadmap.steps?.length || 0;
      const completedSteps = progressDoc?.completedSteps?.length || 0;
      const percent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

      roadmapProgress = {
        totalSteps,
        completedSteps,
        percent,
      };
    }

    res.json({
      plan,
      daysRemaining,
      totalHoursTarget: daysRemaining * (plan.dailyHoursGoal || 2),
      roadmapProgress,
    });
  } catch (error) {
    console.error('Error fetching study plan:', error);
    res.status(500).json({ error: 'Failed to fetch study plan' });
  }
});

// POST /api/study-plan - Save or update study plan
router.post('/', auth, async (req, res) => {
  try {
    const { targetRole, targetCompany, interviewDate, dailyHoursGoal, primaryRoadmap, notes } = req.body;

    if (!interviewDate) {
      return res.status(400).json({ error: 'Interview date is required' });
    }

    const plan = await StudyPlan.findOneAndUpdate(
      { user: req.user._id },
      {
        targetRole: targetRole || 'Software Engineer',
        targetCompany: targetCompany || '',
        interviewDate: new Date(interviewDate),
        dailyHoursGoal: dailyHoursGoal ? Number(dailyHoursGoal) : 2,
        primaryRoadmap: primaryRoadmap || null,
        notes: notes || '',
      },
      { new: true, upsert: true, runValidators: true }
    ).populate('primaryRoadmap');

    res.json(plan);
  } catch (error) {
    console.error('Error saving study plan:', error);
    res.status(500).json({ error: 'Failed to save study plan' });
  }
});

// DELETE /api/study-plan - Delete study plan
router.delete('/', auth, async (req, res) => {
  try {
    await StudyPlan.findOneAndDelete({ user: req.user._id });
    res.json({ message: 'Study plan removed' });
  } catch (error) {
    console.error('Error removing study plan:', error);
    res.status(500).json({ error: 'Failed to remove study plan' });
  }
});

module.exports = router;
