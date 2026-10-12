import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Activity, AlertTriangle, CheckCircle2, HelpCircle, ArrowRight } from 'lucide-react';

export default function WeaknessMap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeakness = async () => {
      try {
        const res = await axios.get('/api/weakness');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load weakness map:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeakness();
  }, []);

  if (loading) {
    return (
      <div className="c-card border c-border rounded-xl p-6 mb-8 animate-pulse">
        <div className="h-5 bg-gray-500/10 rounded w-48 mb-4"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-20 c-input rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const statusConfig = {
    strong: {
      label: 'Solid',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      dot: 'bg-emerald-500',
    },
    moderate: {
      label: 'Needs Practice',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      dot: 'bg-amber-500',
    },
    weak: {
      label: 'Needs Focus',
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20',
      dot: 'bg-rose-500',
    },
    untested: {
      label: 'Not Yet Assessed',
      color: 'c3',
      bg: 'c-input border c-border',
      dot: 'bg-gray-400',
    },
  };

  return (
    <div className="c-card border c-border rounded-xl p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity size={20} className="text-indigo-400" />
            <h2 className="text-lg font-bold c1">Topic Mastery & Weakness Map</h2>
          </div>
          <p className="text-xs c2 mt-0.5">
            Calm, factual overview of your concept retention from quizzes and reviews.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs c3">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Solid</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Review</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Priority</span>
        </div>
      </div>

      {/* Grid of Topic Heatmap Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        {data.summary.map(item => {
          const cfg = statusConfig[item.status] || statusConfig.untested;
          return (
            <div
              key={item.category}
              className={`p-3.5 rounded-xl border ${cfg.bg} flex flex-col justify-between transition-all`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold c1 truncate">{item.category}</span>
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`}></span>
                </div>
                <div className="text-lg font-bold c1">
                  {item.scorePercent !== null ? `${item.scorePercent}%` : '—'}
                </div>
              </div>
              <div className="mt-2 text-[11px] c3 flex items-center justify-between">
                <span>{cfg.label}</span>
                <span>{item.attempts} trials</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Targeted Recommendations */}
      {data.recommendations?.length > 0 && (
        <div className="pt-4 border-t c-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider c2 flex items-center gap-1.5">
              <AlertTriangle size={13} className="text-amber-400" />
              Suggested Targeted Practice
            </span>
            <Link
              to="/questions"
              className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
            >
              All questions <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {data.recommendations.map(q => (
              <Link
                key={q._id}
                to={`/questions?search=${encodeURIComponent(q.title)}`}
                className="p-3 c-input hover:border-indigo-500/40 border c-border rounded-lg text-left block transition-colors group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded c-card font-medium c2">
                    {q.category}
                  </span>
                  <span className="text-[10px] c3">{q.difficulty}</span>
                </div>
                <p className="text-xs font-medium c1 group-hover:text-indigo-400 transition-colors line-clamp-1">
                  {q.title}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
