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

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [menuOpen]);

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

      {/* Mobile Slide-Over Drawer (Left to Right) */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!menuOpen}
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setMenuOpen(false)}
        />

        {/* Off-canvas panel (Left to Right) */}
        <div
          className={`fixed inset-y-0 left-0 w-72 sm:w-80 max-w-[85vw] c-bg border-r c-border shadow-2xl flex flex-col justify-between p-5 transform transition-transform duration-300 ease-out z-10 ${
            menuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Top Brand & Close Button */}
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b c-border">
              <Link to="/" className="flex items-center gap-2.5" onClick={() => setMenuOpen(false)}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-sm shadow-indigo-500/20">
                  <Compass size={17} className="text-white" />
                </div>
                <span className="font-bold text-base tracking-tight c1">
                  Roadmap<span className="text-indigo-600 dark:text-indigo-400">Prep</span>
                </span>
              </Link>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-1.5 c2 hover:c1 rounded-lg c-input border c-border"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Search */}
            <button
              onClick={() => { setSearchOpen(true); setMenuOpen(false); }}
              className="w-full text-left py-2 px-3 c-input rounded-xl flex items-center justify-between text-xs c2 mb-4 border c-border shadow-sm"
            >
              <span className="flex items-center gap-2">
                <Search size={14} className="text-indigo-500 dark:text-indigo-400" />
                <span>Search knowledge base...</span>
              </span>
              <kbd className="text-[10px] px-1.5 py-0.5 rounded c-card border c-border font-mono">⌘K</kbd>
            </button>

            {/* Navigation Links */}
            <nav className="space-y-1">
              <Link to="/roadmaps" className={navLinkClass('/roadmaps') + ' block py-2'} onClick={() => setMenuOpen(false)}>
                Roadmaps
              </Link>
              <Link to="/questions" className={navLinkClass('/questions') + ' block py-2'} onClick={() => setMenuOpen(false)}>
                Questions
              </Link>
              <Link to="/quiz" className={navLinkClass('/quiz') + ' block py-2'} onClick={() => setMenuOpen(false)}>
                Quiz
              </Link>
              {user && (
                <>
                  <Link to="/review" className={navLinkClass('/review') + ' block py-2'} onClick={() => setMenuOpen(false)}>
                    Review Queue
                  </Link>
                  <Link to="/notes" className={navLinkClass('/notes') + ' block py-2'} onClick={() => setMenuOpen(false)}>
                    Personal Notes
                  </Link>
                  <Link to="/dashboard" className={navLinkClass('/dashboard') + ' block py-2'} onClick={() => setMenuOpen(false)}>
                    Dashboard
                  </Link>
                </>
              )}
              <Link to="/community" className={navLinkClass('/community') + ' block py-2'} onClick={() => setMenuOpen(false)}>
                Community
              </Link>
            </nav>
          </div>

          {/* Bottom Profile / Auth Controls */}
          <div className="pt-4 border-t c-border">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 px-2 py-1">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white uppercase shadow-sm">
                    {user.name ? user.name[0] : 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold c1 truncate">{user.name}</p>
                    <p className="text-[11px] c3 truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="w-full text-left py-2 px-3 text-xs text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl flex items-center gap-2 transition-colors border border-transparent hover:border-rose-500/20"
                >
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  className="w-full text-center py-2 text-xs c2 hover:c1 border c-border rounded-xl font-medium transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="w-full text-center py-2 text-xs btn-primary rounded-xl font-medium shadow-sm"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
    <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
