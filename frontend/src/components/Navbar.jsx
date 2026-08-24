import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Menu, X, User, LogOut, Sun, Moon } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="c-nav backdrop-blur-md border-b c-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RP</span>
              </div>
              <span className="font-bold text-xl c1 hidden sm:block">RoadmapPrep</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link to="/roadmaps" className="c-nav-link text-sm py-1">
                Roadmaps
              </Link>
              <Link to="/questions" className="c-nav-link text-sm py-1">
                Questions
              </Link>
              <Link to="/quiz" className="c-nav-link text-sm py-1">
                Quiz
              </Link>
              <Link to="/community" className="c-nav-link text-sm py-1">
                Community
              </Link>
              {user && (
                <Link to="/dashboard" className="c-nav-link text-sm py-1">
                  Dashboard
                </Link>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 c2 hover:c1 c-input rounded-lg transition-all hover:scale-110"
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 c-input rounded-full">
                  <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                    <User size={14} className="text-white" />
                  </div>
                  <span className="text-sm c2">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 c2 hover:text-red-400 hover:c-input rounded-lg transition-all hover:scale-110"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm c2 hover:c1 transition-colors font-medium"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 c2 c-input rounded-lg transition-colors"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 c2 hover:c1"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t c-border c-bg">
          <div className="px-4 py-3 space-y-2">
            <Link to="/roadmaps" className="block py-2 c-nav-link" onClick={() => setMenuOpen(false)}>Roadmaps</Link>
            <Link to="/questions" className="block py-2 c-nav-link" onClick={() => setMenuOpen(false)}>Questions</Link>
            <Link to="/quiz" className="block py-2 c-nav-link" onClick={() => setMenuOpen(false)}>Quiz</Link>
            <Link to="/community" className="block py-2 c-nav-link" onClick={() => setMenuOpen(false)}>Community</Link>
            {user && <Link to="/dashboard" className="block py-2 c-nav-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>}
            {user ? (
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block py-2 text-red-400 hover:text-red-300">Logout</button>
            ) : (
              <div className="flex gap-3 pt-2">
                <Link to="/login" className="py-2 c2 hover:c1" onClick={() => setMenuOpen(false)}>Log in</Link>
                <Link to="/register" className="py-2 px-4 bg-indigo-600 text-white rounded-lg" onClick={() => setMenuOpen(false)}>Sign up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
