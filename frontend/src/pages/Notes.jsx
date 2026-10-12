import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Search, Trash2, ExternalLink, Calendar, HelpCircle, Map, Tag } from 'lucide-react';
import NoteEditor from '../components/NoteEditor';

export default function Notes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');
  const [search, setSearch] = useState('');
  const [editingNote, setEditingNote] = useState(null);

  const fetchNotes = async () => {
    try {
      const res = await axios.get('/api/notes');
      setNotes(res.data);
    } catch (err) {
      console.error('Failed to load notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotes();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleDelete = async (noteId) => {
    try {
      await axios.delete(`/api/notes/${noteId}`);
      setNotes(prev => prev.filter(n => n._id !== noteId));
      if (editingNote?._id === noteId) setEditingNote(null);
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold c1 mb-3">Your Personal Notes</h2>
        <p className="c2 mb-6">Log in to view and search your private annotations across questions and roadmaps.</p>
        <Link to="/login" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium inline-block">
          Log in
        </Link>
      </div>
    );
  }

  const filteredNotes = notes.filter(n => {
    const matchesType = filterType === 'All' || n.targetType === filterType;
    const matchesSearch =
      !search ||
      n.title?.toLowerCase().includes(search.toLowerCase()) ||
      n.content?.toLowerCase().includes(search.toLowerCase()) ||
      n.question?.title?.toLowerCase().includes(search.toLowerCase()) ||
      n.roadmap?.title?.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <BookOpen size={24} className="text-amber-400" />
            <h1 className="text-2xl font-bold c1">Personal Notes & Annotations</h1>
          </div>
          <p className="text-xs c2 mt-1">
            Private mental models, edge-case reminders, and reflections attached to questions and roadmap milestones.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          {['All', 'Question', 'Step'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterType === type ? 'bg-indigo-600 text-white' : 'c-input c2 hover:c1'
              }`}
            >
              {type === 'All' ? 'All Notes' : `${type} Notes`}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 c3" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search through your notes and concepts..."
          className="w-full pl-10 pr-4 py-2.5 c-input rounded-xl border c-border text-sm outline-none focus:ring-1 focus:ring-indigo-500/50 c1 placeholder:c3"
        />
      </div>

      {loading ? (
        <div className="py-20 text-center c3 animate-pulse">Loading notes...</div>
      ) : filteredNotes.length === 0 ? (
        <div className="py-16 text-center c-card border c-border rounded-2xl">
          <BookOpen size={36} className="mx-auto text-amber-400/40 mb-3" />
          <h3 className="text-base font-semibold c1 mb-1">No notes found</h3>
          <p className="text-xs c3 max-w-sm mx-auto mb-6">
            Click "Notes" on any Question card or Roadmap step to capture your personal takeaways.
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/questions" className="text-xs px-4 py-2 bg-indigo-600 text-white rounded-lg">
              Explore Questions
            </Link>
            <Link to="/roadmaps" className="text-xs px-4 py-2 c-input c2 hover:c1 rounded-lg">
              View Roadmaps
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map(n => (
            <div
              key={n._id}
              className="c-card border c-border rounded-2xl p-5 hover:c-border-h transition-all flex flex-col justify-between"
            >
              <div>
                {/* Meta Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-xs">
                    {n.targetType === 'Question' ? (
                      <span className="px-2 py-0.5 rounded c-input text-emerald-400 font-medium flex items-center gap-1">
                        <HelpCircle size={11} /> Question Note
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded c-input text-indigo-400 font-medium flex items-center gap-1">
                        <Map size={11} /> Step Note
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(n._id)}
                    className="p-1 rounded text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete note"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Target context link */}
                {n.targetType === 'Question' && n.question && (
                  <Link
                    to={`/questions?search=${encodeURIComponent(n.question.title)}`}
                    className="text-xs font-semibold c1 hover:text-indigo-400 transition-colors flex items-center gap-1 mb-2 line-clamp-1"
                  >
                    {n.question.title} <ExternalLink size={11} className="c3" />
                  </Link>
                )}

                {n.targetType === 'Step' && n.roadmap && (
                  <Link
                    to={`/roadmaps/${n.roadmap.slug}`}
                    className="text-xs font-semibold c1 hover:text-indigo-400 transition-colors flex items-center gap-1 mb-2 line-clamp-1"
                  >
                    {n.roadmap.title} (Step {n.stepOrder || 1}) <ExternalLink size={11} className="c3" />
                  </Link>
                )}

                {/* Note Content */}
                <div className="p-3 c-input rounded-xl text-xs c1 leading-relaxed whitespace-pre-line mb-3 font-mono">
                  {n.content}
                </div>
              </div>

              {/* Timestamp */}
              <div className="flex items-center justify-between pt-2 border-t c-border text-[11px] c3">
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  {new Date(n.updatedAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => setEditingNote(editingNote?._id === n._id ? null : n)}
                  className="text-indigo-400 hover:underline"
                >
                  {editingNote?._id === n._id ? 'Close' : 'Edit Note'}
                </button>
              </div>

              {/* Inline Editor if active */}
              {editingNote?._id === n._id && (
                <div className="mt-4 pt-3 border-t c-border">
                  <NoteEditor
                    targetType={n.targetType}
                    targetId={n.targetId}
                    questionId={n.question?._id}
                    roadmapId={n.roadmap?._id}
                    stepOrder={n.stepOrder}
                    initialTitle={n.title}
                    onClose={() => setEditingNote(null)}
                    onSaveSuccess={() => {
                      fetchNotes();
                      setEditingNote(null);
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
