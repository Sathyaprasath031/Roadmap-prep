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

// DB connection check middleware
const dbCheck = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: 'Database not connected. Please check your MongoDB connection string and IP whitelist.',
    });
  }
  next();
};

app.use('/api/auth', dbCheck, authRoutes);
app.use('/api/roadmaps', dbCheck, roadmapRoutes);
app.use('/api/questions', dbCheck, questionRoutes);
app.use('/api/progress', dbCheck, progressRoutes);
app.use('/api/bookmarks', dbCheck, bookmarkRoutes);
app.use('/api/comments', dbCheck, commentRoutes);
app.use('/api/quiz', dbCheck, quizRoutes);
app.use('/api/community', dbCheck, communityRoutes);
app.use('/api/notifications', dbCheck, notificationRoutes);
app.use('/api/export', dbCheck, exportRoutes);
app.use('/api/fetch-questions', dbCheck, fetchRoutes);

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
    console.error('');
    console.error('  ⚠️  Server starting WITHOUT database connection!');
    console.error('  Routes requiring the database will return 503 errors.');
    console.error('  Fix: Add your IP to MongoDB Atlas Network Access whitelist.');
    console.error('');
    app.listen(PORT, () => console.log(`Server running on port ${PORT} (no DB)`));
  });
