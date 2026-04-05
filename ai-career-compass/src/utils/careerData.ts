// Career Data & Analysis Engine

export interface Career {
  id: string;
  title: string;
  category: string;
  keywords: string[];
  education: string;
  salary: string;
  workStyle: string;
  skills: string[];
  color: string;
  matchPercentage?: number;
  matchReason?: string;
  score?: number;
}

export interface AnalysisResult {
  careers: Career[];
  keywordsDetected: string[];
  categories: { name: string; percentage: number }[];
  personality: string[];
  inputText: string;
}

const CAREERS: Career[] = [
  { id: 'doctor', title: 'Medical Doctor', category: 'Healthcare', keywords: ['health', 'medicine', 'help', 'people', 'science', 'biology', 'care', 'hospital', 'patient', 'anatomy', 'diagnosis'], education: 'Medical Degree (MD)', salary: '$200K–$400K', workStyle: 'Clinical / Hospital', skills: ['Anatomy', 'Diagnosis', 'Patient Care', 'Research', 'Communication'], color: 'hsl(0, 80%, 60%)' },
  { id: 'nurse', title: 'Registered Nurse', category: 'Healthcare', keywords: ['care', 'health', 'people', 'help', 'hospital', 'patient', 'compassion', 'medicine'], education: 'Nursing Degree (BSN)', salary: '$60K–$120K', workStyle: 'Clinical / Hospital', skills: ['Patient Care', 'Medical Knowledge', 'Empathy', 'Critical Thinking'], color: 'hsl(340, 70%, 55%)' },
  { id: 'software-engineer', title: 'Software Engineer', category: 'Tech', keywords: ['code', 'programming', 'technology', 'computer', 'build', 'create', 'software', 'data', 'logic', 'math', 'problem', 'solving', 'web', 'app', 'develop'], education: 'CS Degree / Self-taught', salary: '$90K–$250K', workStyle: 'Remote / Office', skills: ['Programming', 'Problem Solving', 'System Design', 'Algorithms', 'Teamwork'], color: 'hsl(190, 90%, 50%)' },
  { id: 'data-scientist', title: 'Data Scientist', category: 'Tech', keywords: ['data', 'numbers', 'statistics', 'math', 'analysis', 'patterns', 'machine', 'learning', 'ai', 'research', 'predict'], education: 'MS in Data Science / Stats', salary: '$100K–$200K', workStyle: 'Remote / Office', skills: ['Statistics', 'Python', 'Machine Learning', 'Data Visualization', 'SQL'], color: 'hsl(210, 80%, 55%)' },
  { id: 'graphic-designer', title: 'Graphic Designer', category: 'Creative', keywords: ['art', 'design', 'creative', 'visual', 'draw', 'color', 'aesthetic', 'illustration', 'brand', 'digital'], education: 'Design Degree / Portfolio', salary: '$45K–$90K', workStyle: 'Studio / Remote', skills: ['Adobe Suite', 'Typography', 'Color Theory', 'Branding', 'UI Design'], color: 'hsl(280, 70%, 55%)' },
  { id: 'lawyer', title: 'Attorney / Lawyer', category: 'Legal', keywords: ['law', 'justice', 'argue', 'debate', 'rights', 'legal', 'court', 'advocate', 'policy', 'write', 'research'], education: 'Law Degree (JD)', salary: '$80K–$300K', workStyle: 'Office / Court', skills: ['Legal Research', 'Argumentation', 'Writing', 'Critical Analysis', 'Negotiation'], color: 'hsl(30, 70%, 50%)' },
  { id: 'teacher', title: 'Teacher / Educator', category: 'Education', keywords: ['teach', 'education', 'children', 'learn', 'help', 'explain', 'mentor', 'school', 'knowledge', 'inspire'], education: 'Education Degree', salary: '$40K–$80K', workStyle: 'School / Classroom', skills: ['Communication', 'Patience', 'Curriculum Design', 'Mentoring', 'Adaptability'], color: 'hsl(150, 60%, 45%)' },
  { id: 'psychologist', title: 'Psychologist', category: 'Healthcare', keywords: ['mind', 'behavior', 'people', 'help', 'mental', 'psychology', 'therapy', 'emotion', 'counsel', 'listen'], education: 'PhD / PsyD in Psychology', salary: '$70K–$150K', workStyle: 'Office / Clinical', skills: ['Active Listening', 'Empathy', 'Research', 'Assessment', 'Therapy Techniques'], color: 'hsl(260, 60%, 55%)' },
  { id: 'entrepreneur', title: 'Entrepreneur', category: 'Business', keywords: ['business', 'start', 'create', 'lead', 'money', 'market', 'sell', 'innovate', 'risk', 'opportunity', 'manage'], education: 'Business Degree / Self-taught', salary: 'Variable', workStyle: 'Flexible', skills: ['Leadership', 'Marketing', 'Financial Planning', 'Networking', 'Innovation'], color: 'hsl(38, 90%, 55%)' },
  { id: 'architect', title: 'Architect', category: 'Creative', keywords: ['design', 'build', 'structure', 'space', 'art', 'math', 'draw', 'plan', 'construct', 'environment'], education: 'Architecture Degree', salary: '$60K–$130K', workStyle: 'Studio / On-site', skills: ['CAD', 'Spatial Design', 'Math', 'Creativity', 'Project Management'], color: 'hsl(15, 70%, 50%)' },
  { id: 'environmental-scientist', title: 'Environmental Scientist', category: 'Science', keywords: ['nature', 'environment', 'science', 'earth', 'climate', 'ecology', 'research', 'conservation', 'outdoor', 'sustain'], education: 'Environmental Science Degree', salary: '$55K–$100K', workStyle: 'Field / Lab', skills: ['Research', 'Data Analysis', 'Ecology', 'GIS', 'Report Writing'], color: 'hsl(120, 50%, 40%)' },
  { id: 'journalist', title: 'Journalist / Writer', category: 'Creative', keywords: ['write', 'story', 'news', 'communicate', 'investigate', 'report', 'media', 'creative', 'truth', 'express'], education: 'Journalism / English Degree', salary: '$40K–$90K', workStyle: 'Remote / Field', skills: ['Writing', 'Research', 'Interviewing', 'Editing', 'Storytelling'], color: 'hsl(200, 60%, 50%)' },
  { id: 'electrician', title: 'Electrician', category: 'Trades', keywords: ['build', 'hands', 'fix', 'wire', 'electrical', 'install', 'technical', 'practical', 'tools'], education: 'Trade School / Apprenticeship', salary: '$45K–$100K', workStyle: 'On-site / Field', skills: ['Electrical Systems', 'Blueprint Reading', 'Safety', 'Problem Solving', 'Math'], color: 'hsl(50, 70%, 50%)' },
  { id: 'chef', title: 'Chef / Culinary Artist', category: 'Creative', keywords: ['cook', 'food', 'create', 'taste', 'kitchen', 'recipe', 'art', 'nutrition', 'restaurant'], education: 'Culinary School / Experience', salary: '$35K–$90K', workStyle: 'Kitchen / Restaurant', skills: ['Cooking Techniques', 'Menu Planning', 'Food Safety', 'Creativity', 'Team Management'], color: 'hsl(10, 80%, 55%)' },
  { id: 'financial-analyst', title: 'Financial Analyst', category: 'Business', keywords: ['money', 'finance', 'numbers', 'invest', 'market', 'analysis', 'economics', 'business', 'data', 'math'], education: 'Finance / Economics Degree', salary: '$65K–$150K', workStyle: 'Office / Remote', skills: ['Financial Modeling', 'Excel', 'Analytics', 'Research', 'Forecasting'], color: 'hsl(170, 60%, 45%)' },
  { id: 'ux-designer', title: 'UX/UI Designer', category: 'Tech', keywords: ['design', 'user', 'experience', 'interface', 'creative', 'technology', 'app', 'web', 'research', 'visual', 'prototype'], education: 'Design / HCI Degree', salary: '$70K–$150K', workStyle: 'Remote / Studio', skills: ['Figma', 'User Research', 'Prototyping', 'Wireframing', 'Visual Design'], color: 'hsl(300, 60%, 50%)' },
  { id: 'mechanical-engineer', title: 'Mechanical Engineer', category: 'Science', keywords: ['build', 'machine', 'engineering', 'design', 'math', 'physics', 'create', 'technical', 'problem', 'solve'], education: 'ME Degree', salary: '$70K–$130K', workStyle: 'Office / Factory', skills: ['CAD', 'Thermodynamics', 'Materials Science', 'Project Management', 'Math'], color: 'hsl(220, 70%, 50%)' },
  { id: 'social-worker', title: 'Social Worker', category: 'Healthcare', keywords: ['help', 'people', 'community', 'support', 'advocate', 'social', 'care', 'children', 'family', 'counsel'], education: 'Social Work Degree (MSW)', salary: '$40K–$70K', workStyle: 'Office / Community', skills: ['Empathy', 'Case Management', 'Advocacy', 'Communication', 'Crisis Intervention'], color: 'hsl(330, 60%, 50%)' },
  { id: 'cybersecurity', title: 'Cybersecurity Analyst', category: 'Tech', keywords: ['security', 'computer', 'protect', 'hack', 'technology', 'data', 'network', 'digital', 'code', 'solve'], education: 'CS / Cybersecurity Degree', salary: '$80K–$160K', workStyle: 'Remote / Office', skills: ['Network Security', 'Ethical Hacking', 'Risk Assessment', 'Encryption', 'Incident Response'], color: 'hsl(0, 70%, 50%)' },
  { id: 'veterinarian', title: 'Veterinarian', category: 'Healthcare', keywords: ['animal', 'pet', 'care', 'science', 'biology', 'health', 'nature', 'help', 'medicine'], education: 'Veterinary Degree (DVM)', salary: '$80K–$160K', workStyle: 'Clinical / Field', skills: ['Animal Medicine', 'Surgery', 'Diagnosis', 'Compassion', 'Communication'], color: 'hsl(90, 50%, 45%)' },
];

