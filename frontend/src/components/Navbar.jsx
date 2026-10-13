import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Menu, X, User, LogOut, Sun, Moon, Search, Compass } from 'lucide-react';
import { useState, useEffect } from 'react';
import SearchModal from './SearchModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navLinkClass = (path) => `
    px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all
    ${isActive(path) 
      ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold' 
      : 'c2 hover:c1 hover:bg-slate-500/5'
    }
  `;

  return (
    <>
    <nav className="c-nav border-b c-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left Brand + Links */}
          <div className="flex items-center gap-7">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Compass size={17} className="text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight c1 hidden sm:block">
                Roadmap<span className="text-indigo-600 dark:text-indigo-400">Prep</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1.5">
              <Link to="/roadmaps" className={navLinkClass('/roadmaps')}>
                Roadmaps
              </Link>
              <Link to="/questions" className={navLinkClass('/questions')}>
                Questions
              </Link>
              <Link to="/quiz" className={navLinkClass('/quiz')}>
                Quiz
              </Link>
              {user && (
                <>
                  <Link to="/review" className={navLinkClass('/review')}>
                    Review
                  </Link>
                  <Link to="/notes" className={navLinkClass('/notes')}>
                    Notes
                  </Link>
                </>
              )}
              <Link to="/community" className={navLinkClass('/community')}>
                Community
              </Link>
              {user && (
                <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                  Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* Right Controls */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Quick Search Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 c-input c2 hover:c1 rounded-lg text-xs transition-colors border c-border"
              title="Quick Search (Ctrl + K)"
            >
              <Search size={13} className="text-indigo-400" />
              <span className="hidden lg:inline text-xs">Search...</span>
              <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono text-xs">
                ⌘K
              </kbd>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 c2 hover:c1 c-input rounded-lg transition-colors border c-border"
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {user ? (
              <div className="flex items-center gap-2 pl-1.5 border-l c-border">
                <Link 
                  to="/dashboard"
                  className="flex items-center gap-2 px-2.5 py-1.5 c-input rounded-lg border c-border hover:c-border-h transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                    {user.name ? user.name[0] : 'U'}
                  </div>
                  <span className="text-xs font-medium c1 max-w-[100px] truncate">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 c3 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Sign out"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-1.5 border-l c-border">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs c2 hover:c1 font-medium transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs btn-primary rounded-lg font-medium transition-all"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 c2 c-input rounded-lg transition-colors border c-border"
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 c2 hover:c1 rounded-lg"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="md:hidden border-t c-border c-bg px-4 py-3 space-y-1.5 animate-fade-in">
          <button
            onClick={() => { setSearchOpen(true); setMenuOpen(false); }}
            className="w-full text-left py-2 px-3 c-input rounded-lg flex items-center justify-between text-xs c2 mb-2 border c-border"
          >
            <span className="flex items-center gap-2"><Search size={14} className="text-indigo-400" /> Search knowledge base...</span>
            <kbd className="text-[10px] px-1 py-0.5 rounded c-card border c-border font-mono">⌘K</kbd>
          </button>
          <Link to="/roadmaps" className={navLinkClass('/roadmaps') + ' block'} onClick={() => setMenuOpen(false)}>Roadmaps</Link>
          <Link to="/questions" className={navLinkClass('/questions') + ' block'} onClick={() => setMenuOpen(false)}>Questions</Link>
          <Link to="/quiz" className={navLinkClass('/quiz') + ' block'} onClick={() => setMenuOpen(false)}>Quiz</Link>
          {user && (
            <>
              <Link to="/review" className={navLinkClass('/review') + ' block'} onClick={() => setMenuOpen(false)}>Review Queue</Link>
              <Link to="/notes" className={navLinkClass('/notes') + ' block'} onClick={() => setMenuOpen(false)}>Personal Notes</Link>
              <Link to="/dashboard" className={navLinkClass('/dashboard') + ' block'} onClick={() => setMenuOpen(false)}>Dashboard</Link>
            </>
          )}
          <Link to="/community" className={navLinkClass('/community') + ' block'} onClick={() => setMenuOpen(false)}>Community</Link>
          {user ? (
            <div className="pt-2 border-t c-border">
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="w-full text-left py-2 px-3 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg flex items-center gap-2">
                <LogOut size={14} /> Sign out
              </button>
            </div>
          ) : (
            <div className="flex gap-2 pt-2 border-t c-border">
              <Link to="/login" className="flex-1 text-center py-2 text-xs c2 hover:c1 border c-border rounded-lg" onClick={() => setMenuOpen(false)}>Log in</Link>
              <Link to="/register" className="flex-1 text-center py-2 text-xs btn-primary rounded-lg" onClick={() => setMenuOpen(false)}>Sign up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
    <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
