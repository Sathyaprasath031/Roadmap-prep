import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Clock, BookOpen, ArrowRight, LogIn } from 'lucide-react';

const colorMap = {
  '#6366f1': 'from-indigo-600 to-indigo-400',
  '#10b981': 'from-emerald-600 to-emerald-400',
  '#f59e0b': 'from-amber-600 to-amber-400',
  '#ec4899': 'from-pink-600 to-pink-400',
  '#8b5cf6': 'from-violet-600 to-violet-400',
  '#0ea5e9': 'from-sky-600 to-sky-400',
};

export default function Roadmaps() {
  const { user, loading: authLoading } = useAuth();
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    const fetchRoadmaps = async () => {
      try {
        const res = await axios.get('/api/roadmaps');
        setRoadmaps(res.data);
      } catch (err) {
        console.error('Failed to load roadmaps');
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmaps();
  }, [authLoading]);

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-pulse c3">Loading roadmaps...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="c-card border c-border rounded-2xl p-12 max-w-md mx-auto">
          <LogIn size={36} className="text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold c1 mb-2 tracking-tight">Sign in to access Roadmaps</h2>
          <p className="c2 text-sm mb-5">Create an account or log in to view learning roadmaps and track your progress.</p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/login"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 c1 font-semibold rounded-xl transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 c-input hover:c-hover c2 font-semibold rounded-xl border c-border-h transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold c1 mb-3 tracking-tight">Learning Roadmaps</h1>
        <p className="c2 text-sm max-w-xl mx-auto">
          Follow structured learning paths to prepare for interviews in your chosen domain
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roadmaps.map((roadmap) => (
          <Link
            key={roadmap._id}
            to={`/roadmaps/${roadmap.slug}`}
            className="group relative c-card border c-border rounded-2xl p-6 card-interactive"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${colorMap[roadmap.color] || 'from-indigo-600 to-indigo-400'} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`}></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{roadmap.icon}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  roadmap.difficulty === 'Beginner' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                  roadmap.difficulty === 'Intermediate' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                  'bg-red-500/10 text-red-600 dark:text-red-400'
                }`}>
                  {roadmap.difficulty}
                </span>
              </div>
              <h3 className="text-lg font-semibold c1 mb-1.5 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {roadmap.title}
              </h3>
              <p className="c3 text-xs mb-4 line-clamp-2 leading-relaxed">{roadmap.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 c3 text-sm">
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {roadmap.estimatedHours}h
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen size={14} /> {roadmap.stepCount || 0} steps
                  </span>
                </div>
                <ArrowRight size={18} className="c3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {roadmap.tags?.slice(0, 4).map((tag) => (
                  <span key={tag} className="px-2 py-0.5 c-input c2 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
