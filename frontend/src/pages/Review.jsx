import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, RotateCcw, Brain, Eye, Sparkles, Building2, Tag, ArrowRight, BookOpen } from 'lucide-react';
import NoteEditor from '../components/NoteEditor';

export default function Review() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showEli5, setShowEli5] = useState(false);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completedToday, setCompletedToday] = useState(0);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchQueueAndStats = async () => {
      try {
        const [dueRes, statsRes] = await Promise.all([
          axios.get('/api/review/due'),
          axios.get('/api/review/stats'),
        ]);

        const combinedItems = [
          ...dueRes.data.dueItems.map(item => ({ ...item.question, reviewItem: item })),
          ...dueRes.data.suggestedNew.map(q => ({ ...q, reviewItem: null })),
        ];

        setQueue(combinedItems);
        setStats(statsRes.data);
      } catch (err) {
        console.error('Failed to load review queue:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQueueAndStats();
  }, [user]);

  const currentItem = queue[currentIndex];

  const handleRating = async (rating) => {
    if (!currentItem || submitting) return;
    setSubmitting(true);
    try {
      await axios.post('/api/review/submit', {
        questionId: currentItem._id,
        rating,
      });

      setCompletedToday(prev => prev + 1);
      setShowAnswer(false);
      setShowEli5(false);
      setShowNoteEditor(false);
      setCurrentIndex(prev => prev + 1);

      // Refresh stats in background
      axios.get('/api/review/stats').then(res => setStats(res.data)).catch(() => {});
    } catch (err) {
      console.error('Failed to submit rating:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold c1 mb-3">Spaced Repetition Review</h2>
        <p className="c2 mb-6">Log in to track your retention schedule and retain interview knowledge effortlessly.</p>
        <Link to="/login" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium inline-block">
          Log in
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="c3 animate-pulse text-base">Loading your daily review queue...</div>
      </div>
    );
  }

  // All reviews completed state
  if (!currentItem || currentIndex >= queue.length) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-2xl font-bold c1 mb-2">Queue Clear for Today</h2>
        <p className="c2 text-sm leading-relaxed mb-6">
          You've reviewed your scheduled questions for today. Spaced repetition will automatically schedule items based on when your memory needs reinforcement.
        </p>

        {stats && (
          <div className="grid grid-cols-3 gap-3 mb-8 text-left">
            <div className="p-4 c-card border c-border rounded-xl">
              <div className="text-xl font-bold c1">{stats.totalTracked}</div>
              <div className="text-xs c3">Items in memory</div>
            </div>
            <div className="p-4 c-card border c-border rounded-xl">
              <div className="text-xl font-bold text-emerald-400">{stats.masteredCount}</div>
              <div className="text-xs c3">Solid mastery</div>
            </div>
            <div className="p-4 c-card border c-border rounded-xl">
              <div className="text-xl font-bold text-amber-400">{completedToday}</div>
              <div className="text-xs c3">Done this session</div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/flashcards"
            className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Practice Flashcards
          </Link>
          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-5 py-2.5 c-card border c-border hover:c-border-h text-sm font-medium c1 rounded-xl transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const diffColor = {
    Easy: 'bg-green-500/10 text-green-400',
    Medium: 'bg-amber-500/10 text-amber-400',
    Hard: 'bg-red-500/10 text-red-400',
  };

  const progressPercent = Math.round(((currentIndex) / queue.length) * 100);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Header & Progress Indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Brain size={22} className="text-indigo-400" />
          <h1 className="text-xl font-bold c1">Review Queue</h1>
        </div>
        <span className="text-xs c3 font-medium">
          {currentIndex + 1} of {queue.length} items
        </span>
      </div>

      <div className="w-full c-input rounded-full h-1.5 mb-8">
        <div
          className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {/* Main Review Card */}
      <div className="c-card border c-border rounded-2xl p-6 sm:p-8 shadow-sm transition-all mb-6">
        {/* Category & Tags Header */}
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded text-xs font-medium c-input c2">
              {currentItem.category}
            </span>
            <span className={`px-2.5 py-1 rounded text-xs font-medium ${diffColor[currentItem.difficulty] || ''}`}>
              {currentItem.difficulty}
            </span>
          </div>
          {currentItem.company?.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs c3">
              <Building2 size={13} />
              {currentItem.company.slice(0, 2).join(', ')}
            </div>
          )}
        </div>

        {/* Question Prompt */}
        <h2 className="text-xl sm:text-2xl font-bold c1 leading-snug mb-6">
          {currentItem.title}
        </h2>

        {currentItem.description && (
          <p className="c2 text-sm leading-relaxed mb-6 whitespace-pre-line">
            {currentItem.description}
          </p>
        )}

        {/* Reveal Answer Button */}
        {!showAnswer ? (
          <div className="pt-4 border-t c-border flex justify-center">
            <button
              onClick={() => setShowAnswer(true)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium text-sm transition-colors flex items-center gap-2 shadow-sm"
            >
              <Eye size={16} /> Reveal Answer
            </button>
          </div>
        ) : (
          <div className="pt-6 border-t c-border space-y-6">
            {/* Answer Display */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  Detailed Answer
                </span>
                <button
                  onClick={() => setShowEli5(!showEli5)}
                  className={`text-xs px-2.5 py-1 rounded-md border transition-colors flex items-center gap-1.5 ${
                    showEli5
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 font-medium'
                      : 'c-input c3 hover:c2 border-transparent'
                  }`}
                >
                  <Sparkles size={12} /> {showEli5 ? 'View Standard' : "Explain Like I'm 5"}
                </button>
              </div>

              {showEli5 ? (
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-sm c1 leading-relaxed">
                  <p className="font-semibold text-amber-400 text-xs mb-1">Simplified Explanation:</p>
                  {currentItem.eli5Answer ||
                    `In plain terms: Think of this like a real-world analogy. ${currentItem.title} is designed so systems stay organized, fast, and predictable without unnecessary overhead.`}
                </div>
              ) : (
                <div className="c2 text-sm leading-relaxed whitespace-pre-line">
                  {currentItem.answer}
                </div>
              )}
            </div>

            {/* Note toggle */}
            <div>
              <button
                onClick={() => setShowNoteEditor(!showNoteEditor)}
                className="text-xs text-indigo-400 hover:underline flex items-center gap-1.5"
              >
                <BookOpen size={13} /> {showNoteEditor ? 'Hide My Notes' : 'Add / View My Notes for this question'}
              </button>
              {showNoteEditor && (
                <div className="mt-3">
                  <NoteEditor
                    targetType="Question"
                    targetId={currentItem._id}
                    initialTitle={currentItem.title}
                    onClose={() => setShowNoteEditor(false)}
                  />
                </div>
              )}
            </div>

            {/* Confidence Feedback Buttons (SM-2) */}
            <div className="pt-6 border-t c-border">
              <p className="text-xs font-medium text-center c3 mb-3">
                How comfortably did you remember this concept?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => handleRating('forgot')}
                  disabled={submitting}
                  className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 text-sm font-medium transition-all text-center"
                >
                  <div className="font-semibold">Forgot</div>
                  <div className="text-[11px] opacity-75 mt-0.5">Review tomorrow</div>
                </button>
                <button
                  onClick={() => handleRating('struggled')}
                  disabled={submitting}
                  className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400 text-sm font-medium transition-all text-center"
                >
                  <div className="font-semibold">Struggled</div>
                  <div className="text-[11px] opacity-75 mt-0.5">Review in a few days</div>
                </button>
                <button
                  onClick={() => handleRating('got_it')}
                  disabled={submitting}
                  className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 text-sm font-medium transition-all text-center"
                >
                  <div className="font-semibold">Got it</div>
                  <div className="text-[11px] opacity-75 mt-0.5">Graduated interval</div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
