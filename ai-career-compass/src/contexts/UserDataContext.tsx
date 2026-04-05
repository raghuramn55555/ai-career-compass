import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { AnalysisResult, Career } from '@/utils/careerData';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/services/api';

interface RoadmapTask {
  id: string;
  title: string;
  xp: number;
  time: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  youtubeUrl?: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  tasks: RoadmapTask[];
}

interface BadgeData {
  id: string;
  name: string;
  icon: string;
  description: string;
  earned: boolean;
  progress: number;
  requirement: number;
}

interface UserDataContextType {
  points: number;
  level: number;
  streak: number;
  tasksCompleted: number;
  studyHours: number;
  selectedCareer: Career | null;
  setSelectedCareer: (c: Career | null) => void;
  analysisResult: AnalysisResult | null;
  setAnalysisResult: (r: AnalysisResult | null) => void;
  savedCareers: string[];
  toggleSavedCareer: (id: string) => void;
  roadmap: Milestone[];
  toggleTask: (milestoneId: string, taskId: string) => void;
  badges: BadgeData[];
  generateRoadmap: (career: Career) => void;
  focusTimeToday: number;
  addFocusTime: (mins: number) => void;
  clearUserData: () => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

const yt = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

const generateRoadmapForCareer = (career: Career): Milestone[] => {
  const title = career.title;
  const skills = career.skills;
  const cat = career.category;

  // Build subtopics from career skills — each skill becomes a watchable subtopic
  const makeTask = (id: string, skill: string, phase: string, xp: number, time: string, priority: 'high' | 'medium' | 'low') => ({
    id,
    title: `Learn ${skill}`,
    xp,
    time,
    completed: false,
    priority,
    youtubeUrl: yt(`${title} ${skill} tutorial for beginners`),
  });

  return [
    {
      id: 'm1',
      title: `${title} — Foundations`,
      description: `Build core knowledge in ${title.toLowerCase()} fundamentals`,
      tasks: [
        { id: 't1', title: `What is ${title}? Career Overview`, xp: 30, time: '20 min', completed: false, priority: 'high' as const, youtubeUrl: yt(`${title} career overview explained`) },
        makeTask('t2', skills[0] || 'Core Concepts', 'foundation', 60, '1.5 hrs', 'high'),
        makeTask('t3', skills[1] || 'Fundamentals', 'foundation', 60, '1.5 hrs', 'high'),
        { id: 't4', title: `${cat} Industry Overview`, xp: 40, time: '30 min', completed: false, priority: 'medium' as const, youtubeUrl: yt(`${cat} industry overview ${new Date().getFullYear()}`) },
      ],
    },
    {
      id: 'm2',
      title: `${title} — Core Skills`,
      description: `Master the essential skills for ${title.toLowerCase()}`,
      tasks: [
        makeTask('t5', skills[2] || skills[0] || 'Advanced Concepts', 'core', 75, '2 hrs', 'high'),
        makeTask('t6', skills[3] || skills[1] || 'Practical Skills', 'core', 75, '2 hrs', 'high'),
        { id: 't7', title: `${title} Tools & Software`, xp: 60, time: '1 hr', completed: false, priority: 'medium' as const, youtubeUrl: yt(`${title} tools software tutorial`) },
        { id: 't8', title: `${title} Best Practices`, xp: 50, time: '45 min', completed: false, priority: 'medium' as const, youtubeUrl: yt(`${title} best practices tips`) },
      ],
    },
    {
      id: 'm3',
      title: `${title} — Advanced Topics`,
      description: `Develop advanced ${title.toLowerCase()} expertise`,
      tasks: [
        makeTask('t9', skills[4] || skills[0] || 'Advanced Skills', 'advanced', 90, '2.5 hrs', 'high'),
        { id: 't10', title: `${title} Real-World Projects`, xp: 120, time: '3 hrs', completed: false, priority: 'high' as const, youtubeUrl: yt(`${title} project tutorial step by step`) },
        { id: 't11', title: `${title} Case Studies`, xp: 70, time: '1 hr', completed: false, priority: 'medium' as const, youtubeUrl: yt(`${title} case study examples`) },
        { id: 't12', title: `${title} Certification Guide`, xp: 100, time: '1 hr', completed: false, priority: 'low' as const, youtubeUrl: yt(`${title} certification how to get`) },
      ],
    },
    {
      id: 'm4',
      title: `${title} — Career Launch`,
      description: 'Prepare for your career entry and job search',
      tasks: [
        { id: 't13', title: `${title} Resume & Portfolio`, xp: 80, time: '2 hrs', completed: false, priority: 'high' as const, youtubeUrl: yt(`${title} resume portfolio tips`) },
        { id: 't14', title: `${title} Interview Preparation`, xp: 90, time: '2 hrs', completed: false, priority: 'high' as const, youtubeUrl: yt(`${title} interview questions answers`) },
        { id: 't15', title: `${title} Job Market & Salary`, xp: 50, time: '30 min', completed: false, priority: 'medium' as const, youtubeUrl: yt(`${title} job market salary ${new Date().getFullYear()}`) },
        { id: 't16', title: `${title} Networking & LinkedIn`, xp: 60, time: '45 min', completed: false, priority: 'medium' as const, youtubeUrl: yt(`${title} networking linkedin tips`) },
      ],
    },
  ];
};

const defaultBadges: BadgeData[] = [
  { id: 'b1', name: 'First Steps', icon: '🚀', description: 'Complete your first task', earned: false, progress: 0, requirement: 1 },
  { id: 'b2', name: 'Quick Learner', icon: '📚', description: 'Complete 5 tasks', earned: false, progress: 0, requirement: 5 },
  { id: 'b3', name: 'Dedicated', icon: '🔥', description: 'Complete 10 tasks', earned: false, progress: 0, requirement: 10 },
  { id: 'b4', name: 'Knowledge Seeker', icon: '🧠', description: 'Study for 5 hours', earned: false, progress: 0, requirement: 5 },
  { id: 'b5', name: 'Career Explorer', icon: '🧭', description: 'Save 3 careers', earned: false, progress: 0, requirement: 3 },
  { id: 'b6', name: 'Milestone Master', icon: '🏆', description: 'Complete a full milestone', earned: false, progress: 0, requirement: 4 },
  { id: 'b7', name: 'Focus Champion', icon: '⏱️', description: '5 Pomodoro sessions', earned: false, progress: 0, requirement: 5 },
  { id: 'b8', name: 'Path Finder', icon: '🗺️', description: 'Complete career analysis', earned: false, progress: 0, requirement: 1 },
];

export const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const { registerClearUserData } = useAuth();
  const [points, setPoints] = useState(() => Number(localStorage.getItem('points') || '0'));
  const [tasksCompleted, setTasksCompleted] = useState(() => Number(localStorage.getItem('tasksCompleted') || '0'));
  const [studyHours, setStudyHours] = useState(() => Number(localStorage.getItem('studyHours') || '0'));
  const [focusTimeToday, setFocusTimeToday] = useState(0);
  const [streak, setStreak] = useState(() => Number(localStorage.getItem('streak') || '1'));
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(() => {
    const saved = localStorage.getItem('selectedCareer');
    return saved ? JSON.parse(saved) : null;
  });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(() => {
    const saved = localStorage.getItem('analysisResult');
    return saved ? JSON.parse(saved) : null;
  });
  const [savedCareers, setSavedCareers] = useState<string[]>(() => {
    const saved = localStorage.getItem('savedCareers');
    return saved ? JSON.parse(saved) : [];
  });
  const [roadmap, setRoadmap] = useState<Milestone[]>(() => {
    const saved = localStorage.getItem('roadmap');
    return saved ? JSON.parse(saved) : [];
  });
  const [badges, setBadges] = useState<BadgeData[]>(() => {
    const saved = localStorage.getItem('badges');
    return saved ? JSON.parse(saved) : defaultBadges;
  });

