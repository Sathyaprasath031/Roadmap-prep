import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FileDown, Award, TrendingUp, BookOpen, Brain } from 'lucide-react';

export default function ProgressReport() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    fetchReport();
  }, [user, navigate, authLoading]);

  const fetchReport = async () => {
    try {
      const res = await axios.get('/api/export/progress-report');
      setReport(res.data);
    } catch (err) {
      console.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#111827',
        scale: 2,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`RoadmapPrep-Report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="animate-pulse c3">Generating report...</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center c3">
        Failed to load report
      </div>
    );
  }

  const { overallStats, roadmapProgress, recentQuizzes } = report;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold c1">Progress Report</h1>
          <p className="c2 mt-1">Your interview preparation summary</p>
        </div>
        <button
          onClick={handleExport}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 c1 font-semibold rounded-xl transition-colors flex items-center gap-2"
        >
          <FileDown size={18} /> Export PDF
        </button>
      </div>

      {/* Report Content (this gets captured as PDF) */}
      <div ref={reportRef} className="c-card border c-border rounded-2xl p-8 space-y-8">
        {/* Header */}
        <div className="text-center border-b c-border pb-6">
          <h2 className="text-2xl font-bold c1 mb-1">RoadmapPrep Progress Report</h2>
          <p className="c2">{report.user.name} · {new Date(report.generatedAt).toLocaleDateString()}</p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 c-input rounded-xl">
            <BookOpen size={20} className="text-indigo-400 mx-auto mb-1" />
            <div className="text-xl font-bold c1">{overallStats.totalRoadmapsStarted}</div>
            <div className="text-xs c3">Roadmaps Started</div>
          </div>
          <div className="text-center p-4 c-input rounded-xl">
            <Award size={20} className="text-green-400 mx-auto mb-1" />
            <div className="text-xl font-bold c1">{overallStats.completedRoadmaps}</div>
            <div className="text-xs c3">Completed</div>
          </div>
          <div className="text-center p-4 c-input rounded-xl">
            <TrendingUp size={20} className="text-amber-400 mx-auto mb-1" />
            <div className="text-xl font-bold c1">{overallStats.overallProgress}%</div>
            <div className="text-xs c3">Overall Progress</div>
          </div>
          <div className="text-center p-4 c-input rounded-xl">
            <Brain size={20} className="text-purple-400 mx-auto mb-1" />
            <div className="text-xl font-bold c1">{overallStats.totalQuizzes}</div>
            <div className="text-xs c3">Quizzes Taken</div>
          </div>
          <div className="text-center p-4 c-input rounded-xl">
            <Award size={20} className="text-indigo-400 mx-auto mb-1" />
            <div className="text-xl font-bold c1">{overallStats.avgScore}%</div>
            <div className="text-xs c3">Avg Quiz Score</div>
          </div>
        </div>

        {/* Roadmap Progress */}
        {roadmapProgress.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold c1 mb-4">Roadmap Progress</h3>
            <div className="space-y-3">
              {roadmapProgress.map((rm) => (
                <div key={rm.title} className="c-input/50 border c-border-h rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{rm.icon}</span>
                      <span className="font-medium c1">{rm.title}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        rm.difficulty === 'Beginner' ? 'bg-green-500/10 text-green-400' :
                        rm.difficulty === 'Intermediate' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>{rm.difficulty}</span>
                    </div>
                    <span className="text-sm c2">{rm.percent}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full ${rm.percent === 100 ? 'bg-green-500' : 'bg-indigo-600'}`}
                      style={{ width: `${rm.percent}%` }}
                    />
                  </div>
                  <div className="text-xs c3">
                    {rm.completedSteps}/{rm.totalSteps} steps completed
                  </div>
                  {rm.completedStepNames.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {rm.completedStepNames.map((s) => (
                        <span key={s} className="px-2 py-0.5 bg-green-500/10 text-green-400 rounded text-xs">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quiz History */}
        {recentQuizzes.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold c1 mb-4">Recent Quizzes</h3>
            <div className="space-y-2">
              {recentQuizzes.map((q, idx) => (
                <div key={idx} className="flex items-center justify-between c-input/50 rounded-lg px-4 py-3">
                  <div>
                    <span className="text-sm font-medium c1">{q.category}</span>
                    <span className="text-xs c3 ml-2">{new Date(q.date).toLocaleDateString()}</span>
                  </div>
                  <span className={`text-sm font-bold ${
                    q.score >= 80 ? 'text-green-400' : q.score >= 60 ? 'text-amber-400' : 'text-red-400'
                  }`}>{q.score}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-4 border-t c-border">
          <p className="text-xs c3">Generated by RoadmapPrep · roadmapprep.com</p>
        </div>
      </div>
    </div>
  );
}
