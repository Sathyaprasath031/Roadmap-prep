const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const QuizResult = require('../models/Quiz');
const ReviewItem = require('../models/ReviewItem');
const Question = require('../models/Question');

// GET /api/weakness - Compute category/topic weakness map from quizzes and reviews
router.get('/', auth, async (req, res) => {
  try {
    const categories = ['Frontend', 'Backend', 'DSA', 'System Design', 'DevOps', 'ML/AI'];
    
    // 1. Fetch user's quiz results
    const quizResults = await QuizResult.find({ user: req.user._id }).populate('answers.question');

    // 2. Fetch user's review items
    const reviewItems = await ReviewItem.find({ user: req.user._id }).populate('question');

    // Category stats mapping
    const categoryStats = {};
    categories.forEach(cat => {
      categoryStats[cat] = {
        category: cat,
        attempts: 0,
        correct: 0,
        scorePercent: 0,
        status: 'untested', // 'strong', 'moderate', 'weak', 'untested'
      };
    });

    // Accumulate quiz answers
    quizResults.forEach(qr => {
      if (qr.answers && qr.answers.length > 0) {
        qr.answers.forEach(a => {
          const cat = a.question?.category || qr.category;
          if (cat && categoryStats[cat]) {
            categoryStats[cat].attempts += 1;
            if (a.correct) {
              categoryStats[cat].correct += 1;
            }
          }
        });
      } else if (qr.category && categoryStats[qr.category]) {
        categoryStats[qr.category].attempts += qr.totalQuestions || 0;
        categoryStats[qr.category].correct += qr.correctAnswers || 0;
      }
    });

    // Accumulate review items
    reviewItems.forEach(ri => {
      const cat = ri.question?.category;
      if (cat && categoryStats[cat] && ri.lastRating) {
        categoryStats[cat].attempts += 1;
        if (ri.lastRating === 'got_it') {
          categoryStats[cat].correct += 1;
        }
      }
    });

    // Compute status and percent
    const summary = Object.values(categoryStats).map(stat => {
      if (stat.attempts === 0) {
        return {
          ...stat,
          scorePercent: null,
          status: 'untested',
        };
      }

      const percent = Math.round((stat.correct / stat.attempts) * 100);
      let status = 'moderate';
      if (percent >= 80) {
        status = 'strong';
      } else if (percent < 50) {
        status = 'weak';
      }

      return {
        ...stat,
        scorePercent: percent,
        status,
      };
    });

    // Identify weak categories
    const weakCategories = summary
      .filter(s => s.status === 'weak' || s.status === 'moderate')
      .map(s => s.category);

    // Fetch recommendations for weak areas
    let recommendations = [];
    if (weakCategories.length > 0) {
      recommendations = await Question.find({
        category: { $in: weakCategories },
      })
        .limit(6)
        .select('title category difficulty tags company');
    }

    res.json({
      summary,
      recommendations,
      hasEnoughData: summary.some(s => s.attempts > 0),
    });
  } catch (error) {
    console.error('Error generating weakness map:', error);
    res.status(500).json({ error: 'Failed to generate weakness map' });
  }
});

module.exports = router;
