﻿import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Loader2, AlertCircle, CheckCircle2, Lock,
  BookOpen, Code2, FlaskConical, Briefcase, GraduationCap,
  Star, Lightbulb, Target, Rocket, ChevronLeft, ChevronRight,
  PlayCircle, ExternalLink, FileText, Zap
} from 'lucide-react';
import { roadmapService, RoadmapData, RoadmapStep } from '@/services/roadmapService';
import { useUserData } from '@/contexts/UserDataContext';

interface AIRoadmapProps {
  career: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
}

const STEP_ICONS = [BookOpen, Code2, FlaskConical, Briefcase, GraduationCap, Star, Lightbulb, Target, Rocket];

const xpPerStep = (totalSteps: number, level: string) => {
  // Different XP requirements per level — higher levels need more XP per step
  const xpStep = level === 'advanced' ? 150 : level === 'intermediate' ? 100 : 50;
  return Array.from({ length: totalSteps }, (_, i) => i * xpStep);
};

const youtubeUrl = (career: string, stepTitle: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(`${career} ${stepTitle} tutorial`)}`;

const googleUrl = (career: string, stepTitle: string) =>
  `https://www.google.com/search?q=${encodeURIComponent(`${career} ${stepTitle} learn guide`)}`;

const AIRoadmap = ({ career, level = 'beginner' }: AIRoadmapProps) => {
  const navigate = useNavigate();
  const { points, tasksCompleted, studyHours } = useUserData();
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset progress when level changes
  useEffect(() => {
    setActiveIndex(0);
    setRoadmap(null);
  }, [level]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      const result = await roadmapService.generateRoadmap(career, level);
      if (result.success && result.data) {
        setRoadmap(result.data);
      } else {
        setError(result.error || 'Failed to generate roadmap');
      }
      setLoading(false);
    };
    load();
  }, [career, level]);

  useEffect(() => {
    if (!roadmap) return;
    const thresholds = xpPerStep(roadmap.roadmap.length, level);
    let current = 0;
    for (let i = 0; i < thresholds.length; i++) {
      if (points >= thresholds[i]) current = i;
    }
    setActiveIndex(current);
  }, [points, roadmap, level]);

  const scrollTo = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -280 : 280, behavior: 'smooth' });
  };

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  if (error) return (
    <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive rounded-lg">
      <AlertCircle className="h-5 w-5 flex-shrink-0" /><span>{error}</span>
    </div>
  );

  if (!roadmap) return null;

  const steps = roadmap.roadmap;
  const totalSteps = steps.length;
  const thresholds = xpPerStep(totalSteps, level);
  const completedCount = activeIndex;
  const progress = Math.round((completedCount / totalSteps) * 100);
  const nextThreshold = thresholds[activeIndex + 1];
  const xpToNext = nextThreshold !== undefined ? Math.max(0, nextThreshold - points) : 0;
  const activeStep = steps[activeIndex];

  return (
    <div className="w-full">
      {/* Progress header */}
      <div className="mb-8 glass-card rounded-xl p-5 border border-primary/20">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-semibold">Your Journey</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {completedCount} of {totalSteps} milestones reached · {points} XP earned
            </p>
          </div>
          <span className="text-2xl font-bold text-primary">{progress}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-secondary overflow-hidden mb-2">
          <motion.div
            className="h-full gradient-bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.7 }}
          />
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Target className="h-3 w-3" /> {tasksCompleted} tasks done</span>
          <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {studyHours.toFixed(1)}h studied</span>
          {xpToNext > 0 && <span className="text-primary font-medium flex items-center gap-1"><Zap className="h-3 w-3" /> {xpToNext} XP to next milestone ({level})</span>}
          {xpToNext === 0 && completedCount === totalSteps && <span className="text-primary font-medium flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> All milestones reached!</span>}
        </div>
      </div>

      {/* Horizontal road */}
      <div className="relative">
        <button onClick={() => scrollTo('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-background border border-border shadow flex items-center justify-center hover:bg-secondary transition-colors">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button onClick={() => scrollTo('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-background border border-border shadow flex items-center justify-center hover:bg-secondary transition-colors">
          <ChevronRight className="h-4 w-4" />
        </button>

        <div ref={scrollRef} className="overflow-x-auto px-10 pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div className="flex items-end gap-0 min-w-max relative" style={{ paddingTop: '80px', paddingBottom: '20px' }}>
            <div className="absolute left-0 right-0 h-1 bg-border z-0" style={{ top: '80px', transform: 'translateY(-50%)' }} />
            <motion.div
              className="absolute left-0 h-1 gradient-bg-primary z-0"
              style={{ top: '80px', transform: 'translateY(-50%)' }}
              initial={{ width: 0 }}
              animate={{ width: `${(activeIndex / Math.max(totalSteps - 1, 1)) * 100}%` }}
              transition={{ duration: 0.8 }}
            />

            {steps.map((step, index) => {
              const isCompleted = index < activeIndex;
              const isActive = index === activeIndex;
              const isLocked = index > activeIndex;
              const Icon = STEP_ICONS[index % STEP_ICONS.length];
              const isAbove = index % 2 === 0;

              const nodeStyle = isCompleted
                ? 'bg-primary border-primary text-primary-foreground shadow-md shadow-primary/30'
                : isActive
                ? 'bg-yellow-400 border-yellow-500 text-yellow-900 shadow-lg shadow-yellow-400/40'
                : 'bg-muted border-border text-muted-foreground';

              const cardStyle = isCompleted
                ? 'border-primary/20 bg-primary/5 opacity-70'
                : isActive
                ? 'border-yellow-400/60 bg-yellow-400/5 shadow-md'
                : 'border-border/30 bg-muted/10 opacity-35';

              return (
                <div key={step.step_number} className="flex flex-col items-center relative z-10" style={{ width: 210 }}>
                  {isAbove && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }}
                      className={`w-48 rounded-xl border-2 p-3 mb-3 transition-all ${cardStyle}`}>
                      <StepCard step={step} career={career} isCompleted={isCompleted} isActive={isActive} isLocked={isLocked} onStudyTools={() => navigate('/study-tools')} />
                    </motion.div>
                  )}
                  {isAbove && <div className={`w-0.5 h-6 ${isCompleted || isActive ? 'bg-primary/40' : 'bg-border/40'}`} />}

                  {isActive ? (
                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.8 }}
                      className={`h-14 w-14 rounded-full border-4 flex flex-col items-center justify-center flex-shrink-0 ${nodeStyle}`}>
                      <Icon className="h-5 w-5 mb-0.5" />
                      <span className="text-[10px] font-bold leading-none">{String(step.step_number).padStart(2, '0')}</span>
                    </motion.div>
                  ) : (
                    <div className={`h-14 w-14 rounded-full border-4 flex flex-col items-center justify-center flex-shrink-0 ${nodeStyle}`}>
                      {isLocked ? <Lock className="h-5 w-5" /> : <><Icon className="h-5 w-5 mb-0.5" /><span className="text-[10px] font-bold leading-none">{String(step.step_number).padStart(2, '0')}</span></>}
                    </div>
                  )}

                  {!isAbove && <div className={`w-0.5 h-6 ${isCompleted || isActive ? 'bg-primary/40' : 'bg-border/40'}`} />}
                  {!isAbove && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }}
                      className={`w-48 rounded-xl border-2 p-3 mt-3 transition-all ${cardStyle}`}>
                      <StepCard step={step} career={career} isCompleted={isCompleted} isActive={isActive} isLocked={isLocked} onStudyTools={() => navigate('/study-tools')} />
                    </motion.div>
                  )}
                </div>
              );
            })}

            {/* Finish flag */}
            <div className="flex flex-col items-center relative z-10" style={{ width: 80 }}>
              <div className={`h-14 w-14 rounded-full border-4 flex items-center justify-center text-xl flex-shrink-0 ${completedCount === totalSteps ? 'bg-primary border-primary shadow-lg shadow-primary/40' : 'bg-muted border-border opacity-30'}`}>🏁</div>
              <span className="text-xs text-muted-foreground mt-2 font-medium">Finish</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active step â€” full learning panel */}
      {activeStep && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 glass-card rounded-xl border border-yellow-400/30 bg-yellow-400/5 overflow-hidden">
          <div className="p-5 border-b border-yellow-400/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">Currently Learning — Step {activeStep.step_number}</span>
            </div>
            <h3 className="font-bold text-xl mb-1">{activeStep.title}</h3>
            <p className="text-sm text-muted-foreground">{activeStep.description}</p>
          </div>

          <div className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Start Learning</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <a href={youtubeUrl(career, activeStep.title)} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors group">
                <div className="h-9 w-9 rounded-lg bg-red-500 flex items-center justify-center flex-shrink-0">
                  <PlayCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Watch on YouTube</p>
                  <p className="text-xs text-muted-foreground">Video tutorials</p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground ml-auto group-hover:text-foreground" />
              </a>

              <a href={googleUrl(career, activeStep.title)} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors group">
                <div className="h-9 w-9 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Read Articles</p>
                  <p className="text-xs text-muted-foreground">Guides & docs</p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground ml-auto group-hover:text-foreground" />
              </a>

              <button onClick={() => navigate('/study-tools')}
                className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors group text-left">
                <div className="h-9 w-9 rounded-lg gradient-bg-primary flex items-center justify-center flex-shrink-0">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold">AI Study Plan</p>
                  <p className="text-xs text-muted-foreground">Earn XP & advance</p>
                </div>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 rounded-lg px-3 py-2">
              <Zap className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <span>Complete tasks in <button onClick={() => navigate('/study-tools')} className="text-primary font-medium hover:underline">Study Tools</button> to earn XP and automatically unlock the next milestone.</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Completed milestones */}
      {completedCount > 0 && (
        <div className="mt-6">
          <p className="text-sm font-semibold text-muted-foreground mb-3">Completed Milestones</p>
          <div className="space-y-2">
            {steps.slice(0, completedCount).map((step) => (
              <div key={step.step_number} className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/15">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                <p className="text-sm font-medium line-through text-muted-foreground flex-1">{step.title}</p>
                <a href={youtubeUrl(career, step.title)} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1 flex-shrink-0">
                  Review <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StepCard = ({ step, career, isCompleted, isActive, isLocked, onStudyTools }: {
  step: RoadmapStep; career: string;
  isCompleted: boolean; isActive: boolean; isLocked: boolean;
  onStudyTools: () => void;
}) => (
  <>
    <div className="flex items-center gap-1 mb-1.5">
      {isCompleted && <CheckCircle2 className="h-3 w-3 text-primary flex-shrink-0" />}
      {isActive && <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse flex-shrink-0" />}
      {isLocked && <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
      <span className="text-[10px] text-muted-foreground font-medium">Step {step.step_number}</span>
    </div>
    <p className={`text-xs font-semibold leading-snug ${isCompleted ? 'line-through text-muted-foreground' : isLocked ? 'text-muted-foreground' : 'text-foreground'}`}>
      {step.title}
    </p>
    {isActive && (
      <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${career} ${step.title}`)}`}
        target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
        className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-yellow-700 dark:text-yellow-400 hover:underline">
        <PlayCircle className="h-3 w-3" /> Start Learning
      </a>
    )}
    {isLocked && <p className="text-[10px] text-muted-foreground mt-1">Earn more XP to unlock</p>}
    {isCompleted && <p className="text-[10px] text-primary mt-1">✓ Completed</p>}
  </>
);

export default AIRoadmap;



