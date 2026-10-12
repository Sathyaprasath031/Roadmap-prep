import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Layers, RotateCcw, Shuffle, ChevronLeft, ChevronRight, Sparkles, Building2, Check, RefreshCw } from 'lucide-react';

export default function Flashcards() {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [category, setCategory] = useState('');
  const [showEli5, setShowEli5] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');

  const categories = ['All', 'Frontend', 'Backend', 'DSA', 'System Design', 'DevOps', 'ML/AI'];

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      try {
        const catParam = category && category !== 'All' ? `?category=${category}` : '';
        const res = await axios.get(`/api/review/flashcards${catParam}`);
        setCards(res.data);
        setCurrentIndex(0);
        setIsFlipped(false);
        setShowEli5(false);
      } catch (err) {
        console.error('Failed to load flashcards:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [category]);

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
      setShowEli5(false);
      setFeedback('');
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
      setShowEli5(false);
      setFeedback('');
    }
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowEli5(false);
    setFeedback('');
  };

  const handleRate = async (rating) => {
    if (!currentCard || !user) return;
    try {
      await axios.post('/api/review/submit', {
        questionId: currentCard._id,
        rating,
      });
      setFeedback(rating === 'got_it' ? 'Marked as known' : 'Scheduled for review soon');
      setTimeout(() => {
        handleNext();
      }, 400);
    } catch (err) {
      console.error('Failed to rate card:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <Layers size={22} className="text-indigo-400" />
            <h1 className="text-2xl font-bold c1">Flashcards Mode</h1>
          </div>
          <p className="text-xs c2 mt-1">
            Active recall mode for mental agility. Tap the card or spacebar to flip.
          </p>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat === 'All' ? '' : cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                (category === '' && cat === 'All') || category === cat
                  ? 'bg-indigo-600 text-white'
                  : 'c-input c2 hover:c1'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center c3 animate-pulse">Loading deck...</div>
      ) : cards.length === 0 ? (
        <div className="py-20 text-center c-card border c-border rounded-2xl">
          <p className="c2 font-medium">No cards found in this category.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Card Meta & Counter */}
          <div className="flex items-center justify-between text-xs c3 px-1">
            <span>
              Card {currentIndex + 1} of {cards.length}
            </span>
            <button
              onClick={handleShuffle}
              className="flex items-center gap-1.5 hover:c1 transition-colors"
            >
              <Shuffle size={14} /> Shuffle Deck
            </button>
          </div>

          {/* Flashcard Body */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-[340px] c-card border c-border hover:c-border-h rounded-2xl p-8 sm:p-12 shadow-sm cursor-pointer transition-all flex flex-col justify-between select-none relative group"
          >
            {/* Top row */}
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded text-xs font-medium c-input c2">
                {currentCard.category}
              </span>
              <span className="text-xs text-indigo-400 opacity-80 group-hover:opacity-100 flex items-center gap-1">
                <RotateCcw size={13} /> {isFlipped ? 'Click to see Question' : 'Click to flip'}
              </span>
            </div>

            {/* Front vs Back Content */}
            <div className="my-auto py-6">
              {!isFlipped ? (
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold c1 leading-snug">
                    {currentCard.title}
                  </h2>
                  {currentCard.company?.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs c3 mt-4">
                      <Building2 size={13} />
                      Asked at: {currentCard.company.join(', ')}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                      Answer
                    </span>
                    <button
                      onClick={() => setShowEli5(!showEli5)}
                      className={`text-xs px-2.5 py-1 rounded-md border transition-colors flex items-center gap-1.5 ${
                        showEli5
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'c-input c3 hover:c2 border-transparent'
                      }`}
                    >
                      <Sparkles size={12} /> {showEli5 ? 'Detailed' : 'ELI5'}
                    </button>
                  </div>

                  {showEli5 ? (
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-sm c1 leading-relaxed">
                      {currentCard.eli5Answer ||
                        `Simple breakdown: At its core, ${currentCard.title} solves the challenge by breaking it down into modular, maintainable steps.`}
                    </div>
                  ) : (
                    <p className="c2 text-sm sm:text-base leading-relaxed whitespace-pre-line max-h-60 overflow-y-auto pr-2">
                      {currentCard.answer}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Bottom cue */}
            <div className="flex items-center justify-between text-xs c3 pt-4 border-t c-border">
              <span>{isFlipped ? 'Answer Side' : 'Question Side'}</span>
              {feedback ? (
                <span className="text-emerald-400 font-medium">{feedback}</span>
              ) : (
                <span>Difficulty: {currentCard.difficulty}</span>
              )}
            </div>
          </div>

          {/* Action and Navigation Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-4 py-2.5 c-card border c-border rounded-xl text-sm font-medium c1 hover:c-border-h disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === cards.length - 1}
                className="px-4 py-2.5 c-card border c-border rounded-xl text-sm font-medium c1 hover:c-border-h disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>

            {user && (
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => handleRate('forgot')}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 text-xs font-medium transition-colors"
                >
                  Review Soon
                </button>
                <button
                  onClick={() => handleRate('got_it')}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 text-xs font-medium transition-colors"
                >
                  I Know This
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
