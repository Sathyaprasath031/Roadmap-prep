import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, X, Map, HelpCircle, FileText, ArrowRight, CornerDownLeft } from 'lucide-react';

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ questions: [], roadmaps: [], notes: [] });
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Focus on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults({ questions: [], roadmaps: [], notes: [] });
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Search API call with debounce
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults({ questions: [], roadmaps: [], notes: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await axios.get(`/api/search?q=${encodeURIComponent(query)}`);
        setResults(res.data);
        setSelectedIndex(0);
      } catch (err) {
        console.error('Search query failed:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [query]);

  // Flattened items for keyboard navigation
  const allItems = [
    ...results.roadmaps.map(r => ({ type: 'roadmap', data: r })),
    ...results.questions.map(q => ({ type: 'question', data: q })),
    ...results.notes.map(n => ({ type: 'note', data: n })),
  ];

  const handleSelect = (item) => {
    if (!item) return;
    onClose();
    if (item.type === 'roadmap') {
      navigate(`/roadmaps/${item.data.slug}`);
    } else if (item.type === 'question') {
      navigate(`/questions?search=${encodeURIComponent(item.data.title)}`);
    } else if (item.type === 'note') {
      navigate('/notes');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < allItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : allItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        handleSelect(allItems[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl c-card border c-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b c-border gap-3">
          <Search size={20} className="text-indigo-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type to search questions, roadmaps, notes..."
            className="w-full bg-transparent outline-none c1 text-base placeholder:c3"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md hover:c-input c3 hover:c1"
            >
              <X size={16} />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs c3 c-input rounded border c-border">
            ESC
          </kbd>
        </div>

        {/* Search Results Container */}
        <div className="overflow-y-auto p-3 flex-1 space-y-4">
          {loading && (
            <div className="py-8 text-center c3 text-sm animate-pulse">
              Searching knowledge base...
            </div>
          )}

          {!loading && query && allItems.length === 0 && (
            <div className="py-12 text-center">
              <p className="c2 font-medium">No results found for "{query}"</p>
              <p className="c3 text-sm mt-1">Try searching by topic, keyword, or company</p>
            </div>
          )}

          {!loading && !query && (
            <div className="py-8 text-center c3 text-sm">
              <p className="mb-2">Quick Navigation</p>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="px-2.5 py-1 c-input rounded-md text-xs c2">Frontend</span>
                <span className="px-2.5 py-1 c-input rounded-md text-xs c2">Backend</span>
                <span className="px-2.5 py-1 c-input rounded-md text-xs c2">System Design</span>
                <span className="px-2.5 py-1 c-input rounded-md text-xs c2">DSA</span>
              </div>
            </div>
          )}

          {/* Roadmaps Group */}
          {results.roadmaps.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider c3 flex items-center gap-1.5">
                <Map size={13} className="text-indigo-400" />
                Roadmaps
              </div>
              <div className="mt-1 space-y-1">
                {results.roadmaps.map(r => {
                  const globalIdx = allItems.findIndex(item => item.type === 'roadmap' && item.data._id === r._id);
                  const isSelected = globalIdx === selectedIndex;
                  return (
                    <button
                      key={r._id}
                      onClick={() => handleSelect({ type: 'roadmap', data: r })}
                      onMouseEnter={() => setSelectedIndex(globalIdx)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-all ${
                        isSelected ? 'bg-indigo-600/10 border border-indigo-500/30' : 'hover:c-input'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xl flex-shrink-0">{r.icon || '🗺️'}</span>
                        <div className="truncate">
                          <span className="font-medium c1 text-sm block truncate">{r.title}</span>
                          <span className="text-xs c3">{r.difficulty} &middot; {r.estimatedHours}h</span>
                        </div>
                      </div>
                      <ArrowRight size={15} className={isSelected ? 'text-indigo-400' : 'c3'} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Questions Group */}
          {results.questions.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider c3 flex items-center gap-1.5">
                <HelpCircle size={13} className="text-emerald-400" />
                Questions
              </div>
              <div className="mt-1 space-y-1">
                {results.questions.map(q => {
                  const globalIdx = allItems.findIndex(item => item.type === 'question' && item.data._id === q._id);
                  const isSelected = globalIdx === selectedIndex;
                  return (
                    <button
                      key={q._id}
                      onClick={() => handleSelect({ type: 'question', data: q })}
                      onMouseEnter={() => setSelectedIndex(globalIdx)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-all ${
                        isSelected ? 'bg-indigo-600/10 border border-indigo-500/30' : 'hover:c-input'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs px-1.5 py-0.5 rounded c-input c2 font-medium">{q.category}</span>
                          <span className="text-xs c3">{q.difficulty}</span>
                          {q.company?.[0] && (
                            <span className="text-xs c3">&middot; {q.company[0]}</span>
                          )}
                        </div>
                        <p className="text-sm font-medium c1 truncate">{q.title}</p>
                      </div>
                      <CornerDownLeft size={14} className={isSelected ? 'text-indigo-400' : 'c3'} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes Group */}
          {results.notes.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider c3 flex items-center gap-1.5">
                <FileText size={13} className="text-amber-400" />
                Personal Notes
              </div>
              <div className="mt-1 space-y-1">
                {results.notes.map(n => {
                  const globalIdx = allItems.findIndex(item => item.type === 'note' && item.data._id === n._id);
                  const isSelected = globalIdx === selectedIndex;
                  return (
                    <button
                      key={n._id}
                      onClick={() => handleSelect({ type: 'note', data: n })}
                      onMouseEnter={() => setSelectedIndex(globalIdx)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-all ${
                        isSelected ? 'bg-indigo-600/10 border border-indigo-500/30' : 'hover:c-input'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <span className="text-xs text-amber-400 font-medium">Note: {n.targetType}</span>
                        <p className="text-sm font-medium c1 truncate">{n.title || n.content.slice(0, 40)}</p>
                      </div>
                      <ArrowRight size={14} className={isSelected ? 'text-indigo-400' : 'c3'} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 border-t c-border c-input flex items-center justify-between text-xs c3">
          <div className="flex items-center gap-3">
            <span>Use <kbd className="px-1 py-0.5 rounded c-card border c-border font-mono">↑</kbd> <kbd className="px-1 py-0.5 rounded c-card border c-border font-mono">↓</kbd> to navigate</span>
            <span><kbd className="px-1 py-0.5 rounded c-card border c-border font-mono">↵</kbd> to select</span>
          </div>
          <span>Calm Navigation</span>
        </div>
      </div>
    </div>
  );
}
