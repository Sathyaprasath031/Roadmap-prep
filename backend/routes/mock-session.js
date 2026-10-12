const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const MockSession = require('../models/MockSession');
const Question = require('../models/Question');

// POST /api/mock-session/start - Start a new mock interview session
router.post('/start', auth, async (req, res) => {
  try {
    const { category, difficulty, durationMinutes = 30, questionCount = 5 } = req.body;

    const query = {};
    if (category && category !== 'All') query.category = category;
    if (difficulty && difficulty !== 'Mixed') query.difficulty = difficulty;

    const questions = await Question.aggregate([
      { $match: query },
      { $sample: { size: Number(questionCount) || 5 } },
    ]);

    if (questions.length === 0) {
      return res.status(400).json({ error: 'No questions found for the selected criteria' });
    }

    const session = new MockSession({
      user: req.user._id,
      title: `${category || 'Full Stack'} Mock Interview`,
      category: category || 'Mixed',
      difficulty: difficulty || 'Mixed',
      durationMinutes: Number(durationMinutes) || 30,
      questions: questions.map(q => ({
        question: q._id,
        userNotes: '',
        selfConfidence: null,
      })),
    });

    await session.save();
    await session.populate('questions.question');

    res.json(session);
  } catch (error) {
    console.error('Error starting mock session:', error);
    res.status(500).json({ error: 'Failed to start mock session' });
  }
});

// POST /api/mock-session/:id/complete - Complete mock session with calm reflection
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const { timeSpentSeconds, questionResponses } = req.body;
    const session = await MockSession.findOne({ _id: req.params.id, user: req.user._id });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (questionResponses && Array.isArray(questionResponses)) {
      questionResponses.forEach(qr => {
        const item = session.questions.find(
          q => q.question.toString() === qr.questionId || q._id.toString() === qr.questionItemId
        );
        if (item) {
          if (qr.userNotes !== undefined) item.userNotes = qr.userNotes;
          if (qr.selfConfidence) item.selfConfidence = qr.selfConfidence;
        }
      });
    }

    session.timeSpentSeconds = Number(timeSpentSeconds) || session.timeSpentSeconds;
    session.completed = true;
    await session.save();
    await session.populate('questions.question');

    res.json(session);
  } catch (error) {
    console.error('Error completing mock session:', error);
    res.status(500).json({ error: 'Failed to complete mock session' });
  }
});

// GET /api/mock-session/history - View past mock sessions
router.get('/history', auth, async (req, res) => {
  try {
    const sessions = await MockSession.find({ user: req.user._id })
      .populate('questions.question', 'title category difficulty')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(sessions);
  } catch (error) {
    console.error('Error fetching mock sessions:', error);
    res.status(500).json({ error: 'Failed to fetch mock sessions' });
  }
});

module.exports = router;
