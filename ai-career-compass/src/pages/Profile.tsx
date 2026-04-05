import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Calendar, Target, Edit2, Save, X, Download, Award, FileText, Briefcase, GraduationCap, Trophy, Zap, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { points, level, tasksCompleted, studyHours, selectedCareer, badges, clearUserData } = useUserData();
  const [editMode, setEditMode] = useState(false);
  const [phone, setPhone] = useState(() => localStorage.getItem('profile_phone') || '');
  const [location, setLocation] = useState(() => localStorage.getItem('profile_location') || '');
  const [editPhone, setEditPhone] = useState(phone);
  const [editLocation, setEditLocation] = useState(location);

  useEffect(() => {
    if (!isAuthenticated) navigate('/auth');
  }, [isAuthenticated, navigate]);

  if (!user) return null;

  const profileCompletion = Math.min(100, Math.round(
    ((user.name ? 20 : 0) + (user.email ? 20 : 0) + (selectedCareer ? 20 : 0) + (phone ? 20 : 0) + (location ? 20 : 0))
  ));

  const saveEdit = () => {
    setPhone(editPhone);
    setLocation(editLocation);
    localStorage.setItem('profile_phone', editPhone);
    localStorage.setItem('profile_location', editLocation);
    setEditMode(false);
  };

  const cancelEdit = () => {
    setEditPhone(phone);
    setEditLocation(location);
    setEditMode(false);
  };

  const downloadResume = () => {
    const skills = selectedCareer?.skills?.join(', ') || 'Critical Thinking, Communication, Problem Solving';
    const content = [
      user.name.toUpperCase(),
      `${user.email}${phone ? ' | ' + phone : ''}${location ? ' | ' + location : ''}`,
      '',
      'CAREER OBJECTIVE',
      `Aspiring ${selectedCareer?.title || 'Professional'} with a passion for ${selectedCareer?.category || 'my field'}.`,
      '',
      'CAREER PATH',
      `Target Role  : ${selectedCareer?.title || 'Not selected'}`,
      `Category     : ${selectedCareer?.category || '-'}`,
      `Education    : ${selectedCareer?.education || '-'}`,
      `Salary Range : ${selectedCareer?.salary || '-'}`,
      '',
      'SKILLS',
      skills,
      '',
      'ACHIEVEMENTS',
      `- Level ${level} on AI Career Compass`,
      `- ${tasksCompleted} learning tasks completed`,
      `- ${studyHours.toFixed(1)} study hours logged`,
      `- ${points} XP earned`,
      '',
      'PROFILE',
      `Joined   : ${user.joinDate}`,
      `Platform : AI Career Compass`,
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${user.name.replace(/\s+/g, '_')}_Resume.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile card */}
            <motion.div className="glass-card rounded-xl p-6" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-start justify-between mb-4">
                <div className="h-20 w-20 rounded-full gradient-bg-primary flex items-center justify-center text-primary-foreground text-3xl font-bold">
                  {user.name[0]}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditMode(true); setEditPhone(phone); setEditLocation(location); }}
                    className="p-2 rounded-lg hover:bg-secondary transition-colors" title="Edit profile">
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button onClick={() => { if (confirm('Reset all profile data?')) clearUserData(); }}
                    className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-destructive" title="Reset data">
                    ↻
                  </button>
                </div>
              </div>
              <h1 className="text-xl font-bold mb-1">{user.name}</h1>
              <p className="text-sm text-muted-foreground mb-4">@{user.name.toLowerCase().replace(/\s+/g, '')}</p>
              {selectedCareer && (
                <div className="flex items-center gap-2 text-sm text-primary mb-4">
                  <Target className="h-4 w-4" /><span>{selectedCareer.title}</span>
                </div>
              )}
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-3"><Mail className="h-4 w-4" /><span>{user.email}</span></div>
                <div className="flex items-center gap-3"><Calendar className="h-4 w-4" /><span>Joined {user.joinDate}</span></div>
              </div>
            </motion.div>

            {/* Personal info */}
            <motion.div className="glass-card rounded-xl p-6" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg">Personal Information</h2>
                {!editMode
                  ? <button onClick={() => { setEditMode(true); setEditPhone(phone); setEditLocation(location); }} className="p-1 rounded-lg hover:bg-secondary">
                      <Edit2 className="h-4 w-4 text-muted-foreground" />
                    </button>
                  : <div className="flex gap-1">
                      <button onClick={saveEdit} className="p-1 rounded-lg hover:bg-secondary text-green-500" title="Save"><Save className="h-4 w-4" /></button>
                      <button onClick={cancelEdit} className="p-1 rounded-lg hover:bg-secondary text-destructive" title="Cancel"><X className="h-4 w-4" /></button>
                    </div>
                }
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-muted-foreground flex items-center gap-2 mb-1"><Mail className="h-4 w-4" />Email</label>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <label className="text-muted-foreground flex items-center gap-2 mb-1"><Phone className="h-4 w-4" />Mobile Number</label>
                  {editMode
                    ? <input value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="Enter mobile number"
                        className="w-full px-3 py-1.5 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    : <p className="font-medium">{phone || <span className="text-muted-foreground text-xs italic">Not added</span>}</p>
                  }
                </div>
                <div>
                  <label className="text-muted-foreground flex items-center gap-2 mb-1"><MapPin className="h-4 w-4" />Location</label>
                  {editMode
                    ? <input value={editLocation} onChange={e => setEditLocation(e.target.value)} placeholder="City, Country"
                        className="w-full px-3 py-1.5 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    : <p className="font-medium">{location || <span className="text-muted-foreground text-xs italic">Not specified</span>}</p>
                  }
                </div>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div className="glass-card rounded-xl p-6" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="font-bold text-lg mb-4">Statistics</h2>
              <div className="space-y-3">
                {[
                  { icon: Zap, label: 'Total XP', value: points, color: 'text-accent' },
                  { icon: CheckCircle, label: 'Tasks Completed', value: tasksCompleted, color: 'text-primary' },
                  { icon: Clock, label: 'Study Hours', value: `${Math.round(studyHours * 10) / 10}h`, color: 'text-primary' },
                  { icon: TrendingUp, label: 'Level', value: level, color: 'text-accent' },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><Icon className={`h-4 w-4 ${color}`} /><span className="text-sm">{label}</span></div>
                    <span className="font-bold">{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile completion */}
            <motion.div className="glass-card rounded-xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-bold mb-1">Complete your profile</h3>
                  <p className="text-sm text-muted-foreground">Add phone, location and select a career to reach 100%</p>
                </div>
                <div className="flex items-center justify-center h-16 w-16 rounded-full border-4 border-primary/20 relative">
                  <svg className="absolute inset-0 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4"
                      className="text-primary" strokeDasharray={`${profileCompletion * 1.76} 176`} />
                  </svg>
                  <span className="text-sm font-bold">{profileCompletion}%</span>
                </div>
              </div>
            </motion.div>

            {/* Badges */}
            <motion.div className="glass-card rounded-xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex items-center gap-2 mb-4"><Trophy className="h-5 w-5 text-accent" /><h2 className="font-bold text-lg">My Badges</h2></div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {badges.map(badge => (
                  <motion.div key={badge.id} whileHover={{ scale: 1.1 }}
                    className={`relative cursor-pointer ${!badge.earned && 'opacity-40'}`} title={badge.description}>
                    <div className={`aspect-square rounded-lg flex items-center justify-center text-4xl ${badge.earned ? 'bg-gradient-to-br from-primary/20 to-accent/20' : 'bg-secondary'}`}>
                      {badge.icon}
                    </div>
                    <p className="text-xs text-center mt-1 font-medium">{badge.name}</p>
                    {badge.earned && (
                      <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Progress */}
            <motion.div className="glass-card rounded-xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center gap-2 mb-4"><TrendingUp className="h-5 w-5 text-primary" /><h2 className="font-bold text-lg">Your Progress</h2></div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium flex items-center gap-1"><Zap className="h-4 w-4 text-accent" />Experience Points</span>
                    <span className="text-sm font-bold text-accent">{points} XP</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-accent to-accent/60" initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (points % 200) / 2)}%` }} transition={{ duration: 0.8 }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{200 - (points % 200)} XP to next level</p>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium flex items-center gap-1"><CheckCircle className="h-4 w-4 text-primary" />Tasks Completed</span>
                    <span className="text-sm font-bold text-primary">{tasksCompleted}</span>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(Math.min(10, Math.max(5, tasksCompleted + 2)))].map((_, i) => (
                      <div key={i} className={`flex-1 h-2 rounded-full ${i < tasksCompleted ? 'bg-primary' : 'bg-secondary'}`} />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium flex items-center gap-1"><Clock className="h-4 w-4 text-blue-500" />Study Hours</span>
                    <span className="text-sm font-bold text-blue-500">{studyHours.toFixed(1)}h</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-blue-500 to-blue-400" initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (studyHours / 50) * 100)}%` }} transition={{ duration: 0.8 }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{Math.max(0, 50 - studyHours).toFixed(1)}h to 50-hour milestone</p>
                </div>
              </div>
            </motion.div>

            {/* Resume */}
            <motion.div className="glass-card rounded-xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="flex items-center gap-2 mb-4"><FileText className="h-5 w-5 text-primary" /><h2 className="font-bold text-lg">My Resume</h2></div>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">AI-Generated Resume</p>
                <p className="text-xs text-muted-foreground mb-4">Based on: {selectedCareer?.title || 'Select a career first'}</p>
                <button onClick={downloadResume}
                  className="gradient-bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 flex items-center gap-2 mx-auto transition-opacity">
                  <Download className="h-4 w-4" /> Download Resume
                </button>
              </div>
            </motion.div>

            {/* Certifications */}
            <motion.div className="glass-card rounded-xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <div className="flex items-center gap-2 mb-4"><Award className="h-5 w-5 text-primary" /><h2 className="font-bold text-lg">My Certifications</h2></div>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Award className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">No certifications yet</p>
                <p className="text-xs text-muted-foreground mb-4">Complete study plans to earn certifications</p>
                <Link to="/study-tools">
                  <button className="border border-border px-6 py-2 rounded-lg text-sm font-medium hover:bg-secondary transition-colors">
                    Explore Study Tools
                  </button>
                </Link>
              </div>
            </motion.div>

            {/* Career path */}
            {selectedCareer && (
              <motion.div className="glass-card rounded-xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <div className="flex items-center gap-2 mb-4"><Briefcase className="h-5 w-5 text-primary" /><h2 className="font-bold text-lg">Career Path</h2></div>
                <div className="bg-secondary rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg gradient-bg-primary flex items-center justify-center text-primary-foreground">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold mb-1">{selectedCareer.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{selectedCareer.category}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Level {level}</span><span>•</span><span>{tasksCompleted} tasks completed</span>
                      </div>
                    </div>
                    <Link to="/roadmap">
                      <button className="px-4 py-2 rounded-lg border border-border hover:bg-background text-sm font-medium transition-colors">
                        View Roadmap
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
