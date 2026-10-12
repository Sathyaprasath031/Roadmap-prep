const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ReviewItem = require('../models/ReviewItem');
const Question = require('../models/Question');

// GET /api/review/due - Get questions due for review today (plus unreviewed questions if queue is small)
router.get('/due', auth, async (req, res) => {
  try {
    const now = new Date();
    // Find all items due on or before now
    const dueItems = await ReviewItem.find({
      user: req.user._id,
      nextReviewDate: { $lte: now },
    })
      .populate('question')
      .sort({ nextReviewDate: 1 })
      .limit(20);

    const validDueItems = dueItems.filter(item => item.question != null);

    // If we have fewer than 10 items due, supplement with unreviewed questions
    let extraQuestions = [];
    if (validDueItems.length < 10) {
      const reviewedQuestionIds = await ReviewItem.find({ user: req.user._id }).distinct('question');
      const needed = 10 - validDueItems.length;

      extraQuestions = await Question.find({
        _id: { $nin: reviewedQuestionIds },
      })
        .limit(needed);
    }

    res.json({
      dueItems: validDueItems,
      suggestedNew: extraQuestions,
      totalDue: validDueItems.length,
    });
  } catch (error) {
    console.error('Error fetching due reviews:', error);
    res.status(500).json({ error: 'Failed to fetch review queue' });
  }
});

// POST /api/review/submit - Submit review rating for a question (SM-2 Algorithm)
router.post('/submit', auth, async (req, res) => {
  try {
    const { questionId, rating } = req.body;
    if (!['forgot', 'struggled', 'got_it'].includes(rating)) {
      return res.status(400).json({ error: 'Rating must be forgot, struggled, or got_it' });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    let item = await ReviewItem.findOne({ user: req.user._id, question: questionId });

    if (!item) {
      item = new ReviewItem({
        user: req.user._id,
        question: questionId,
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
      });
    }

    let { easeFactor, interval, repetitions } = item;

    if (rating === 'forgot') {
      repetitions = 0;
      interval = 1; // repeat tomorrow
      easeFactor = Math.max(1.3, easeFactor - 0.2);
    } else if (rating === 'struggled') {
      interval = Math.max(1, Math.round((interval || 1) * 1.2));
      easeFactor = Math.max(1.3, easeFactor - 0.15);
      repetitions = Math.max(1, repetitions);
    } else if (rating === 'got_it') {
      repetitions += 1;
      if (repetitions === 1) {
        interval = 1;
      } else if (repetitions === 2) {
        interval = 3;
      } else {
        interval = Math.max(1, Math.round(interval * easeFactor));
      }
      easeFactor = Math.min(3.0, easeFactor + 0.1);
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);

    item.easeFactor = easeFactor;
    item.interval = interval;
    item.repetitions = repetitions;
    item.nextReviewDate = nextDate;
    item.lastReviewedAt = new Date();
    item.lastRating = rating;

    await item.save();
    await item.populate('question');

    res.json({
      message: 'Review saved',
      item,
      nextReviewDays: interval,
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// GET /api/review/stats - Get spaced repetition overview statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const totalTracked = await ReviewItem.countDocuments({ user: req.user._id });
    const now = new Date();
    const dueCount = await ReviewItem.countDocuments({
      user: req.user._id,
      nextReviewDate: { $lte: now },
    });
    const masteredCount = await ReviewItem.countDocuments({
      user: req.user._id,
      $or: [{ repetitions: { $gte: 3 } }, { interval: { $gte: 14 } }],
    });
    const learningCount = Math.max(0, totalTracked - masteredCount);

    res.json({
      totalTracked,
      dueCount,
      masteredCount,
      learningCount,
    });
  } catch (error) {
    console.error('Error getting review stats:', error);
    res.status(500).json({ error: 'Failed to get review stats' });
  }
});

// GET /api/review/flashcards - Get questions formatted for flashcard deck
router.get('/flashcards', auth, async (req, res) => {
  try {
    const { category, limit = 20 } = req.query;
    const query = {};
    if (category) query.category = category;

    // Fetch questions
    const questions = await Question.find(query)
      .limit(parseInt(limit))
      .sort({ frequency: -1 });

    // Attach user's existing review status if available
    const qIds = questions.map(q => q._id);
    const reviewItems = await ReviewItem.find({
      user: req.user._id,
      question: { $in: qIds },
    });
    const reviewMap = {};
    reviewItems.forEach(r => {
      reviewMap[r.question.toString()] = r;
    });

    const cards = questions.map(q => ({
      _id: q._id,
      title: q.title,
      category: q.category,
      difficulty: q.difficulty,
      answer: q.answer,
      eli5Answer: q.eli5Answer,
      company: q.company,
      tags: q.tags,
      reviewStatus: reviewMap[q._id.toString()] || null,
    }));

    res.json(cards);
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    res.status(500).json({ error: 'Failed to fetch flashcards' });
  }
});

module.exports = router;
