const express = require('express');
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');

const router = express.Router();

// Get comments for a roadmap step
router.get('/:roadmapId/step/:stepOrder', async (req, res) => {
  try {
    const { roadmapId, stepOrder } = req.params;
    const comments = await Comment.find({
      roadmap: roadmapId,
      stepOrder: parseInt(stepOrder),
      parentComment: null,
    })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    // Fetch replies for each top-level comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentComment: comment._id })
          .populate('user', 'name avatar')
          .sort({ createdAt: 1 });
        return { ...comment.toObject(), replies };
      })
    );

    res.json(commentsWithReplies);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Post a comment
router.post('/:roadmapId/step/:stepOrder', auth, async (req, res) => {
  try {
    const { roadmapId, stepOrder } = req.params;
    const { content, parentComment } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const comment = new Comment({
      user: req.user._id,
      roadmap: roadmapId,
      stepOrder: parseInt(stepOrder),
      content: content.trim(),
      parentComment: parentComment || null,
    });

    await comment.save();
    await comment.populate('user', 'name avatar');

    res.status(201).json({ ...comment.toObject(), replies: [] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Toggle like on a comment
router.post('/:commentId/like', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    const idx = comment.likes.indexOf(req.user._id);
    if (idx > -1) {
      comment.likes.splice(idx, 1);
    } else {
      comment.likes.push(req.user._id);
    }

    await comment.save();
    res.json({ likes: comment.likes.length, liked: idx === -1 });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a comment
router.delete('/:commentId', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await Comment.deleteMany({ parentComment: comment._id });
    await Comment.deleteOne({ _id: comment._id });
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
