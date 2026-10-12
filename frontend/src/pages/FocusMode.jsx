import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Timer, ArrowRight, CheckCircle2, Pause, Play, AlertCircle, Sparkles, BookOpen, ChevronRight, X } from 'lucide-react';

export default function FocusMode() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Setup state
  const [sessionState, setSessionState] = useState('idle'); // 'idle' | 'active' | 'completed'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDuration, setSelectedDuration] = useState(30); // in minutes
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);

  // Active session state
  const [sessionData, setSessionData] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const [isPaused, setIsPaused] = useState(false);
  const [userNotesMap, setUserNotesMap] = useState({});
  const [confidenceMap, setConfidenceMap] = useState({});
  const [revealedMap, setRevealedMap] = useState({});

  const categories = ['All', 'Frontend', 'Backend', 'DSA', 'System Design', 'DevOps', 'ML/AI'];
  const durations = [15, 30, 45];

  // Timer countdown
  useEffect(() => {
    let interval = null;
    if (sessionState === 'active' && !isPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleCompleteSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionState, isPaused, timeRemaining]);

  const handleStartSession = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/mock-session/start', {
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        durationMinutes: selectedDuration,
        questionCount,
      });

      setSessionData(res.data);
      setCurrentIdx(0);
      setTimeRemaining(selectedDuration * 60);
      setUserNotesMap({});
      setConfidenceMap({});
      setRevealedMap({});
      setSessionState('active');
    } catch (err) {
      console.error('Failed to start mock session:', err);
      alert('Could not start mock session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSession = async () => {
    if (!sessionData) return;
    setLoading(true);
    try {
      const timeSpentSeconds = selectedDuration * 60 - timeRemaining;
      const responses = sessionData.questions.map(qItem => ({
        questionItemId: qItem._id,
        questionId: qItem.question?._id || qItem.question,
        userNotes: userNotesMap[qItem._id] || '',
        selfConfidence: confidenceMap[qItem._id] || null,
      }));

      await axios.post(`/api/mock-session/${sessionData._id}/complete`, {
        timeSpentSeconds,
        questionResponses: responses,
      });

      setSessionState('completed');
    } catch (err) {
      console.error('Failed to save session completion:', err);
      setSessionState('completed'); // still show local completion
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // 1. Idle Setup Screen
  if (sessionState === 'idle') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Timer size={28} />
          </div>
          <h1 className="text-3xl font-bold c1 mb-2">Focus Mode Mock Interview</h1>
          <p className="c2 text-sm leading-relaxed max-w-lg mx-auto">
            A serene, distraction-free environment to practice speaking through concepts and typing solutions under timed conditions.
          </p>
        </div>

        <div className="c-card border c-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          {/* Domain Category */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider c2 block mb-2.5">
              Target Discipline
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`p-2.5 rounded-xl text-xs font-medium border text-center transition-all ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'c-input c2 border-transparent hover:c1'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Session Duration */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider c2 block mb-2.5">
              Session Length
            </label>
            <div className="grid grid-cols-3 gap-3">
              {durations.map(dur => (
                <button
                  key={dur}
                  onClick={() => setSelectedDuration(dur)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedDuration === dur
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'c-input c2 border-transparent hover:c1'
                  }`}
                >
                  <div className="text-base font-bold">{dur} min</div>
                  <div className="text-[11px] opacity-80">{dur === 15 ? 'Rapid Drill' : dur === 30 ? 'Standard Mock' : 'In-depth'}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t c-border">
            <button
              onClick={handleStartSession}
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              {loading ? 'Preparing Session...' : 'Enter Focus Session'} <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Active Session View
  if (sessionState === 'active' && sessionData) {
    const currentQItem = sessionData.questions[currentIdx];
    const question = currentQItem?.question || {};
    const isAnswerRevealed = !!revealedMap[currentQItem._id];

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Minimal Focus Header */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b c-border">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400">
              Mock Simulation
            </span>
            <span className="text-xs c3">
              Question {currentIdx + 1} of {sessionData.questions.length}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 font-mono text-base font-semibold px-3 py-1 rounded-lg ${
              timeRemaining < 180 ? 'text-rose-400 bg-rose-500/10' : 'text-indigo-400 c-input'
            }`}>
              <Timer size={16} />
              <span>{formatTime(timeRemaining)}</span>
            </div>

            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-1.5 rounded-lg c-input c2 hover:c1"
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? <Play size={16} /> : <Pause size={16} />}
            </button>

            <button
              onClick={handleCompleteSession}
              className="px-3 py-1 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              Finish Early
            </button>
          </div>
        </div>

        {/* Current Question Body */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Question Prompt */}
          <div className="c-card border c-border rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded text-xs c-input c2">
                  {question.category}
                </span>
                <span className="px-2 py-0.5 rounded text-xs c-input c3">
                  {question.difficulty}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold c1 leading-snug mb-4">
                {question.title}
              </h2>

              {question.description && (
                <p className="c2 text-sm leading-relaxed whitespace-pre-line mb-6">
                  {question.description}
                </p>
              )}
            </div>

            {/* Reveal Official Answer */}
            <div className="pt-6 border-t c-border">
              {!isAnswerRevealed ? (
                <button
                  onClick={() => setRevealedMap(prev => ({ ...prev, [currentQItem._id]: true }))}
                  className="text-xs text-indigo-400 hover:underline flex items-center gap-1.5"
                >
                  <BookOpen size={14} /> Reveal Benchmark Answer for Comparison
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                    Benchmark Reference
                  </div>
                  <div className="c2 text-xs leading-relaxed max-h-48 overflow-y-auto whitespace-pre-line pr-1">
                    {question.answer}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Scratchpad & Confidence */}
          <div className="c-card border c-border rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider c2 block mb-2">
                Your Answer Scratchpad / Solution Outline
              </label>
              <textarea
                value={userNotesMap[currentQItem._id] || ''}
                onChange={e => setUserNotesMap(prev => ({ ...prev, [currentQItem._id]: e.target.value }))}
                placeholder="Outline your reasoning, trade-offs, edge cases, and code structure here..."
                rows={9}
                className="w-full p-3 text-sm c-input rounded-xl outline-none focus:ring-1 focus:ring-indigo-500/50 c1 resize-none placeholder:c3 leading-relaxed font-mono"
              />
            </div>

            {/* Self-Confidence Check */}
            <div>
              <span className="text-xs c3 block mb-2">Your self-assessment on this question:</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'solid', label: 'Solid', color: 'border-emerald-500/30 text-emerald-400' },
                  { id: 'fuzzy', label: 'Fuzzy', color: 'border-amber-500/30 text-amber-400' },
                  { id: 'unclear', label: 'Needs Study', color: 'border-rose-500/30 text-rose-400' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setConfidenceMap(prev => ({ ...prev, [currentQItem._id]: opt.id }))}
                    className={`py-2 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                      confidenceMap[currentQItem._id] === opt.id
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : `c-input ${opt.color}`
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Next / Finish navigation */}
            <div className="flex items-center justify-between pt-4 border-t c-border">
              <button
                onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                disabled={currentIdx === 0}
                className="px-3.5 py-2 c-input rounded-lg text-xs font-medium c2 disabled:opacity-30"
              >
                Previous
              </button>

              {currentIdx < sessionData.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx(prev => prev + 1)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  Next Question <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  onClick={handleCompleteSession}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  Complete Mock Session <CheckCircle2 size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Calm Session Reflection / Summary
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-2xl font-bold c1 mb-2">Focus Session Complete</h2>
        <p className="c2 text-sm leading-relaxed max-w-md mx-auto">
          Thoughtful, steady repetition builds calm confidence under interview pressure.
        </p>
      </div>

      <div className="c-card border c-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm mb-6">
        <h3 className="text-base font-semibold c1">Session Review & Reflection</h3>
        <div className="space-y-4">
          {sessionData?.questions.map((qItem, idx) => {
            const question = qItem.question || {};
            const conf = confidenceMap[qItem._id];
            const notes = userNotesMap[qItem._id];

            return (
              <div key={qItem._id} className="p-4 c-input rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs c3 font-medium">Question {idx + 1}</span>
                  {conf && (
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                      conf === 'solid' ? 'text-emerald-400 bg-emerald-500/10' :
                      conf === 'fuzzy' ? 'text-amber-400 bg-amber-500/10' :
                      'text-rose-400 bg-rose-500/10'
                    }`}>
                      {conf === 'solid' ? 'Solid' : conf === 'fuzzy' ? 'Fuzzy' : 'Needs Review'}
                    </span>
                  )}
                </div>
                <div className="font-semibold c1 text-sm">{question.title}</div>
                {notes && (
                  <div className="text-xs c2 bg-black/10 p-2.5 rounded-lg font-mono">
                    {notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={() => setSessionState('idle')}
          className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors"
        >
          Start Another Session
        </button>
        <Link
          to="/dashboard"
          className="w-full sm:w-auto px-5 py-2.5 c-card border c-border hover:c-border-h text-sm font-medium c1 rounded-xl transition-colors text-center"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
