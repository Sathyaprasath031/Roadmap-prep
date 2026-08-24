const express = require('express');
const CommunityRoadmap = require('../models/CommunityRoadmap');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user's own roadmaps (MUST be before /:id route)
router.get('/my/roadmaps', auth, async (req, res) => {
  try {
    const roadmaps = await CommunityRoadmap.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(roadmaps);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all public community roadmaps
router.get('/', async (req, res) => {
  try {
    const { search, difficulty, sort = 'newest' } = req.query;
    const filter = { isPublic: true };

    if (difficulty) filter.difficulty = difficulty;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'popular') sortOption = { upvotes: -1 };
    if (sort === 'forks') sortOption = { forks: -1 };

    const roadmaps = await CommunityRoadmap.find(filter)
      .populate('user', 'name avatar')
      .sort(sortOption)
      .limit(50);

    res.json(roadmaps);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a single community roadmap
router.get('/:id', async (req, res) => {
  try {
    const roadmap = await CommunityRoadmap.findById(req.params.id)
      .populate('user', 'name avatar');
    if (!roadmap) return res.status(404).json({ error: 'Roadmap not found' });
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a community roadmap
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, icon, difficulty, tags, steps } = req.body;

    const roadmap = new CommunityRoadmap({
      user: req.user._id,
      title,
      description,
      icon: icon || '📋',
      difficulty: difficulty || 'Intermediate',
      tags: tags || [],
      steps: (steps || []).map((step, idx) => ({
        ...step,
        order: idx + 1,
      })),
    });

    await roadmap.save();
    await roadmap.populate('user', 'name avatar');

    res.status(201).json(roadmap);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a community roadmap (owner only)
router.put('/:id', auth, async (req, res) => {
  try {
    const roadmap = await CommunityRoadmap.findById(req.params.id);
    if (!roadmap) return res.status(404).json({ error: 'Roadmap not found' });
    if (roadmap.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { title, description, icon, difficulty, tags, steps } = req.body;
    if (title) roadmap.title = title;
    if (description) roadmap.description = description;
    if (icon) roadmap.icon = icon;
    if (difficulty) roadmap.difficulty = difficulty;
    if (tags) roadmap.tags = tags;
    if (steps) {
      roadmap.steps = steps.map((step, idx) => ({ ...step, order: idx + 1 }));
    }

    await roadmap.save();
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a community roadmap (owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const roadmap = await CommunityRoadmap.findById(req.params.id);
    if (!roadmap) return res.status(404).json({ error: 'Roadmap not found' });
    if (roadmap.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await CommunityRoadmap.deleteOne({ _id: roadmap._id });
    res.json({ message: 'Roadmap deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Upvote / un-upvote
router.post('/:id/upvote', auth, async (req, res) => {
  try {
    const roadmap = await CommunityRoadmap.findById(req.params.id);
    if (!roadmap) return res.status(404).json({ error: 'Roadmap not found' });

    const idx = roadmap.upvotes.indexOf(req.user._id);
    if (idx > -1) {
      roadmap.upvotes.splice(idx, 1);
    } else {
      roadmap.upvotes.push(req.user._id);
    }

    await roadmap.save();
    res.json({ upvotes: roadmap.upvotes.length, upvoted: idx === -1 });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Fork a community roadmap
router.post('/:id/fork', auth, async (req, res) => {
  try {
    const original = await CommunityRoadmap.findById(req.params.id);
    if (!original) return res.status(404).json({ error: 'Roadmap not found' });

    const fork = new CommunityRoadmap({
      user: req.user._id,
      title: `${original.title} (Fork)`,
      description: original.description,
      icon: original.icon,
      difficulty: original.difficulty,
      tags: original.tags,
      steps: original.steps.map((step) => ({
        title: step.title,
        description: step.description,
        order: step.order,
        resources: step.resources,
        topics: step.topics,
      })),
      upvotes: [],
      forks: 0,
    });

    await fork.save();
    original.forks += 1;
    await original.save();
    await fork.populate('user', 'name avatar');

    res.status(201).json(fork);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