const STOPWORDS = new Set(['i', 'me', 'my', 'a', 'an', 'the', 'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'about', 'also', 'and', 'but', 'or', 'if', 'because', 'until', 'while', 'that', 'this', 'what', 'which', 'who', 'whom', 'these', 'those', 'it', 'its', 'up', 'down', 'really', 'like', 'want', 'love', 'enjoy', 'always', 'never', 'sometimes', 'often', 'get', 'make', 'know', 'think', 'see', 'come', 'go', 'thing', 'things', 'lot', 'much', 'many', 'something']);

const INTEREST_KEYWORDS: Record<string, string[]> = {
  'help': ['help', 'helping', 'assist', 'support', 'volunteer'],
  'people': ['people', 'person', 'social', 'community', 'human', 'society'],
  'children': ['children', 'kids', 'child', 'youth', 'young'],
  'build': ['build', 'building', 'construct', 'make', 'create', 'develop'],
  'create': ['create', 'creative', 'creativity', 'invent', 'imagine', 'innovation'],
  'data': ['data', 'database', 'information', 'analytics'],
  'numbers': ['numbers', 'math', 'mathematics', 'calculate', 'statistics', 'numerical'],
  'nature': ['nature', 'natural', 'outdoor', 'environment', 'earth', 'green', 'sustain', 'sustainability'],
  'science': ['science', 'scientific', 'experiment', 'research', 'laboratory', 'lab', 'discovery'],
  'art': ['art', 'artistic', 'paint', 'draw', 'sketch', 'illustration', 'visual'],
  'design': ['design', 'designer', 'aesthetic', 'layout', 'graphic', 'ui', 'ux'],
  'business': ['business', 'entrepreneur', 'startup', 'company', 'management', 'corporate'],
  'law': ['law', 'legal', 'justice', 'rights', 'court', 'attorney', 'advocate'],
  'teach': ['teach', 'teacher', 'educate', 'education', 'mentor', 'tutor', 'instruct'],
  'technology': ['technology', 'tech', 'computer', 'digital', 'software', 'hardware', 'cyber'],
  'code': ['code', 'coding', 'programming', 'program', 'developer', 'software', 'web', 'app'],
  'medicine': ['medicine', 'medical', 'doctor', 'clinical', 'hospital', 'patient', 'diagnosis'],
  'write': ['write', 'writing', 'writer', 'author', 'story', 'stories', 'blog', 'journal', 'journalism'],
  'music': ['music', 'musical', 'instrument', 'sing', 'song', 'compose'],
  'animal': ['animal', 'animals', 'pet', 'pets', 'veterinary', 'wildlife', 'zoo'],
  'cook': ['cook', 'cooking', 'food', 'recipe', 'chef', 'bake', 'cuisine', 'kitchen'],
  'money': ['money', 'finance', 'financial', 'invest', 'investing', 'economics', 'economy', 'stock'],
  'fix': ['fix', 'repair', 'maintain', 'troubleshoot', 'mechanic'],
  'hands': ['hands', 'handwork', 'craft', 'manual', 'practical', 'physical', 'tools'],
  'health': ['health', 'healthy', 'wellness', 'fitness', 'care', 'therapy'],
  'mind': ['mind', 'psychology', 'mental', 'behavior', 'cognitive', 'brain', 'emotion'],
  'lead': ['lead', 'leader', 'leadership', 'manage', 'manager', 'organize'],
  'solve': ['solve', 'solving', 'problem', 'solution', 'analyze', 'figure'],
  'protect': ['protect', 'security', 'safety', 'defend', 'guard'],
};

const PERSONALITY_MAP: Record<string, string> = {
  'help': 'Empathetic & Caring',
  'people': 'Social & Collaborative',
  'create': 'Creative & Innovative',
  'build': 'Builder & Maker',
  'data': 'Analytical & Detail-Oriented',
  'numbers': 'Logical & Quantitative',
  'nature': 'Environmentally Conscious',
  'science': 'Curious & Investigative',
  'art': 'Artistic & Expressive',
  'lead': 'Natural Leader',
  'solve': 'Problem Solver',
  'write': 'Communicator & Storyteller',
  'technology': 'Tech-Savvy & Forward-Thinking',
  'mind': 'Introspective & Empathetic',
};

export function analyzeInterests(text: string, quizAnswers: Record<string, any> = {}): AnalysisResult {
  const words = text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(w => !STOPWORDS.has(w) && w.length > 2);
  
  // Detect interest keywords
  const detectedCategories: Record<string, number> = {};
  const detectedKeywords: string[] = [];

  for (const word of words) {
    for (const [category, synonyms] of Object.entries(INTEREST_KEYWORDS)) {
      if (synonyms.some(s => word.includes(s) || s.includes(word))) {
        detectedCategories[category] = (detectedCategories[category] || 0) + 1;
        if (!detectedKeywords.includes(word)) detectedKeywords.push(word);
      }
    }
  }

  // Score each career
  const scoredCareers = CAREERS.map(career => {
    let score = 0;
    const matchedKeywords: string[] = [];

    for (const keyword of career.keywords) {
      for (const word of words) {
        if (word.includes(keyword) || keyword.includes(word)) {
          score++;
          if (!matchedKeywords.includes(keyword)) matchedKeywords.push(keyword);
        }
      }
    }

    // No additional quiz boosts needed - interests are enhanced in the text itself

    const maxPossible = Math.max(career.keywords.length, 1);
    const matchPercentage = Math.min(98, Math.round((score / maxPossible) * 100));
    const reason = matchedKeywords.length > 0
      ? `You mentioned ${matchedKeywords.slice(0, 3).join(', ')}`
      : 'Potential match based on your profile';

    return { ...career, matchPercentage, matchReason: reason, score };
  });

  // Filter out careers with very low scores (less than 2 keyword matches)
  const relevantCareers = scoredCareers.filter(career => career.score >= 2);
  
  // If we have relevant matches, use them; otherwise show top 10 careers
  const finalCareers = relevantCareers.length > 0 
    ? relevantCareers 
    : scoredCareers.slice(0, 10);

  finalCareers.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));

  // Category percentages
  const totalDetected = Object.values(detectedCategories).reduce((a, b) => a + b, 0) || 1;
  const categoryMap: Record<string, string> = {
    'health': 'Healthcare', 'medicine': 'Healthcare', 'people': 'Healthcare',
    'technology': 'Technology', 'code': 'Technology', 'data': 'Technology',
    'business': 'Business', 'money': 'Business', 'lead': 'Business',
    'art': 'Creative', 'design': 'Creative', 'create': 'Creative', 'write': 'Creative',
    'science': 'Science', 'nature': 'Science', 'numbers': 'Science',
    'teach': 'Education', 'children': 'Education',
    'law': 'Legal', 'build': 'Trades', 'hands': 'Trades', 'fix': 'Trades',
  };

  const catScores: Record<string, number> = {};
  for (const [cat, count] of Object.entries(detectedCategories)) {
    const mapped = categoryMap[cat] || 'Other';
    catScores[mapped] = (catScores[mapped] || 0) + count;
  }
  const categories = Object.entries(catScores)
    .map(([name, count]) => ({ name, percentage: Math.round((count / totalDetected) * 100) }))
    .sort((a, b) => b.percentage - a.percentage);

  // Personality
  const personality = Object.entries(detectedCategories)
    .filter(([_, count]) => count > 0)
    .map(([cat]) => PERSONALITY_MAP[cat])
    .filter(Boolean)
    .slice(0, 4) as string[];

  return {
    careers: finalCareers,
    keywordsDetected: detectedKeywords,
    categories: categories.length > 0 ? categories : [{ name: 'General', percentage: 100 }],
    personality: personality.length > 0 ? personality : ['Curious Explorer'],
    inputText: text,
  };
}

export function getDefaultCareers(): Career[] {
  return CAREERS.map(c => ({ ...c, matchPercentage: 0, matchReason: 'Complete the quiz to see your match' }));
}

export function getAllCategories(): string[] {
  return [...new Set(CAREERS.map(c => c.category))];
}