  const persist = useCallback((key: string, val: any) => {
    localStorage.setItem(key, JSON.stringify(val));
  }, []);

  // Debounced DB sync — fires 1.5s after last change
  const syncTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const level = Math.floor(points / 200) + 1;

  const updateBadges = useCallback((tc: number, sh: number, sc: string[]) => {
    setBadges(prev => {
      const updated = prev.map(b => {
        let progress = b.progress;
        if (b.id === 'b1' || b.id === 'b2' || b.id === 'b3') progress = tc;
        if (b.id === 'b4') progress = sh;
        if (b.id === 'b5') progress = sc.length;
        return { ...b, progress, earned: progress >= b.requirement };
      });
      persist('badges', updated);
      return updated;
    });
  }, [persist]);

  // Load progress from DB on mount (only if logged in)
  useEffect(() => {
    const loadFromDB = async () => {
      const tokens = localStorage.getItem('tokens');
      if (!tokens) return; // not logged in — skip
      try {
        const data = await authAPI.loadProgress();
        if (data.points !== undefined) {
          setPoints(data.points);         persist('points', data.points);
          setTasksCompleted(data.tasks_completed); persist('tasksCompleted', data.tasks_completed);
          setStudyHours(data.study_hours);  persist('studyHours', data.study_hours);
          setStreak(data.streak);           persist('streak', data.streak);
          if (data.badges?.length) { setBadges(data.badges); persist('badges', data.badges); }
          // Restore completed task IDs into roadmap
          if (data.roadmap_tasks?.length) {
            setRoadmap(prev => {
              const updated = prev.map(m => ({
                ...m,
                tasks: m.tasks.map(t => ({ ...t, completed: data.roadmap_tasks.includes(t.id) }))
              }));
              persist('roadmap', updated);
              return updated;
            });
          }
        }
      } catch { /* not logged in or network error — use localStorage */ }
    };
    loadFromDB();
  }, []);

