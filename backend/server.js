const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const roadmapRoutes = require('./routes/roadmaps');
const questionRoutes = require('./routes/questions');
const progressRoutes = require('./routes/progress');
const bookmarkRoutes = require('./routes/bookmarks');
const commentRoutes = require('./routes/comments');
const quizRoutes = require('./routes/quiz');
const communityRoutes = require('./routes/community');
const notificationRoutes = require('./routes/notifications');
const exportRoutes = require('./routes/export');
const fetchRoutes = require('./routes/fetch-questions');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/fetch-questions', fetchRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = parseInt(process.env.PORT) || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    console.log('Starting server without MongoDB (using in-memory data)...');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });
