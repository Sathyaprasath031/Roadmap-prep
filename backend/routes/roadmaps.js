const express = require('express');
const Roadmap = require('../models/Roadmap');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const roadmaps = await Roadmap.aggregate([
      {
        $project: {
          title: 1,
          slug: 1,
          description: 1,
          icon: 1,
          color: 1,
          difficulty: 1,
          estimatedHours: 1,
          tags: 1,
          stepCount: { $size: { $ifNull: ['$steps', []] } },
        },
      },
    ]);
    res.json(roadmaps);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({ slug: req.params.slug });
    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found' });
    }
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
