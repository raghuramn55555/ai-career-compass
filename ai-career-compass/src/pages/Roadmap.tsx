import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, Sparkles, Zap, CheckCircle2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import AIRoadmap from '@/components/AIRoadmap';
import TaskItem from '@/components/TaskItem';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';

const Roadmap = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { selectedCareer, roadmap, toggleTask, points, generateRoadmap } = useUserData();
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [openMilestone, setOpenMilestone] = useState<string | null>(null);
  const [tasksLoading, setTasksLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate('/auth');
    if (!selectedCareer) navigate('/results');
  }, [isAuthenticated, selectedCareer, navigate]);

  // Fetch level-specific tasks from backend whenever level changes
  useEffect(() => {
    if (!selectedCareer) return;
    setTasksLoading(true);
    setOpenMilestone(null);

    // Use the LLM generate_roadmap endpoint which supports level
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/careers/roadmap/generate-by-title/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JSON.parse(localStorage.getItem('tokens') || '{}').access || ''}`,
      },
      body: JSON.stringify({ career_title: selectedCareer.title, level }),
    })
      .then(r => r.json())
      .then((data) => {
        // data.roadmap = [{step_number, title, description}]
        if (Array.isArray(data.roadmap) && data.roadmap.length > 0) {
          // Convert roadmap steps into milestone+task format
          const milestones = data.roadmap.map((step: any, i: number) => ({
            id: `m${i + 1}`,
            title: step.title,
            description: step.description || '',
            tasks: [
              {
                id: `t${i + 1}_1`,
                title: `Study: ${step.title}`,
                xp: level === 'advanced' ? 150 : level === 'intermediate' ? 100 : 50,
                time: level === 'advanced' ? '3 hrs' : level === 'intermediate' ? '2 hrs' : '1 hr',
                completed: false,
                priority: 'high' as const,
                youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${selectedCareer.title} ${step.title} ${level} tutorial`)}`,
              },
              {
                id: `t${i + 1}_2`,
                title: `Practice: ${step.title}`,
                xp: level === 'advanced' ? 100 : level === 'intermediate' ? 75 : 40,
                time: level === 'advanced' ? '2 hrs' : level === 'intermediate' ? '1.5 hrs' : '45 min',
                completed: false,
                priority: 'medium' as const,
                youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${selectedCareer.title} ${step.title} practice exercises`)}`,
              },
            ],
          }));
          generateRoadmap({ ...selectedCareer, _levelMilestones: milestones } as any);
        } else {
          generateRoadmap(selectedCareer);
        }
      })
      .catch(() => generateRoadmap(selectedCareer))
      .finally(() => {
        setTasksLoading(false);
        // Auto-open first milestone after load
        setTimeout(() => {
          setOpenMilestone('m1');
        }, 100);
      });
  }, [level, selectedCareer?.title]);

  if (!selectedCareer) return null;

  const totalTasks = roadmap.reduce((a, m) => a + m.tasks.length, 0);
  const completedTasks = roadmap.reduce((a, m) => a + m.tasks.filter(t => t.completed).length, 0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-10 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <Map className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Career <span className="gradient-text">Roadmap</span></h1>
          </div>
          <p className="text-muted-foreground text-lg mb-6">
            Your personalized learning path to become a {selectedCareer.title}
          </p>

          {/* XP bar */}
          <div className="glass-card rounded-xl p-4 mb-6 flex items-center gap-4 border border-primary/20">
            <Zap className="h-6 w-6 text-accent flex-shrink-0" />
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{points} XP earned</span>
                <span className="text-muted-foreground">{completedTasks}/{totalTasks} tasks done</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <motion.div className="h-full gradient-bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: totalTasks > 0 ? `${(completedTasks / totalTasks) * 100}%` : '0%' }}
                  transition={{ duration: 0.6 }} />
              </div>
            </div>
            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
          </div>

          {/* Level Selector */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <span className="text-sm font-medium">AI Roadmap level:</span>
            <div className="flex gap-2">
              {(['beginner', 'intermediate', 'advanced'] as const).map((l) => (
                <button key={l} onClick={() => setLevel(l)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${level === l ? 'gradient-bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="glass-card rounded-lg p-4 mb-8 border-primary/20 flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold mb-1">AI-Generated Roadmap</p>
              <p className="text-sm text-muted-foreground">
                Complete the tasks below to earn XP and automatically advance through the roadmap milestones.
              </p>
            </div>
          </div>

          {/* AI Roadmap */}
          <AIRoadmap career={selectedCareer.title} level={level} />

          {/* Task milestones — earn XP here */}
          {tasksLoading ? (
            <div className="mt-10 flex items-center justify-center gap-3 py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Generating {level} learning tasks...</span>
            </div>
          ) : roadmap.length > 0 && (
            <div className="mt-10">
              <h2 className="text-2xl font-bold mb-2">Learning Tasks</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Complete tasks to earn XP and unlock the next roadmap milestone.
              </p>
              <div className="space-y-4">
                {roadmap.map((milestone, mIdx) => {
                  const milestoneCompleted = milestone.tasks.every(t => t.completed);
                  const milestoneXP = milestone.tasks.reduce((a, t) => a + t.xp, 0);
                  const earnedXP = milestone.tasks.filter(t => t.completed).reduce((a, t) => a + t.xp, 0);
                  const isOpen = openMilestone === milestone.id;

                  return (
                    <motion.div key={milestone.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: mIdx * 0.05 }}
                      className={`glass-card rounded-xl overflow-hidden border-2 transition-colors ${milestoneCompleted ? 'border-primary/30' : 'border-border'}`}>
                      <button onClick={() => setOpenMilestone(isOpen ? null : milestone.id)}
                        className="w-full flex items-center justify-between p-5 text-left hover:bg-secondary/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${milestoneCompleted ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                            {mIdx + 1}
                          </div>
                          <div>
                            <p className="font-semibold">{milestone.title}</p>
                            <p className="text-xs text-muted-foreground">{earnedXP}/{milestoneXP} XP · {milestone.tasks.filter(t => t.completed).length}/{milestone.tasks.length} tasks</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {milestoneCompleted && <span className="text-xs text-primary font-medium flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Done</span>}
                          {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-5 space-y-2 border-t border-border pt-4">
                          <p className="text-sm text-muted-foreground mb-3">{milestone.description}</p>
                          {milestone.tasks.map(task => (
                            <TaskItem
                              key={task.id}
                              title={task.title}
                              xp={task.xp}
                              time={task.time}
                              completed={task.completed}
                              priority={task.priority}
                              youtubeUrl={(task as any).youtubeUrl}
                              onToggle={() => toggleTask(milestone.id, task.id)}
                            />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No roadmap yet */}
          {roadmap.length === 0 && (
            <div className="mt-10 text-center glass-card rounded-xl p-10">
              <p className="text-muted-foreground mb-4">No tasks yet. Go to Careers and click "View Roadmap" to generate your task list.</p>
              <button onClick={() => navigate('/results')} className="gradient-bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90">
                Browse Careers
              </button>
            </div>
          )}

        </motion.div>
      </div>
    </div>
  );
};

export default Roadmap;
