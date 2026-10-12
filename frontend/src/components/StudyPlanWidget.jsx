import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Target, Clock, Edit2, Check, Trash2, ArrowRight } from 'lucide-react';

export default function StudyPlanWidget() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [targetCompany, setTargetCompany] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [dailyHoursGoal, setDailyHoursGoal] = useState(2);
  const [saving, setSaving] = useState(false);

  const fetchPlan = async () => {
    try {
      const res = await axios.get('/api/study-plan');
      setData(res.data);
      if (res.data?.plan) {
        setTargetRole(res.data.plan.targetRole || 'Software Engineer');
        setTargetCompany(res.data.plan.targetCompany || '');
        setInterviewDate(res.data.plan.interviewDate ? res.data.plan.interviewDate.split('T')[0] : '');
        setDailyHoursGoal(res.data.plan.dailyHoursGoal || 2);
      }
    } catch (err) {
      console.error('Failed to load study plan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!interviewDate) return;
    setSaving(true);
    try {
      await axios.post('/api/study-plan', {
        targetRole,
        targetCompany,
        interviewDate,
        dailyHoursGoal: Number(dailyHoursGoal),
      });
      setIsEditing(false);
      fetchPlan();
    } catch (err) {
      console.error('Failed to save study plan:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete('/api/study-plan');
      setData(null);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to remove study plan:', err);
    }
  };

  if (loading) {
    return (
      <div className="c-card border c-border rounded-xl p-5 mb-8 animate-pulse">
        <div className="h-4 bg-gray-500/10 rounded w-40 mb-3"></div>
        <div className="h-10 c-input rounded"></div>
      </div>
    );
  }

  // Edit / Setup Modal or Inline Form
  if (!data?.plan || isEditing) {
    return (
      <div className="c-card border c-border rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target size={20} className="text-indigo-400" />
            <h2 className="text-base font-bold c1">
              {data?.plan ? 'Adjust Interview Study Plan' : 'Set Your Interview Target Date'}
            </h2>
          </div>
          {data?.plan && (
            <button
              onClick={() => setIsEditing(false)}
              className="text-xs c3 hover:c1"
            >
              Cancel
            </button>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium c2 block mb-1">Target Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full p-2.5 text-xs c-input rounded-lg outline-none focus:ring-1 focus:ring-indigo-500/50 c1"
              />
            </div>
            <div>
              <label className="text-xs font-medium c2 block mb-1">Target Company (Optional)</label>
              <input
                type="text"
                value={targetCompany}
                onChange={e => setTargetCompany(e.target.value)}
                placeholder="e.g. Google, Stripe, or General"
                className="w-full p-2.5 text-xs c-input rounded-lg outline-none focus:ring-1 focus:ring-indigo-500/50 c1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium c2 block mb-1">Target Interview Date</label>
              <input
                type="date"
                required
                value={interviewDate}
                onChange={e => setInterviewDate(e.target.value)}
                className="w-full p-2.5 text-xs c-input rounded-lg outline-none focus:ring-1 focus:ring-indigo-500/50 c1"
              />
            </div>
            <div>
              <label className="text-xs font-medium c2 block mb-1">Daily Study Target (Hours)</label>
              <input
                type="number"
                min="0.5"
                max="12"
                step="0.5"
                value={dailyHoursGoal}
                onChange={e => setDailyHoursGoal(e.target.value)}
                className="w-full p-2.5 text-xs c-input rounded-lg outline-none focus:ring-1 focus:ring-indigo-500/50 c1"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {data?.plan ? (
              <button
                type="button"
                onClick={handleDelete}
                className="text-xs text-red-400 hover:underline flex items-center gap-1"
              >
                <Trash2 size={12} /> Remove Plan
              </button>
            ) : <span />}

            <button
              type="submit"
              disabled={saving || !interviewDate}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
            >
              {saving ? 'Saving...' : 'Set Study Goal'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  const { plan, daysRemaining, totalHoursTarget } = data;

  return (
    <div className="c-card border c-border rounded-xl p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <Calendar size={20} className="text-indigo-400" />
          <div>
            <h2 className="text-base font-bold c1">
              Interview Target: {plan.targetCompany ? `${plan.targetCompany} ` : ''}{plan.targetRole}
            </h2>
            <p className="text-xs c3">
              Scheduled for {new Date(plan.interviewDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(true)}
          className="text-xs text-indigo-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
        >
          <Edit2 size={12} /> Adjust Target
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="p-3.5 c-input rounded-xl">
          <div className="text-xs c3 mb-0.5">Countdown</div>
          <div className="text-2xl font-bold text-indigo-400">
            {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
          </div>
          <div className="text-[11px] c3 mt-1">Remaining until target date</div>
        </div>

        <div className="p-3.5 c-input rounded-xl">
          <div className="text-xs c3 mb-0.5">Study Pace</div>
          <div className="text-2xl font-bold c1">
            {plan.dailyHoursGoal}h / day
          </div>
          <div className="text-[11px] c3 mt-1">Steady, deliberate practice</div>
        </div>

        <div className="p-3.5 c-input rounded-xl">
          <div className="text-xs c3 mb-0.5">Prep Budget</div>
          <div className="text-2xl font-bold text-emerald-400">
            ~{totalHoursTarget}h
          </div>
          <div className="text-[11px] c3 mt-1">Total focus hours available</div>
        </div>
      </div>
    </div>
  );
}
