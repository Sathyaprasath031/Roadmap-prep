import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Clock, ExternalLink, CheckCircle, Circle, ChevronDown, ChevronUp, ArrowLeft, Video, BookOpen, FileText, Wrench, GraduationCap, BookmarkPlus, Edit3 } from 'lucide-react';
import StepComments from '../components/StepComments';
import NoteEditor from '../components/NoteEditor';

const typeIcons = {
  article: FileText,
  video: Video,
  course: GraduationCap,
  book: BookOpen,
  practice: Wrench,
  tool: Wrench,
};

const typeColors = {
  article: 'text-blue-400 bg-blue-500/10',
  video: 'text-red-400 bg-red-500/10',
  course: 'text-purple-400 bg-purple-500/10',
  book: 'text-green-400 bg-green-500/10',
  practice: 'text-amber-400 bg-amber-500/10',
  tool: 'text-cyan-400 bg-cyan-500/10',
};

export default function RoadmapDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSteps, setExpandedSteps] = useState({});
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [savingStep, setSavingStep] = useState(null);
  const [noteOpenMap, setNoteOpenMap] = useState({});

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const res = await axios.get(`/api/roadmaps/${slug}`);
        setRoadmap(res.data);
        // Expand first step by default
        if (res.data.steps?.length > 0) {
          setExpandedSteps({ [res.data.steps[0].order]: true });
        }

        // Load user's progress for this roadmap
        if (user && res.data._id) {
          try {
            const progressRes = await axios.get('/api/progress');
            const roadmapProgress = progressRes.data.find(
              (p) => p.roadmap?._id === res.data._id || p.roadmap === res.data._id
            );
            if (roadmapProgress?.completedSteps) {
              setCompletedSteps(new Set(roadmapProgress.completedSteps));
            }
          } catch (progressErr) {
            console.error('Failed to load progress:', progressErr);
          }
        }
      } catch (err) {
        console.error('Failed to load roadmap');
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmap();
  }, [slug, user]);

  const toggleStep = (order) => {
    setExpandedSteps((prev) => ({ ...prev, [order]: !prev[order] }));
  };

  const toggleCompletion = async (stepIndex) => {
    if (!user || !roadmap?._id) return;

    const newSet = new Set(completedSteps);
    const willComplete = !newSet.has(stepIndex);

    // Optimistic update
    if (willComplete) {
      newSet.add(stepIndex);
    } else {
      newSet.delete(stepIndex);
    }
    setCompletedSteps(newSet);

    // Save to backend
    try {
      setSavingStep(stepIndex);
      await axios.post(`/api/progress/${roadmap._id}/step/${stepIndex}`, {
        completed: willComplete,
      });
    } catch (err) {
      console.error('Failed to save progress:', err);
      // Revert on error
      setCompletedSteps((prev) => {
        const reverted = new Set(prev);
        if (willComplete) {
          reverted.delete(stepIndex);
        } else {
          reverted.add(stepIndex);
        }
        return reverted;
      });
    } finally {
      setSavingStep(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="animate-pulse c3">Loading roadmap...</div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="c2">Roadmap not found</p>
        <Link to="/roadmaps" className="text-indigo-400 hover:text-indigo-300 mt-4 inline-block">Back to Roadmaps</Link>
      </div>
    );
  }

  const totalSteps = roadmap.steps?.length || 0;
  const completedCount = completedSteps.size;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/roadmaps" className="inline-flex items-center gap-2 c2 hover:c1 mb-6 transition-colors">
        <ArrowLeft size={18} /> Back to Roadmaps
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-5xl">{roadmap.icon}</span>
          <div>
            <h1 className="text-3xl font-bold c1">{roadmap.title}</h1>
            <div className="flex items-center gap-4 mt-1 text-sm c2">
              <span className="flex items-center gap-1"><Clock size={14} /> {roadmap.estimatedHours} hours</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                roadmap.difficulty === 'Beginner' ? 'bg-green-500/10 text-green-400' :
                roadmap.difficulty === 'Intermediate' ? 'bg-amber-500/10 text-amber-400' :
                'bg-red-500/10 text-red-400'
              }`}>{roadmap.difficulty}</span>
            </div>
          </div>
        </div>
        <p className="c2 text-lg">{roadmap.description}</p>
      </div>

      {/* Progress Bar */}
      <div className="c-card border c-border rounded-xl p-4 mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm c2">Progress</span>
          <span className="text-sm font-medium c1">{completedCount}/{totalSteps} steps ({progressPercent}%)</span>
        </div>
        <div className="w-full c-input rounded-full h-2.5">
          <div
            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {roadmap.steps?.map((step) => {
          const isExpanded = expandedSteps[step.order];
          const isCompleted = completedSteps.has(step.order);

          return (
            <div key={step.order} className={`c-card border rounded-xl overflow-hidden transition-all ${isCompleted ? 'border-green-500/30' : 'c-border'}`}>
              <div
                className="flex items-center gap-4 p-5 cursor-pointer hover:c-input/50 transition-colors"
                onClick={() => toggleStep(step.order)}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); toggleCompletion(step.order); }}
                  className="flex-shrink-0"
                  disabled={savingStep === step.order}
                >
                  {savingStep === step.order ? (
                    <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  ) : isCompleted ? (
                    <CheckCircle size={24} className="text-green-400" />
                  ) : (
                    <Circle size={24} className="c3 hover:c2 transition-colors" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono c3">Step {step.order}</span>
                    {isCompleted && <span className="text-xs text-green-400 font-medium">Completed</span>}
                  </div>
                  <h3 className="font-semibold c1 mt-0.5">{step.title}</h3>
                  {step.description && <p className="text-sm c2 mt-1">{step.description}</p>}
                </div>
                {isExpanded ? <ChevronUp size={20} className="c3" /> : <ChevronDown size={20} className="c3" />}
              </div>

              {isExpanded && (
                <div className="px-5 pb-5 border-t c-border">
                  {/* Topics */}
                  {step.topics?.length > 0 && (
                    <div className="mt-4 mb-4">
                      <h4 className="text-sm font-medium c2 mb-2">Topics to Cover</h4>
                      <div className="flex flex-wrap gap-2">
                        {step.topics.map((topic) => (
                          <span key={topic} className="px-3 py-1 c-input c2 rounded-lg text-sm">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Discussion */}
                  {user && (
                    <StepComments roadmapId={roadmap._id} stepOrder={step.order} />
                  )}

                  {/* Resources */}
                  {step.resources?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium c2 mb-3">Resources</h4>
                      <div className="space-y-2">
                        {step.resources.map((resource, i) => {
                          const Icon = typeIcons[resource.type] || FileText;
                          return (
                            <a
                              key={i}
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 c-input/50 rounded-lg hover:c-input transition-colors group"
                            >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColors[resource.type] || typeColors.article}`}>
                                <Icon size={16} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium c1 truncate">{resource.title}</span>
                                  <span className="text-xs c3 capitalize">{resource.type}</span>
                                  {!resource.free && <span className="text-xs text-amber-400">Paid</span>}
                                </div>
                                {resource.description && (
                                  <p className="text-xs c3 truncate">{resource.description}</p>
                                )}
                              </div>
                              <ExternalLink size={14} className="c3 group-hover:c2 flex-shrink-0" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Personal Notes per Step */}
                  {user && (
                    <div className="mt-4 pt-4 border-t c-border">
                      {noteOpenMap[step.order] ? (
                        <NoteEditor
                          targetType="Step"
                          targetId={`${roadmap._id}-${step.order}`}
                          roadmapId={roadmap._id}
                          stepOrder={step.order}
                          initialTitle={`${roadmap.title} — Step ${step.order}: ${step.title}`}
                          onClose={() => setNoteOpenMap(prev => ({ ...prev, [step.order]: false }))}
                        />
                      ) : (
                        <button
                          onClick={() => setNoteOpenMap(prev => ({ ...prev, [step.order]: true }))}
                          className="text-xs text-indigo-400 hover:underline flex items-center gap-1.5"
                        >
                          <Edit3 size={13} /> Add / View Personal Notes for this step
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