  // Sync to DB helper (debounced 1.5s)
  const scheduleSyncToDB = useCallback((
    pts: number, tc: number, sh: number, sk: number,
    bdg: any[], rm: any[]
  ) => {
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(async () => {
      try {
        const completedTaskIds = rm.flatMap(m => m.tasks.filter((t: any) => t.completed).map((t: any) => t.id));
        await authAPI.syncProgress({
          points: pts,
          level: Math.floor(pts / 200) + 1,
          streak: sk,
          tasks_completed: tc,
          study_hours: sh,
          badges: bdg,
          roadmap_tasks: completedTaskIds,
        });
      } catch { /* silent fail — localStorage is the fallback */ }
    }, 1500);
  }, []);

  const toggleTask = (milestoneId: string, taskId: string) => {
    setRoadmap(prev => {
      let xpDelta = 0;
      let taskDelta = 0;
      const updated = prev.map(m => {
        if (m.id !== milestoneId) return m;
        return {
          ...m,
          tasks: m.tasks.map(t => {
            if (t.id !== taskId) return t;
            const newCompleted = !t.completed;
            xpDelta = newCompleted ? t.xp : -t.xp;
            taskDelta = newCompleted ? 1 : -1;
            return { ...t, completed: newCompleted };
          }),
        };
      });
      persist('roadmap', updated);

      // Update XP and tasks outside nested setState
      setPoints(p => {
        const np = Math.max(0, p + xpDelta);
        persist('points', np);
        return np;
      });
      setTasksCompleted(tc => {
        const ntc = Math.max(0, tc + taskDelta);
        persist('tasksCompleted', ntc);
        updateBadges(ntc, studyHours, savedCareers);
        // Schedule DB sync with latest values
        setTimeout(() => {
          setBadges(bdg => {
            scheduleSyncToDB(
              Math.max(0, points + xpDelta),
              Math.max(0, tc + taskDelta),
              studyHours, streak, bdg, updated
            );
            return bdg;
          });
        }, 0);
        return ntc;
      });

      return updated;
    });
  };

  const toggleSavedCareer = (id: string) => {
    setSavedCareers(prev => {
      const updated = prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id];
      persist('savedCareers', updated);
      updateBadges(tasksCompleted, studyHours, updated);
      return updated;
    });
  };

  const generateRoadmap = (career: Career) => {
    const rm = generateRoadmapForCareer(career);
    setRoadmap(rm);
    persist('roadmap', rm);
    setSelectedCareer(career);
    persist('selectedCareer', career);
  };

  const addFocusTime = (mins: number) => {
    setFocusTimeToday(p => p + mins);
    setStudyHours(p => {
      const np = p + mins / 60;
      persist('studyHours', np);
      scheduleSyncToDB(points, tasksCompleted, np, streak, badges, roadmap);
      return np;
    });
  };

  const clearUserData = () => {
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    const keys = ['points', 'tasksCompleted', 'studyHours', 'streak', 'selectedCareer', 'analysisResult', 'savedCareers', 'roadmap', 'badges'];
    keys.forEach(k => localStorage.removeItem(k));
    setPoints(0); setTasksCompleted(0); setStudyHours(0); setStreak(1);
    setSelectedCareer(null); setAnalysisResult(null); setSavedCareers([]);
    setRoadmap([]); setBadges(defaultBadges); setFocusTimeToday(0);
  };

  useEffect(() => { registerClearUserData(clearUserData); }, []);

  const wrappedSetAnalysis = (r: AnalysisResult | null) => {
    setAnalysisResult(r);
    persist('analysisResult', r);
    if (r) {
      setBadges(prev => {
        const updated = prev.map(b => b.id === 'b8' ? { ...b, progress: 1, earned: true } : b);
        persist('badges', updated);
        return updated;
      });
    }
  };

  return (
    <UserDataContext.Provider value={{
      points, level, streak, tasksCompleted, studyHours,
      selectedCareer, setSelectedCareer: (c) => { setSelectedCareer(c); persist('selectedCareer', c); },
      analysisResult, setAnalysisResult: wrappedSetAnalysis,
      savedCareers, toggleSavedCareer,
      roadmap, toggleTask, badges,
      generateRoadmap, focusTimeToday, addFocusTime, clearUserData,
    }}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const ctx = useContext(UserDataContext);
  if (!ctx) throw new Error('useUserData must be used within UserDataProvider');
  return ctx;
};
