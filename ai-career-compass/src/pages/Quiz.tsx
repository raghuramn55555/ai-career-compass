import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Check } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { analyzeInterests, AnalysisResult } from '@/utils/careerData';
import { careerMatchingService } from '@/services/careerMatchingService';
import { careerAPI } from '@/services/api';
import { useUserData } from '@/contexts/UserDataContext';
import { useAuth } from '@/contexts/AuthContext';

// Quiz Questions
const quizQuestions = [
  {
    id: 1,
    question: "What type of activities do you enjoy most?",
    options: [
      { id: 'helping', label: 'Helping and caring for others', keywords: ['help', 'care', 'support', 'people', 'community', 'compassion'] },
      { id: 'creating', label: 'Creating and designing things', keywords: ['create', 'design', 'art', 'build', 'innovate', 'aesthetic'] },
      { id: 'analyzing', label: 'Analyzing data and solving problems', keywords: ['analyze', 'data', 'solve', 'problem', 'logic', 'math'] },
      { id: 'building', label: 'Building and fixing things with my hands', keywords: ['build', 'fix', 'hands', 'craft', 'tools', 'construct'] },
    ]
  },
  {
    id: 2,
    question: "Which subjects interest you the most?",
    options: [
      { id: 'stem', label: 'Science, Technology, Engineering, Math', keywords: ['science', 'technology', 'engineering', 'math', 'computer', 'code', 'programming'] },
      { id: 'arts', label: 'Arts, Design, and Creative Writing', keywords: ['art', 'design', 'creative', 'write', 'visual', 'aesthetic', 'draw'] },
      { id: 'health', label: 'Biology, Health, and Medicine', keywords: ['biology', 'health', 'medicine', 'medical', 'anatomy', 'care', 'patient'] },
      { id: 'business', label: 'Business, Economics, and Finance', keywords: ['business', 'economics', 'finance', 'money', 'market', 'entrepreneur'] },
      { id: 'social', label: 'Psychology, Sociology, and Education', keywords: ['psychology', 'sociology', 'education', 'teach', 'people', 'behavior'] },
    ]
  },
  {
    id: 3,
    question: "What's your preferred work environment?",
    options: [
      { id: 'office', label: 'Office or corporate setting', keywords: ['office', 'corporate', 'professional', 'business', 'team'] },
      { id: 'outdoor', label: 'Outdoor or field work', keywords: ['outdoor', 'field', 'nature', 'travel', 'adventure'] },
      { id: 'lab', label: 'Laboratory or research facility', keywords: ['lab', 'research', 'experiment', 'science', 'discovery'] },
      { id: 'creative', label: 'Creative studio or workshop', keywords: ['studio', 'creative', 'workshop', 'art', 'design'] },
      { id: 'flexible', label: 'Flexible or remote work', keywords: ['flexible', 'remote', 'independent', 'freelance'] },
    ]
  },
  {
    id: 4,
    question: "How do you prefer to work?",
    options: [
      { id: 'team', label: 'In a team with others', keywords: ['team', 'collaboration', 'group', 'people', 'social'] },
      { id: 'independent', label: 'Independently on my own', keywords: ['independent', 'solo', 'self-directed', 'autonomous'] },
      { id: 'leadership', label: 'Leading and managing others', keywords: ['leadership', 'manage', 'lead', 'organize', 'direct'] },
      { id: 'mixed', label: 'Mix of both team and independent work', keywords: ['balance', 'flexible', 'mixed', 'collaborative'] },
    ]
  },
  {
    id: 5,
    question: "What motivates you the most?",
    options: [
      { id: 'money', label: 'Financial rewards and stability', keywords: ['money', 'salary', 'financial', 'income', 'wealth'] },
      { id: 'impact', label: 'Making a positive impact on society', keywords: ['impact', 'help', 'change', 'social', 'community'] },
      { id: 'creativity', label: 'Creative expression and innovation', keywords: ['creativity', 'innovation', 'express', 'new', 'original'] },
      { id: 'growth', label: 'Personal growth and learning', keywords: ['growth', 'learn', 'develop', 'improve', 'challenge'] },
      { id: 'security', label: 'Job security and stability', keywords: ['security', 'stable', 'reliable', 'consistent', 'safe'] },
    ]
  },
  {
    id: 6,
    question: "What's your educational background or interest?",
    options: [
      { id: 'hs', label: 'High school diploma', keywords: ['high school', 'diploma', 'secondary'] },
      { id: 'trade', label: 'Trade or vocational training', keywords: ['trade', 'vocational', 'technical', 'apprentice'] },
      { id: 'bachelor', label: 'Bachelor\'s degree', keywords: ['bachelor', 'university', 'degree', 'college'] },
      { id: 'master', label: 'Master\'s degree or higher', keywords: ['master', 'phd', 'advanced', 'graduate'] },
      { id: 'selflearn', label: 'Self-taught or online learning', keywords: ['self-taught', 'online', 'learning', 'courses'] },
    ]
  },
];

