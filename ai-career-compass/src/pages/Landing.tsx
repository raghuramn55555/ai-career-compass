import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Stethoscope, Code, Palette, FlaskConical, GraduationCap, Scale, Briefcase, Wrench, Brain, Target, Map, Zap, Users, BookOpen, Trophy, ArrowRight, Compass, Sparkles, ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

const careerIcons = [
  { icon: Stethoscope, label: 'Healthcare', color: 'text-destructive' },
  { icon: Code, label: 'Technology', color: 'text-primary' },
  { icon: Palette, label: 'Creative', color: 'text-accent' },
  { icon: FlaskConical, label: 'Science', color: 'text-primary' },
  { icon: GraduationCap, label: 'Education', color: 'text-accent' },
  { icon: Scale, label: 'Legal', color: 'text-muted-foreground' },
];

const steps = [
  { icon: '📝', title: 'Tell us your story', desc: 'Describe your interests in your own words.' },
  { icon: '🤖', title: 'AI analyzes', desc: 'We match you with careers that fit your unique profile.' },
  { icon: '🗺️', title: 'Follow your roadmap', desc: 'Get a personalized learning path with gamified tasks.' },
];

const features = [
  { icon: Brain, title: 'AI Analysis', desc: 'Smart keyword extraction and career matching' },
  { icon: Target, title: 'Precision Matching', desc: 'Careers ranked by compatibility percentage' },
  { icon: Map, title: 'Roadmaps', desc: 'Step-by-step learning paths for any career' },
  { icon: Zap, title: 'Gamified Progress', desc: 'XP, badges, and streaks keep you motivated' },
  { icon: Users, title: 'All Fields', desc: 'Medicine to tech, arts to trades – we cover it all' },
  { icon: BookOpen, title: 'Study Tools', desc: 'AI flashcards and document summarization' },
  { icon: Trophy, title: 'Achievements', desc: 'Earn badges as you hit career milestones' },
  { icon: Compass, title: 'Career Switching', desc: 'Explore alternatives that match your profile' },
  { icon: Sparkles, title: 'Personalized', desc: 'Every recommendation tailored to you' },
];

const categories = [
  { name: 'Healthcare', icon: Stethoscope, count: '5+ careers' },
  { name: 'Technology', icon: Code, count: '4+ careers' },
  { name: 'Business', icon: Briefcase, count: '3+ careers' },
  { name: 'Creative', icon: Palette, count: '4+ careers' },
  { name: 'Science', icon: FlaskConical, count: '2+ careers' },
  { name: 'Trades', icon: Wrench, count: '2+ careers' },
  { name: 'Education', icon: GraduationCap, count: '1+ careers' },
  { name: 'Legal', icon: Scale, count: '1+ careers' },
];

const testimonials = [
  { quote: "This platform helped me discover that my love for solving puzzles and working with data pointed me towards data science. I'm now enrolled in a bootcamp!", name: 'Sarah M.', field: 'Data Science' },
  { quote: "I was torn between medicine and psychology. The AI analysis showed me how my interests aligned perfectly with psychiatry. Game changer!", name: 'James T.', field: 'Psychiatry' },
  { quote: "As a career changer from accounting to UX design, the roadmap feature gave me a clear path with actionable steps. Highly recommend!", name: 'Priya K.', field: 'UX Design' },
];

const Landing = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const quizLink = isAuthenticated ? '/quiz' : '/auth';
  const resultsLink = isAuthenticated ? '/results' : '/auth';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="gradient-bg-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 rounded-full bg-accent/15 blur-3xl" />
        </div>
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 text-balance" style={{ color: 'hsl(210, 30%, 92%)' }}>
              AI Career Guidance for{' '}
              <span className="gradient-text">Every Path</span>
            </h1>
            <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto" style={{ color: 'hsl(215, 20%, 65%)' }}>
              Discover your perfect career – from Medicine to Engineering, Arts to Business.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to={quizLink} className="gradient-bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity glow-primary flex items-center gap-2">
                Find Your Path <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to={resultsLink} className="border border-border px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-secondary/50 transition-colors" style={{ color: 'hsl(210, 30%, 85%)' }}>
                Explore Careers
              </Link>
            </div>

            {/* Career icons */}
            <div className="flex items-center justify-center gap-6 md:gap-10 mt-14">
              {careerIcons.map(({ icon: Icon, label, color }, i) => (
                <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }} className="flex flex-col items-center gap-2">
                  <div className="p-3 rounded-xl bg-secondary/30 backdrop-blur-sm">
                    <Icon className={`h-6 w-6 ${color}`} />
                  </div>
                  <span className="text-xs text-muted-foreground hidden sm:block">{label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It <span className="gradient-text">Works</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="glass-card rounded-xl p-6 text-center relative">
              <div className="text-4xl mb-4">{step.icon}</div>
              <h3 className="font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
              {i < 2 && <ChevronRight className="hidden md:block absolute -right-5 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-card py-20 border-y border-border">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Powerful <span className="gradient-text">Features</span></h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="p-5 rounded-xl border border-border hover:border-primary/30 transition-colors">
                <Icon className="h-6 w-6 text-primary mb-3" />
                <h3 className="font-semibold mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Career Categories */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Explore <span className="gradient-text-accent">Career Fields</span></h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {categories.map(({ name, icon: Icon, count }) => (
            <div key={name} onClick={() => navigate(isAuthenticated ? `/results?category=${name}` : '/auth')}
              className="glass-card rounded-xl p-5 text-center hover:border-primary/30 transition-colors cursor-pointer group">
              <Icon className="h-8 w-8 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-sm">{name}</h3>
              <p className="text-xs text-muted-foreground">{count}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-card py-20 border-y border-border">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Success <span className="gradient-text">Stories</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <div key={i} className="glass-card rounded-xl p-6">
                <p className="text-sm text-muted-foreground mb-4 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full gradient-bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.field}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to find your <span className="gradient-text">path</span>?</h2>
        <p className="text-muted-foreground mb-8">Start your AI-powered career journey today.</p>
        <Link to={quizLink} className="gradient-bg-primary text-primary-foreground px-10 py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity inline-flex items-center gap-2 glow-primary">
          Get Started <ArrowRight className="h-5 w-5" />
        </Link>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
