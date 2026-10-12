import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Edit3, Check, Trash2, X } from 'lucide-react';

export default function NoteEditor({
  targetType,
  targetId,
  questionId,
  roadmapId,
  stepOrder,
  initialTitle = '',
  onClose,
  onSaveSuccess,
}) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState(initialTitle);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [existingNoteId, setExistingNoteId] = useState(null);

  useEffect(() => {
    if (!user || !targetType || !targetId) {
      setLoading(false);
      return;
    }

    const fetchNote = async () => {
      try {
        const res = await axios.get(
          `/api/notes/target?targetType=${encodeURIComponent(targetType)}&targetId=${encodeURIComponent(targetId)}`
        );
        if (res.data) {
          setContent(res.data.content || '');
          setTitle(res.data.title || initialTitle);
          setExistingNoteId(res.data._id);
        }
      } catch (err) {
        console.error('Failed to load note:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [user, targetType, targetId, initialTitle]);

  const handleSave = async () => {
    if (!user || !content.trim()) return;
    setSaving(true);
    try {
      const res = await axios.post('/api/notes', {
        targetType,
        targetId: String(targetId),
        title,
        content,
        questionId: questionId || (targetType === 'Question' ? targetId : undefined),
        roadmapId: roadmapId || undefined,
        stepOrder: stepOrder != null ? stepOrder : undefined,
      });
      setExistingNoteId(res.data._id);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
      if (onSaveSuccess) onSaveSuccess(res.data);
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existingNoteId) return;
    try {
      await axios.delete(`/api/notes/${existingNoteId}`);
      setContent('');
      setExistingNoteId(null);
      if (onSaveSuccess) onSaveSuccess(null);
      if (onClose) onClose();
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  if (!user) {
    return (
      <div className="p-4 c-input rounded-xl text-center text-sm c3">
        Sign in to attach personal notes to this {targetType.toLowerCase()}.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 c-card border c-border rounded-xl text-xs c3 animate-pulse">
        Loading note...
      </div>
    );
  }

  return (
    <div className="p-4 c-card border c-border rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Edit3 size={16} className="text-amber-400" />
          <span className="text-xs font-semibold uppercase tracking-wider c2">
            Personal Notes
          </span>
        </div>
        <div className="flex items-center gap-2">
          {existingNoteId && (
            <button
              onClick={handleDelete}
              className="p-1 rounded text-red-400 hover:bg-red-500/10 transition-colors"
              title="Delete note"
            >
              <Trash2 size={14} />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded c3 hover:c1 hover:c-input transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Write down key insights, common traps, or mental models in your own words..."
        rows={3}
        className="w-full p-2.5 text-sm c-input rounded-lg outline-none focus:ring-1 focus:ring-indigo-500/50 c1 resize-y placeholder:c3 leading-relaxed"
      />

      <div className="flex items-center justify-between pt-1">
        <span className="text-xs c3">
          {savedSuccess ? (
            <span className="text-emerald-400 flex items-center gap-1">
              <Check size={12} /> Saved to your notes
            </span>
          ) : (
            'Saved securely to your private account'
          )}
        </span>

        <button
          onClick={handleSave}
          disabled={saving || !content.trim()}
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-sm"
        >
          {saving ? 'Saving...' : 'Save Note'}
        </button>
      </div>
    </div>
  );
}