const Quiz = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { setAnalysisResult } = useUserData();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate('/auth');
  }, [isAuthenticated, navigate]);

  const handleAnswer = (questionIndex: number, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: optionId }));
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    if (Object.keys(answers).length !== quizQuestions.length) {
      alert('Please answer all questions before submitting');
      return;
    }

    setLoading(true);
    
    // Build quiz answers object
    const quizAnswers: Record<string, string> = {};
    quizQuestions.forEach((question, index) => {
      const answerId = answers[index];
      if (answerId) {
        const option = question.options.find(opt => opt.id === answerId);
        if (option) {
          quizAnswers[question.question] = option.label;
        }
      }
    });
    
    try {
      // Use backend LLM service to match careers
      const matchResult = await careerAPI.matchQuiz(quizAnswers);

      if (matchResult.success && matchResult.careers.length > 0) {
        // Convert backend results to AnalysisResult format
        const result: AnalysisResult = {
          careers: matchResult.careers.map((career: any) => ({
            id: career.career.toLowerCase().replace(/\s+/g, '-'),
            title: career.career,
            category: 'Recommended',
            keywords: career.interests || [],
            education: '',
            salary: '',
            workStyle: '',
            skills: career.skills || [],
            color: 'hsl(210, 80%, 55%)',
            matchPercentage: career.matchPercentage,
            matchReason: career.reason
          })),
          keywordsDetected: [],
          categories: [],
          personality: [],
          inputText: ''
        };
        
        setAnalysisResult(result);
      } else {
        throw new Error('No careers matched');
      }
    } catch (error) {
      console.error('Career matching error:', error);
      
      // Fallback to frontend AI service if backend fails
      try {
        const matchResult = await careerMatchingService.matchCareers(quizAnswers);
        
        if (matchResult.success && matchResult.careers.length > 0) {
          const result: AnalysisResult = {
            careers: matchResult.careers.map(career => ({
              id: career.career.toLowerCase().replace(/\s+/g, '-'),
              title: career.career,
              category: 'Recommended',
              keywords: [],
              education: '',
              salary: '',
              workStyle: '',
              skills: career.skills,
              color: 'hsl(210, 80%, 55%)',
              matchPercentage: career.matchPercentage,
              matchReason: career.reason
            })),
            keywordsDetected: [],
            categories: [],
            personality: [],
            inputText: ''
          };
          
          setAnalysisResult(result);
        } else {
          throw new Error('Frontend matching also failed');
        }
      } catch (fallbackError) {
        console.error('All career matching failed:', fallbackError);
        
        // Last resort: rule-based analysis
        let interestText = '';
        const allKeywords: string[] = [];
        
        quizQuestions.forEach((question, index) => {
          const answerId = answers[index];
          if (answerId) {
            const option = question.options.find(opt => opt.id === answerId);
            if (option) {
              interestText += option.label + '. ';
              allKeywords.push(...option.keywords);
            }
          }
        });
        
        interestText += ' ' + allKeywords.join(' ');
        const result = analyzeInterests(interestText, {});
        setAnalysisResult(result);
      }
    }
    
    setLoading(false);
    
    // Navigate to results
    setTimeout(() => {
      navigate('/results', { state: { fromAnalysis: true } });
    }, 500);
  };

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / quizQuestions.length) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Career Discovery <span className="gradient-text">Quiz</span>
            </h1>
            <p className="text-muted-foreground">
              Answer all {quizQuestions.length} questions to find your perfect career match
            </p>
          </motion.div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">
                {answeredCount} of {quizQuestions.length} questions answered
              </span>
              <span className="text-sm font-medium text-primary">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full gradient-bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Questions Grid */}
          <div className="space-y-6 mb-8">
            {quizQuestions.map((question, qIndex) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: qIndex * 0.05 }}
                className="glass-card rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold mb-4">
                  <span className="text-primary font-bold">{qIndex + 1}.</span> {question.question}
                </h3>

                <div className="space-y-2">
                  {question.options.map((option) => {
                    const isSelected = answers[qIndex] === option.id;
                    
                    return (
                      <motion.button
                        key={option.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAnswer(qIndex, option.id)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10 shadow-md'
                            : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            isSelected 
                              ? 'border-primary bg-primary' 
                              : 'border-muted-foreground'
                          }`}>
                            {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                          </div>
                          <span className={`font-medium text-sm ${isSelected ? 'text-primary' : ''}`}>
                            {option.label}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4"
          >
            <button
              onClick={() => navigate('/careers')}
              className="px-6 py-3 rounded-lg border border-border hover:bg-secondary transition-colors"
            >
              Skip
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={answeredCount !== quizQuestions.length || loading}
              className="flex-1 px-6 py-3 rounded-lg gradient-bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  See My Results
                </>
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
