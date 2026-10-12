import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, TrendingUp, BookOpen, Clock, ArrowRight, FileText, Brain, Layers, Timer, Edit3, CheckCircle2 } from 'lucide-react';
import StudyPlanWidget from '../components/StudyPlanWidget';
import WeaknessMap from '../components/WeaknessMap';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [roadmaps, setRoadmaps] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [reviewStats, setReviewStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [roadmapsRes, progressRes, reviewRes] = await Promise.all([
          axios.get('/api/roadmaps'),
          axios.get('/api/progress'),
          axios.get('/api/review/stats').catch(() => ({ data: null })),
        ]);
        setRoadmaps(roadmapsRes.data);
        if (reviewRes.data) setReviewStats(reviewRes.data);

        // Build a map of roadmapId -> progress data
        const pMap = {};
        progressRes.data.forEach((p) => {
          const id = p.roadmap?._id || p.roadmap;
          if (id) {
            pMap[id] = {
              completedSteps: p.completedSteps || [],
              lastAccessedAt: p.lastAccessedAt,
            };
          }
        });
        setProgressMap(pMap);
      } catch (err) {
        console.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, navigate, authLoading]);

  if (authLoading) return <div className="max-w-7xl mx-auto px-4 py-20 text-center"><div className="animate-pulse c3">Loading...</div></div>;
  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <LayoutDashboard size={28} className="text-indigo-400" />
          <h1 className="text-3xl font-bold c1">Dashboard</h1>
        </div>
        <p className="c2">Welcome back, {user.name}! Continue your preparation.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="c-card border c-border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center">
              <BookOpen size={20} className="text-indigo-400" />
            </div>
            <div>
              <div className="text-2xl font-bold c1">{roadmaps.length}</div>
              <div className="text-sm c2">Available Roadmaps</div>
            </div>
          </div>
        </div>
        <div className="c-card border c-border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-bold c1">{Object.keys(progressMap).length}</div>
              <div className="text-sm c2">Roadmaps In Progress</div>
            </div>
          </div>
        </div>
        <div className="c-card border c-border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-bold c1">{roadmaps.reduce((sum, r) => sum + (r.estimatedHours || 0), 0)}h</div>
              <div className="text-sm c2">Total Hours of Content</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interview Countdown & Study Plan Widget */}
      <StudyPlanWidget />

      {/* Spaced Repetition Queue Banner (if items due or available) */}
      <div className="c-card border border-indigo-500/20 bg-indigo-500/5 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center flex-shrink-0">
            <Brain size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold c1 text-base">Spaced Repetition Review Queue</h3>
              {reviewStats?.dueCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500 text-white">
                  {reviewStats.dueCount} Due
                </span>
              )}
            </div>
            <p className="text-xs c2 mt-0.5">
              {reviewStats?.dueCount > 0
                ? `${reviewStats.dueCount} concepts are ready for reinforcement today to maintain long-term memory.`
                : 'All scheduled reviews are up-to-date. You can practice new concepts anytime.'}
            </p>
          </div>
        </div>

        <Link
          to="/review"
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
        >
          {reviewStats?.dueCount > 0 ? 'Start Daily Review' : 'Open Review Queue'} <ArrowRight size={14} />
        </Link>
      </div>

      {/* Weakness Map & Topic Retention */}
      <WeaknessMap />
      <div className="mb-8">
        <h2 className="text-xl font-bold c1 mb-4">Your Roadmaps</h2>
        {loading ? (
          <div className="c3 animate-pulse">Loading...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roadmaps.map((roadmap) => {
              const progress = progressMap[roadmap._id];
              const totalSteps = roadmap.stepCount || 0;
              const completedCount = progress?.completedSteps?.length || 0;
              const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

              return (
                <Link
                  key={roadmap._id}
                  to={`/roadmaps/${roadmap.slug}`}
                  className="group flex flex-col p-5 c-card border c-border rounded-xl hover:c-border-h transition-all"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-3xl">{roadmap.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold c1 group-hover:text-indigo-400 transition-colors truncate">
                        {roadmap.title}
                      </h3>
                      <p className="text-sm c2">{roadmap.steps?.length || 0} steps &middot; {roadmap.estimatedHours}h</p>
                    </div>
                    <ArrowRight size={18} className="c3 group-hover:text-indigo-400 flex-shrink-0 transition-colors" />
                  </div>
                  {progress && (
                    <div className="mt-auto">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs c3">{completedCount}/{totalSteps} steps</span>
                        <span className="text-xs font-medium text-indigo-400">{progressPercent}%</span>
                      </div>
                      <div className="w-full c-input rounded-full h-1.5">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="c-card border c-border rounded-xl p-6">
        <h2 className="text-xl font-bold c1 mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            to="/review"
            className="p-4 c-input hover:border-indigo-500/30 rounded-xl border c-border transition-all flex items-center gap-3 group"
          >
            <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Brain size={20} className="text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="font-medium c1 text-sm">Review Queue</div>
              <div className="text-xs c3">Spaced repetition schedule</div>
            </div>
          </Link>
          <Link
            to="/flashcards"
            className="p-4 c-input hover:border-indigo-500/30 rounded-xl border c-border transition-all flex items-center gap-3 group"
          >
            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Layers size={20} className="text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="font-medium c1 text-sm">Flashcards</div>
              <div className="text-xs c3">Flip-card active recall</div>
            </div>
          </Link>
          <Link
            to="/focus"
            className="p-4 c-input hover:border-indigo-500/30 rounded-xl border c-border transition-all flex items-center gap-3 group"
          >
            <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Timer size={20} className="text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="font-medium c1 text-sm">Focus Mode</div>
              <div className="text-xs c3">Timed mock interview</div>
            </div>
          </Link>
          <Link
            to="/notes"
            className="p-4 c-input hover:border-indigo-500/30 rounded-xl border c-border transition-all flex items-center gap-3 group"
          >
            <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Edit3 size={20} className="text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="font-medium c1 text-sm">Personal Notes</div>
              <div className="text-xs c3">Concept annotations</div>
            </div>
          </Link>
          <Link
            to="/questions"
            className="p-4 c-input hover:border-indigo-500/30 rounded-xl border c-border transition-all flex items-center gap-3 group"
          >
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg">📝</span>
            </div>
            <div>
              <div className="font-medium c1 text-sm">Questions</div>
              <div className="text-xs c3">Browse by company & tag</div>
            </div>
          </Link>
          <Link
            to="/roadmaps"
            className="p-4 c-input hover:border-indigo-500/30 rounded-xl border c-border transition-all flex items-center gap-3 group"
          >
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg">🗺️</span>
            </div>
            <div>
              <div className="font-medium c1 text-sm">All Roadmaps</div>
              <div className="text-xs c3">Learning paths</div>
            </div>
          </Link>
          <Link
            to="/report"
            className="p-4 c-input hover:border-indigo-500/30 rounded-xl border c-border transition-all flex items-center gap-3 group"
          >
            <div className="w-10 h-10 bg-rose-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText size={20} className="text-rose-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="font-medium c1 text-sm">Export Report</div>
              <div className="text-xs c3">Download progress PDF</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
