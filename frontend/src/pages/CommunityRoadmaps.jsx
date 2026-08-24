import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Users, ThumbsUp, GitFork, Plus, Search, ArrowLeft, Trash2, Send, ChevronDown, ChevronUp } from 'lucide-react';

export default function CommunityRoadmaps() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);

  // Create form state
  const [form, setForm] = useState({
    title: '', description: '', icon: '📋', difficulty: 'Intermediate',
    tags: '', steps: [{ title: '', description: '', topics: '', resources: [] }],
  });

  useEffect(() => {
    fetchRoadmaps();
  }, [sort]);

  const fetchRoadmaps = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort });
      if (search) params.set('search', search);
      const res = await axios.get(`/api/community?${params}`);
      setRoadmaps(res.data);
    } catch (err) {
      console.error('Failed to load community roadmaps');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => fetchRoadmaps();

  const createRoadmap = async () => {
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        steps: form.steps.map((s, idx) => ({
          ...s,
          order: idx + 1,
          topics: s.topics ? s.topics.split(',').map((t) => t.trim()).filter(Boolean) : [],
        })),
      };
      const res = await axios.post('/api/community', payload);
      setRoadmaps([res.data, ...roadmaps]);
      setShowCreate(false);
      setForm({ title: '', description: '', icon: '📋', difficulty: 'Intermediate', tags: '', steps: [{ title: '', description: '', topics: '', resources: [] }] });
    } catch (err) {
      console.error('Failed to create roadmap');
    }
  };

  const upvoteRoadmap = async (id) => {
    if (!user) return;
    try {
      const res = await axios.post(`/api/community/${id}/upvote`);
      setRoadmaps(roadmaps.map((r) =>
        r._id === id ? { ...r, upvotes: Array(res.data.upvotes).fill(null) } : r
      ));
    } catch (err) {
      console.error('Failed to upvote');
    }
  };

  const forkRoadmap = async (id) => {
    if (!user) return;
    try {
      const res = await axios.post(`/api/community/${id}/fork`);
      setRoadmaps([res.data, ...roadmaps]);
    } catch (err) {
      console.error('Failed to fork');
    }
  };

  const addStep = () => {
    setForm({ ...form, steps: [...form.steps, { title: '', description: '', topics: '', resources: [] }] });
  };

  const updateStep = (idx, field, value) => {
    const newSteps = [...form.steps];
    newSteps[idx] = { ...newSteps[idx], [field]: value };
    setForm({ ...form, steps: newSteps });
  };

  const removeStep = (idx) => {
    setForm({ ...form, steps: form.steps.filter((_, i) => i !== idx) });
  };

  // Detail View
  if (selectedRoadmap) {
    const rm = selectedRoadmap;
    const isOwner = user && rm.user?._id === user.id;

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <button onClick={() => setSelectedRoadmap(null)} className="inline-flex items-center gap-2 c2 hover:c1 mb-6">
          <ArrowLeft size={18} /> Back to Community
        </button>

        <div className="c-card border c-border rounded-2xl p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{rm.icon}</span>
                <div>
                  <h1 className="text-3xl font-bold c1">{rm.title}</h1>
                  <p className="text-sm c2">by {rm.user?.name || 'Unknown'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  rm.difficulty === 'Beginner' ? 'bg-green-500/10 text-green-400' :
                  rm.difficulty === 'Intermediate' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-red-500/10 text-red-400'
                }`}>{rm.difficulty}</span>
                {rm.tags?.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 c-input c2 rounded text-xs">{tag}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user && !isOwner && (
                <button onClick={() => forkRoadmap(rm._id)} className="flex items-center gap-1 px-3 py-1.5 c-input hover:c-hover rounded-lg text-sm c2 border c-border-h">
                  <GitFork size={14} /> Fork
                </button>
              )}
              {user && (
                <button onClick={() => upvoteRoadmap(rm._id)} className="flex items-center gap-1 px-3 py-1.5 c-input hover:c-hover rounded-lg text-sm c2 border c-border-h">
                  <ThumbsUp size={14} /> {rm.upvotes?.length || 0}
                </button>
              )}
            </div>
          </div>

          <p className="c2 mb-8">{rm.description}</p>

          <div className="space-y-4">
            {rm.steps?.map((step) => (
              <div key={step.order} className="c-input/50 border c-border-h rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs c3 font-mono">Step {step.order}</span>
                </div>
                <h3 className="font-semibold c1 mb-1">{step.title}</h3>
                {step.description && <p className="text-sm c2">{step.description}</p>}
                {step.topics?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {step.topics.map((t) => (
                      <span key={t} className="px-2 py-0.5 bg-gray-700 c2 rounded text-xs">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Create Form
  if (showCreate) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button onClick={() => setShowCreate(false)} className="inline-flex items-center gap-2 c2 hover:c1 mb-6">
          <ArrowLeft size={18} /> Back
        </button>

        <h1 className="text-3xl font-bold c1 mb-8">Create a Roadmap</h1>

        <div className="space-y-6">
          <div className="c-card border c-border rounded-xl p-6 space-y-4">
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Roadmap title"
              className="w-full px-4 py-3 c-input border c-border-h rounded-xl c1 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description"
              rows={3}
              className="w-full px-4 py-3 c-input border c-border-h rounded-xl c1 placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
            <div className="grid grid-cols-3 gap-3">
              <input
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                placeholder="Icon (emoji)"
                className="px-4 py-3 c-input border c-border-h rounded-xl c1 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
              <select
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                className="px-4 py-3 c-input border c-border-h rounded-xl c2 focus:outline-none focus:border-indigo-500"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
              <input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="Tags (comma sep)"
                className="px-4 py-3 c-input border c-border-h rounded-xl c1 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <h2 className="text-lg font-semibold c1">Steps</h2>
          {form.steps.map((step, idx) => (
            <div key={idx} className="c-card border c-border rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm c3">Step {idx + 1}</span>
                {form.steps.length > 1 && (
                  <button onClick={() => removeStep(idx)} className="text-red-400 hover:text-red-300">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <input
                value={step.title}
                onChange={(e) => updateStep(idx, 'title', e.target.value)}
                placeholder="Step title"
                className="w-full px-4 py-3 c-input border c-border-h rounded-xl c1 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
              <input
                value={step.description}
                onChange={(e) => updateStep(idx, 'description', e.target.value)}
                placeholder="Description"
                className="w-full px-4 py-3 c-input border c-border-h rounded-xl c1 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
              <input
                value={step.topics}
                onChange={(e) => updateStep(idx, 'topics', e.target.value)}
                placeholder="Topics (comma separated)"
                className="w-full px-4 py-3 c-input border c-border-h rounded-xl c1 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          ))}

          <button onClick={addStep} className="w-full py-3 border-2 border-dashed c-border-h rounded-xl c3 hover:c2 hover:c-border-h transition-colors flex items-center justify-center gap-2">
            <Plus size={18} /> Add Step
          </button>

          <button
            onClick={createRoadmap}
            disabled={!form.title || !form.description}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 c1 font-semibold rounded-xl transition-colors"
          >
            Create Roadmap
          </button>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <Users size={48} className="text-indigo-400 mx-auto mb-4" />
        <h1 className="text-4xl font-bold c1 mb-4">Community Roadmaps</h1>
        <p className="c2 text-lg">Browse, create, and fork learning roadmaps from the community</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 c3" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search roadmaps..."
            className="w-full pl-10 pr-4 py-3 c-card border c-border rounded-xl c1 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-4 py-3 c-card border c-border rounded-xl c2 focus:outline-none focus:border-indigo-500"
        >
          <option value="newest">Newest</option>
          <option value="popular">Most Upvoted</option>
          <option value="forks">Most Forked</option>
        </select>
        {user && (
          <button
            onClick={() => setShowCreate(true)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 c1 font-semibold rounded-xl transition-colors flex items-center gap-2"
          >
            <Plus size={18} /> Create Roadmap
          </button>
        )}
      </div>

      {/* Roadmaps */}
      {loading ? (
        <div className="text-center py-20 c3 animate-pulse">Loading...</div>
      ) : roadmaps.length === 0 ? (
        <div className="text-center py-20 c3">
          No community roadmaps yet. Be the first to create one!
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roadmaps.map((rm) => (
            <div
              key={rm._id}
              className="c-card border c-border rounded-2xl p-6 hover:c-border-h transition-all cursor-pointer"
              onClick={() => setSelectedRoadmap(rm)}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{rm.icon}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  rm.difficulty === 'Beginner' ? 'bg-green-500/10 text-green-400' :
                  rm.difficulty === 'Intermediate' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-red-500/10 text-red-400'
                }`}>{rm.difficulty}</span>
              </div>
              <h3 className="text-xl font-bold c1 mb-2">{rm.title}</h3>
              <p className="c2 text-sm mb-4 line-clamp-2">{rm.description}</p>
              <div className="flex items-center justify-between text-sm c3">
                <span>by {rm.user?.name || 'Anonymous'}</span>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1"><ThumbsUp size={14} /> {rm.upvotes?.length || 0}</span>
                  <span className="flex items-center gap-1"><GitFork size={14} /> {rm.forks || 0}</span>
                </div>
              </div>
              {rm.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {rm.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-2 py-0.5 c-input c2 rounded text-xs">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
