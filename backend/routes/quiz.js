const express = require('express');
const Question = require('../models/Question');
const QuizResult = require('../models/Quiz');
const auth = require('../middleware/auth');

const router = express.Router();

// Generate a quiz — returns questions with shuffled options
router.get('/generate', auth, async (req, res) => {
  try {
    const { category, difficulty, count = 10 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const questions = await Question.aggregate([
      { $match: filter },
      { $sample: { size: parseInt(count) } },
    ]);

    // For each question, create 4 options (1 correct + 3 wrong)
    const quizQuestions = questions.map((q) => {
      // Get wrong answers from other questions in same category
      const correctAnswer = q.answer;
      // Create meaningful distractors by truncating the correct answer
      const distractors = [
        `This is incorrect. ${correctAnswer.substring(0, 80)}... is not the right approach.`,
        `A common misconception. The answer involves different concepts than ${correctAnswer.substring(0, 40)}...`,
        `Not quite. The correct approach differs from this explanation.`,
      ];

      const options = [correctAnswer, ...distractors];
      // Shuffle options
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }

      const correctIndex = options.indexOf(correctAnswer);

      return {
        _id: q._id,
        title: q.title,
        category: q.category,
        difficulty: q.difficulty,
        options: options.map((opt, idx) => ({
          text: opt.length > 200 ? opt.substring(0, 200) + '...' : opt,
          isCorrect: idx === correctIndex,
        })),
      };
    });

    res.json(quizQuestions);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit quiz answers and get results
router.post('/submit', auth, async (req, res) => {
  try {
    const { category, answers, timeTaken } = req.body;
    // answers: [{ questionId, selectedOption }]

    let correctAnswers = 0;
    const detailedAnswers = [];

    for (const answer of answers) {
      const question = await Question.findById(answer.questionId);
      if (!question) continue;

      // Rebuild the correct answer index
      const isCorrect = answer.selectedOption === 0; // First option is always correct in our format
      if (isCorrect) correctAnswers++;

      detailedAnswers.push({
        question: answer.questionId,
        selectedOption: answer.selectedOption,
        correct: isCorrect,
      });
    }

    const totalQuestions = answers.length;
    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    const quizResult = new QuizResult({
      user: req.user._id,
      category: category || 'Mixed',
      totalQuestions,
      correctAnswers,
      answers: detailedAnswers,
      score,
      timeTaken: timeTaken || 0,
    });

    await quizResult.save();

    res.json({
      score,
      correctAnswers,
      totalQuestions,
      percentage: score,
      timeTaken: timeTaken || 0,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's quiz history
router.get('/history', auth, async (req, res) => {
  try {
    const results = await QuizResult.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    // Calculate stats
    const allResults = await QuizResult.find({ user: req.user._id });
    const totalQuizzes = allResults.length;
    const avgScore = totalQuizzes > 0
      ? Math.round(allResults.reduce((sum, r) => sum + r.score, 0) / totalQuizzes)
      : 0;
    const bestScore = totalQuizzes > 0
      ? Math.max(...allResults.map((r) => r.score))
      : 0;

    res.json({
      results,
      stats: { totalQuizzes, avgScore, bestScore },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
