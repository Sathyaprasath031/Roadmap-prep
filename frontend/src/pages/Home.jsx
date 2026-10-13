import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Code, Database, Brain, Cloud, Layers, BookOpen, CheckCircle, Target, Users } from 'lucide-react';

const features = [
  { icon: Layers, title: 'Structured Roadmaps', desc: 'Step-by-step learning paths for every domain' },
  { icon: BookOpen, title: 'Curated Resources', desc: 'Best free articles, courses, and practice platforms' },
  { icon: Code, title: 'Interview Questions', desc: '300+ frequently asked questions from top companies' },
  { icon: Target, title: 'Track Progress', desc: 'Monitor your preparation and stay motivated' },
];

const domains = [
  { icon: '🎨', title: 'Frontend', slug: 'frontend', color: 'from-indigo-600 to-purple-600' },
  { icon: '⚙️', title: 'Backend', slug: 'backend', color: 'from-emerald-600 to-teal-600' },
  { icon: '🧮', title: 'DSA', slug: 'dsa', color: 'from-amber-600 to-orange-600' },
  { icon: '🚀', title: 'Full Stack', slug: 'fullstack', color: 'from-pink-600 to-rose-600' },
  { icon: '🤖', title: 'ML/AI', slug: 'ml-ai', color: 'from-violet-600 to-purple-600' },
  { icon: '☁️', title: 'DevOps', slug: 'devops', color: 'from-sky-600 to-blue-600' },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="relative">
      {/* Hero */}
      <section className="c-hero relative overflow-hidden">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-500/8 rounded-full blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 c-hero-badge border rounded-full text-sm font-medium mb-8 animate-fade-in">
              <CheckCircle size={16} />
              Trusted by 10,000+ developers
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight c1 mb-6 animate-fade-in animate-delay-100 leading-tight">
              Your Roadmap to
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-500 bg-clip-text text-transparent"> Tech Mastery</span>
            </h1>
            <p className="text-lg sm:text-xl c2 mb-10 max-w-2xl mx-auto animate-fade-in animate-delay-200">
              Follow structured learning paths, practice with 300+ interview questions, and track your progress all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in animate-delay-300">
              <Link
                to="/roadmaps"
                className="px-8 py-3.5 btn-primary font-medium rounded-xl flex items-center justify-center gap-2 text-sm"
              >
                Explore Roadmaps <ArrowRight size={18} />
              </Link>
              <Link
                to="/questions"
                className="px-8 py-3.5 c-btn-outline font-semibold rounded-xl flex items-center justify-center gap-2 text-sm"
              >
                Practice Questions
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Domains */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold c1 mb-4">Choose Your Path</h2>
          <p className="c2">Select a domain to start your interview preparation</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {domains.map((domain, i) => (
            <Link
              key={domain.slug}
              to={`/roadmaps/${domain.slug}`}
              className={`group relative p-6 rounded-2xl c-card border c-border hover:c-border-h transition-all animate-fade-in card-interactive animate-delay-${(i + 1) * 100}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${domain.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`}></div>
              <div className="text-3xl mb-2">{domain.icon}</div>
              <h3 className="text-sm font-semibold c1">{domain.title}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold c1 mb-4">Everything You Need</h2>
          <p className="c2 max-w-xl mx-auto">All the tools and resources to prepare effectively for technical interviews</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="p-6 rounded-2xl c-card border c-border transition-all card-interactive">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-3">
                <f.icon size={20} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-sm font-semibold c1 mb-1.5">{f.title}</h3>
              <p className="c3 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="border-t c-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: '6+', label: 'Domains' },
              { num: '200+', label: 'Resources' },
              { num: '300+', label: 'Questions' },
              { num: '100%', label: 'Free' },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-2xl font-bold c1 mb-0.5">{s.num}</div>
                <div className="c3 text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t c-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center c3 text-xs">
          <p>Built with passion to help developers succeed. Good luck with your interviews!</p>
        </div>
      </footer>
    </div>
  );
}
