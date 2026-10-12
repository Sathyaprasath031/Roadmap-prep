const express = require('express');
const Question = require('../models/Question');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, difficulty, company, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (company) filter.company = { $in: [new RegExp(company, 'i')] };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { company: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [questions, total] = await Promise.all([
      Question.find(filter).sort({ frequency: -1 }).skip(skip).limit(limitNum),
      Question.countDocuments(filter),
    ]);

    res.json({
      questions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
