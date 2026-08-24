import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, TrendingUp, BookOpen, Clock, ArrowRight, FileText } from 'lucide-react';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [roadmaps, setRoadmaps] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [roadmapsRes, progressRes] = await Promise.all([
          axios.get('/api/roadmaps'),
          axios.get('/api/progress'),
        ]);
        setRoadmaps(roadmapsRes.data);

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

      {/* Continue Learning */}
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
        <div className="grid sm:grid-cols-2 gap-3">
          <Link
            to="/questions"
            className="p-4 c-input hover:bg-gray-750 rounded-xl border c-border-h hover:c-border-h transition-all flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <span className="text-lg">📝</span>
            </div>
            <div>
              <div className="font-medium c1">Practice Questions</div>
              <div className="text-sm c2">Review interview questions</div>
            </div>
          </Link>
          <Link
            to="/roadmaps"
            className="p-4 c-input hover:bg-gray-750 rounded-xl border c-border-h hover:c-border-h transition-all flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
              <span className="text-lg">🗺️</span>
            </div>
            <div>
              <div className="font-medium c1">All Roadmaps</div>
              <div className="text-sm c2">Explore all learning paths</div>
            </div>
          </Link>
          <Link
            to="/report"
            className="p-4 c-input hover:bg-gray-750 rounded-xl border c-border-h hover:c-border-h transition-all flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-rose-500/10 rounded-lg flex items-center justify-center">
              <FileText size={20} className="text-rose-400" />
            </div>
            <div>
              <div className="font-medium c1">Export Report</div>
              <div className="text-sm c2">Download progress as PDF</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
