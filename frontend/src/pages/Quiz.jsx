import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Brain, Clock, CheckCircle, XCircle, Trophy, RotateCcw, BarChart3 } from 'lucide-react';

export default function Quiz() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [phase, setPhase] = useState('setup'); // setup, quiz, results, history
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const categories = ['Frontend', 'Backend', 'DSA', 'System Design', 'DevOps', 'ML/AI'];
  const difficulties = ['Easy', 'Medium', 'Hard'];

  useEffect(() => {
    if (authLoading) return;
    if (!user) navigate('/login');
  }, [user, navigate, authLoading]);

  // Timer
  useEffect(() => {
    if (phase !== 'quiz' || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  const startQuiz = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ count: questionCount });
      if (category) params.set('category', category);
      if (difficulty) params.set('difficulty', difficulty);

      const res = await axios.get(`/api/quiz/generate?${params}`);
      setQuestions(res.data);
      setCurrentQ(0);
      setSelectedAnswers({});
      setTimeLeft(questionCount * 30); // 30 seconds per question
      setPhase('quiz');
    } catch (err) {
      console.error('Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (qIdx, optIdx) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
    // Auto-advance after selection
    if (qIdx < questions.length - 1) {
      setTimeout(() => setCurrentQ(qIdx + 1), 300);
    }
  };

  const handleSubmit = async () => {
    const answers = questions.map((q, idx) => ({
      questionId: q._id,
      selectedOption: selectedAnswers[idx] ?? -1,
    }));

    try {
      const res = await axios.post('/api/quiz/submit', {
        category: category || 'Mixed',
        answers,
        timeTaken: questionCount * 30 - timeLeft,
      });
      setResults(res.data);
      setPhase('results');
    } catch (err) {
      console.error('Failed to submit quiz');
    }
  };

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/quiz/history');
      setHistory(res.data);
      setPhase('history');
    } catch (err) {
      console.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  // Setup Phase
  if (phase === 'setup') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <Brain size={48} className="text-indigo-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold c1 mb-4">Quiz Mode</h1>
          <p className="c2 text-lg">Test your knowledge with timed quizzes</p>
        </div>

        <div className="c-card border c-border rounded-2xl p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium c2 mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 c-input border c-border-h rounded-xl c2 focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Categories (Mixed)</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium c2 mb-2">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-3 c-input border c-border-h rounded-xl c2 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Any Difficulty</option>
                {difficulties.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium c2 mb-2">Number of Questions</label>
              <div className="flex gap-3">
                {[5, 10, 15, 20].map((n) => (
                  <button
                    key={n}
                    onClick={() => setQuestionCount(n)}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
                      questionCount === n
                        ? 'bg-indigo-600 c1'
                        : 'c-input c2 hover:c1 border c-border-h'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startQuiz}
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 c1 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Brain size={18} />
              {loading ? 'Generating Quiz...' : 'Start Quiz'}
            </button>

            <button
              onClick={loadHistory}
              className="w-full py-3 c-input hover:bg-gray-750 c2 font-medium rounded-xl transition-colors flex items-center justify-center gap-2 border c-border-h"
            >
              <BarChart3 size={18} />
              View Quiz History
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Phase
  if (phase === 'quiz' && questions.length > 0) {
    const q = questions[currentQ];
    const answered = selectedAnswers[currentQ] !== undefined;

    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-sm c2">
              Question {currentQ + 1} of {questions.length}
            </span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              q.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400' :
              q.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
              'bg-red-500/10 text-red-400'
            }`}>
              {q.difficulty}
            </span>
          </div>
          <div className={`flex items-center gap-2 text-sm font-mono ${timeLeft < 30 ? 'text-red-400' : 'c2'}`}>
            <Clock size={16} />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full c-input rounded-full h-2 mb-8">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <div className="c-card border c-border rounded-2xl p-8">
          <span className="text-xs c3 mb-2 block">{q.category}</span>
          <h2 className="text-xl font-bold c1 mb-6">{q.title}</h2>

          <div className="space-y-3">
            {q.options.map((opt, idx) => {
              const isSelected = selectedAnswers[currentQ] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => selectAnswer(currentQ, idx)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-indigo-600/10 border-indigo-500 c1'
                      : 'c-input/50 c-border-h c2 hover:c-border-h hover:c-input'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full border border-gray-600 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-sm leading-relaxed">{opt.text}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setCurrentQ((c) => Math.max(0, c - 1))}
            disabled={currentQ === 0}
            className="px-4 py-2 text-sm c2 hover:c1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <div className="flex items-center gap-3">
            {currentQ === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 c1 font-medium rounded-xl transition-colors"
              >
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={() => setCurrentQ((c) => Math.min(questions.length - 1, c + 1))}
                className="px-6 py-2 c-input hover:c-hover c2 font-medium rounded-xl border c-border-h transition-colors"
              >
                Next →
              </button>
            )}
          </div>
        </div>

        {/* Question dots */}
        <div className="flex flex-wrap gap-2 mt-6 justify-center">
          {questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentQ(idx)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                idx === currentQ
                  ? 'bg-indigo-600 c1'
                  : selectedAnswers[idx] !== undefined
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'c-input c3 hover:c2'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Results Phase
  if (phase === 'results' && results) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <Trophy size={48} className={`mx-auto mb-4 ${getScoreColor(results.percentage)}`} />
          <h1 className="text-4xl font-bold c1 mb-2">Quiz Complete!</h1>
          <p className="c2">Here's how you did</p>
        </div>

        <div className="c-card border c-border rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className={`text-6xl font-bold mb-2 ${getScoreColor(results.percentage)}`}>
              {results.percentage}%
            </div>
            <p className="c2">
              {results.correctAnswers} of {results.totalQuestions} correct
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 c-input rounded-xl">
              <CheckCircle size={20} className="text-green-400 mx-auto mb-1" />
              <div className="text-xl font-bold c1">{results.correctAnswers}</div>
              <div className="text-xs c3">Correct</div>
            </div>
            <div className="text-center p-4 c-input rounded-xl">
              <XCircle size={20} className="text-red-400 mx-auto mb-1" />
              <div className="text-xl font-bold c1">{results.totalQuestions - results.correctAnswers}</div>
              <div className="text-xs c3">Wrong</div>
            </div>
            <div className="text-center p-4 c-input rounded-xl">
              <Clock size={20} className="text-amber-400 mx-auto mb-1" />
              <div className="text-xl font-bold c1">{formatTime(results.timeTaken)}</div>
              <div className="text-xs c3">Time</div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setPhase('setup'); setResults(null); }}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 c1 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} />
              Try Again
            </button>
            <button
              onClick={loadHistory}
              className="flex-1 py-3 c-input hover:c-hover c2 font-semibold rounded-xl border c-border-h transition-colors flex items-center justify-center gap-2"
            >
              <BarChart3 size={18} />
              History
            </button>
          </div>
        </div>
      </div>
    );
  }

  // History Phase
  if (phase === 'history' && history) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <BarChart3 size={48} className="text-indigo-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold c1 mb-4">Quiz History</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="c-card border c-border rounded-xl p-5 text-center">
            <div className="text-2xl font-bold c1">{history.stats.totalQuizzes}</div>
            <div className="text-sm c2">Quizzes Taken</div>
          </div>
          <div className="c-card border c-border rounded-xl p-5 text-center">
            <div className={`text-2xl font-bold ${getScoreColor(history.stats.avgScore)}`}>{history.stats.avgScore}%</div>
            <div className="text-sm c2">Average Score</div>
          </div>
          <div className="c-card border c-border rounded-xl p-5 text-center">
            <div className="text-2xl font-bold text-green-400">{history.stats.bestScore}%</div>
            <div className="text-sm c2">Best Score</div>
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-3">
          {history.results.map((r) => (
            <div key={r._id} className="c-card border c-border rounded-xl p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium c1">{r.category}</span>
                  <span className={`text-sm font-bold ${getScoreColor(r.score)}`}>{r.score}%</span>
                </div>
                <div className="text-xs c3">
                  {r.correctAnswers}/{r.totalQuestions} correct · {new Date(r.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold ${
                r.score >= 80 ? 'bg-green-500/10 text-green-400' :
                r.score >= 60 ? 'bg-amber-500/10 text-amber-400' :
                'bg-red-500/10 text-red-400'
              }`}>
                {r.score}%
              </div>
            </div>
          ))}
          {history.results.length === 0 && (
            <div className="text-center py-12 c3">No quizzes taken yet</div>
          )}
        </div>

        <button
          onClick={() => setPhase('setup')}
          className="mt-8 w-full py-3 bg-indigo-600 hover:bg-indigo-500 c1 font-semibold rounded-xl transition-colors"
        >
          Start New Quiz
        </button>
      </div>
    );
  }

  return null;
}
