const express = require('express');
const Progress = require('../models/Progress');
const Roadmap = require('../models/Roadmap');
const QuizResult = require('../models/Quiz');
const auth = require('../middleware/auth');

const router = express.Router();

// Generate progress report data (frontend will render as PDF)
router.get('/progress-report', auth, async (req, res) => {
  try {
    const [progress, quizResults, roadmaps] = await Promise.all([
      Progress.find({ user: req.user._id }).populate('roadmap'),
      QuizResult.find({ user: req.user._id }).sort({ createdAt: -1 }),
      Roadmap.find(),
    ]);

    // Build roadmap progress data
    const roadmapProgress = progress.map((p) => {
      const roadmap = roadmaps.find((r) => r._id.toString() === (p.roadmap?._id?.toString() || p.roadmap?.toString()));
      const totalSteps = roadmap?.steps?.length || 0;
      const completedSteps = p.completedSteps?.length || 0;
      const percent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
      return {
        title: roadmap?.title || 'Unknown Roadmap',
        icon: roadmap?.icon || '📋',
        difficulty: roadmap?.difficulty || 'N/A',
        completedSteps,
        totalSteps,
        percent,
        completedStepNames: (roadmap?.steps || [])
          .filter((s) => p.completedSteps?.includes(s.order))
          .map((s) => s.title),
        startedAt: p.startedAt,
        lastAccessedAt: p.lastAccessedAt,
      };
    });

    // Quiz stats
    const totalQuizzes = quizResults.length;
    const avgScore = totalQuizzes > 0
      ? Math.round(quizResults.reduce((sum, r) => sum + r.score, 0) / totalQuizzes)
      : 0;
    const bestScore = totalQuizzes > 0
      ? Math.max(...quizResults.map((r) => r.score))
      : 0;

    const totalRoadmapsStarted = roadmapProgress.length;
    const completedRoadmaps = roadmapProgress.filter((r) => r.percent === 100).length;
    const overallProgress = totalRoadmapsStarted > 0
      ? Math.round(roadmapProgress.reduce((sum, r) => sum + r.percent, 0) / totalRoadmapsStarted)
      : 0;

    res.json({
      user: {
        name: req.user.name,
        email: req.user.email,
      },
      generatedAt: new Date().toISOString(),
      overallStats: {
        totalRoadmapsStarted,
        completedRoadmaps,
        totalQuizzes,
        avgScore,
        bestScore,
        overallProgress,
      },
      roadmapProgress,
      recentQuizzes: quizResults.slice(0, 10).map((q) => ({
        category: q.category,
        score: q.score,
        totalQuestions: q.totalQuestions,
        date: q.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
