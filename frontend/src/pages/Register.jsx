import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold c1 mb-1.5 tracking-tight">Create your account</h1>
          <p className="c2 text-sm">Start your interview preparation journey</p>
        </div>
        <div className="c-card border c-border rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium c2 mb-1.5">Name</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 c3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 c-input border rounded-xl focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium c2 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 c3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 c-input border rounded-xl focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium c2 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 c3" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2.5 c-input border rounded-xl focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                  placeholder="At least 6 characters"
                  minLength={6}
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 c3 hover:c2">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 btn-primary disabled:opacity-50 font-medium rounded-xl transition-colors text-sm"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <div className="mt-6 text-center text-sm c2">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
