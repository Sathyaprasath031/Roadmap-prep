import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Search, ChevronDown, ChevronUp, Building2, Tag, Bookmark, BookmarkCheck } from 'lucide-react';

export default function Questions() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [bookmarks, setBookmarks] = useState(new Set());
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const categories = ['Frontend', 'Backend', 'DSA', 'System Design', 'DevOps', 'ML/AI'];
  const difficulties = ['Easy', 'Medium', 'Hard'];

  // Load user's bookmarks on mount
  useEffect(() => {
    if (user) {
      axios.get('/api/bookmarks')
        .then((res) => setBookmarks(new Set(res.data)))
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    setPage(1);
  }, [search, category, difficulty]);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (category) params.set('category', category);
        if (difficulty) params.set('difficulty', difficulty);
        params.set('page', page);
        params.set('limit', '20');

        const res = await axios.get(`/api/questions?${params}`);
        setQuestions(res.data.questions);
        setPagination(res.data.pagination);
      } catch (err) {
        console.error('Failed to load questions');
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchQuestions, 300);
    return () => clearTimeout(debounce);
  }, [search, category, difficulty, page]);

  const toggleBookmark = async (questionId) => {
    if (!user) return;
    // Optimistic update
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
    try {
      await axios.post(`/api/bookmarks/${questionId}`);
    } catch (err) {
      console.error('Failed to toggle bookmark');
      // Revert on error
      setBookmarks((prev) => {
        const next = new Set(prev);
        if (next.has(questionId)) {
          next.delete(questionId);
        } else {
          next.add(questionId);
        }
        return next;
      });
    }
  };

  const filteredQuestions = showBookmarkedOnly
    ? questions.filter((q) => bookmarks.has(q._id))
    : questions;

  const diffColor = {
    Easy: 'bg-green-500/10 text-green-400',
    Medium: 'bg-amber-500/10 text-amber-400',
    Hard: 'bg-red-500/10 text-red-400',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold c1 mb-4">Interview Questions</h1>
        <p className="c2 text-lg">Practice commonly asked questions from top tech companies</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 c3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-10 pr-4 py-3 c-card border c-border rounded-xl c1 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-3 c-card border c-border rounded-xl c2 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
        >
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="px-4 py-3 c-card border c-border rounded-xl c2 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
        >
          <option value="">All Difficulties</option>
          {difficulties.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {user && (
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setShowBookmarkedOnly(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !showBookmarkedOnly ? 'bg-indigo-600 c1' : 'c-card c2 hover:c1 border c-border'
            }`}
          >
            All Questions
          </button>
          <button
            onClick={() => setShowBookmarkedOnly(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              showBookmarkedOnly ? 'bg-indigo-600 c1' : 'c-card c2 hover:c1 border c-border'
            }`}
          >
            <BookmarkCheck size={14} />
            Bookmarked ({bookmarks.size})
          </button>
        </div>
      )}

      {/* Questions */}
      {loading ? (
        <div className="text-center py-20 c3 animate-pulse">Loading questions...</div>
      ) : filteredQuestions.length === 0 ? (
        <div className="text-center py-20 c3">{showBookmarkedOnly ? 'No bookmarked questions' : 'No questions found matching your filters'}</div>
      ) : (
        <div className="space-y-3">
          {filteredQuestions.map((q) => (
            <div
              key={q._id}
              className="c-card border c-border rounded-xl overflow-hidden hover:c-border-h transition-all"
            >
              <div
                className="flex items-center gap-4 p-5 cursor-pointer"
                onClick={() => setExpandedId(expandedId === q._id ? null : q._id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${diffColor[q.difficulty]}`}>
                      {q.difficulty}
                    </span>
                    <span className="px-2 py-0.5 c-input c2 rounded text-xs">{q.category}</span>
                    {q.frequency >= 80 && (
                      <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded text-xs">Frequently Asked</span>
                    )}
                  </div>
                  <h3 className="font-semibold c1">{q.title}</h3>
                  {q.company?.length > 0 && (
                    <div className="flex items-center gap-1 mt-1.5 text-xs c3">
                      <Building2 size={12} />
                      {q.company.join(', ')}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {user && (
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleBookmark(q._id); }}
                      className="p-1.5 rounded-lg hover:c-input transition-colors"
                      title={bookmarks.has(q._id) ? 'Remove bookmark' : 'Bookmark question'}
                    >
                      {bookmarks.has(q._id) ? (
                        <BookmarkCheck size={18} className="text-indigo-400" />
                      ) : (
                        <Bookmark size={18} className="c3 hover:c2" />
                      )}
                    </button>
                  )}
                  {expandedId === q._id ? <ChevronUp size={20} className="c3" /> : <ChevronDown size={20} className="c3" />}
                </div>
              </div>

              {expandedId === q._id && (
                <div className="px-5 pb-5 border-t c-border">
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-indigo-400 mb-2">Answer</h4>
                    <p className="c2 text-sm leading-relaxed whitespace-pre-line">{q.answer}</p>
                  </div>
                  {q.tags?.length > 0 && (
                    <div className="flex items-center gap-2 mt-4 flex-wrap">
                      <Tag size={12} className="c3" />
                      {q.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 c-input c2 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && !showBookmarkedOnly && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 c-card border c-border rounded-lg text-sm c2 hover:c1 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-sm c3">
            Page {page} of {pagination.pages} ({pagination.total} questions)
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="px-4 py-2 c-card border c-border rounded-lg text-sm c2 hover:c1 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
