import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn('Gemini API key not found. AI features will be limited.');
}

const genAI = new GoogleGenerativeAI(API_KEY || '');

// Types
export interface Flashcard {
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

export interface StudyPlanWeek {
  week: number;
  topics: string[];
  goals: string[];
  resources: Array<{
    type: 'video' | 'article' | 'practice' | 'book';
    title: string;
    url?: string;
    description: string;
    duration: string;
  }>;
  milestones: string[];
}

export interface StudyPlan {
  duration_weeks: number;
  weekly_schedule: StudyPlanWeek[];
  assessment_schedule: string[];
  estimated_hours_per_week: number;
}

export interface WeakArea {
  topic: string;
  score: number;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
}

export interface PracticeProblem {
  problem: string;
  hints: string[];
  solution: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimated_time: string;
  type: string;
}

export interface StudyTip {
  category: string;
  tip: string;
  why: string;
  how: string;
}

export interface ProgressInsight {
  overall_assessment: string;
  improvement_trends: string[];
  areas_of_concern: string[];
  predictions: string[];
  recommended_adjustments: string[];
  encouragement: string;
}

// Gemini Service Class
export class GeminiService {
  private model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
    }
  });

  private parseJSON(text: string): any {
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      
      // Try to parse directly
      return JSON.parse(text);
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      console.log('Raw text:', text);
      throw new Error('Failed to parse AI response');
    }
  }

  async generateFlashcards(topic: string, count: number = 10): Promise<Flashcard[]> {
    const prompt = `Generate ${count} educational flashcards for the topic: "${topic}".

Format your response as a JSON array with this exact structure:
[
  {
    "front": "Question or concept to learn",
    "back": "Clear, concise answer or explanation",
    "difficulty": "easy",
    "tags": ["relevant", "tags"]
  }
]

Requirements:
- Make questions clear and specific
- Provide comprehensive but concise answers
- Include a mix of difficulties (easy, medium, hard)
- Add relevant tags for categorization
- Focus on key concepts and practical knowledge
- Make them progressively challenging

Return ONLY the JSON array, no additional text.`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return this.parseJSON(response.text());
  }

  async generateQuiz(
    topic: string, 
    difficulty: 'easy' | 'medium' | 'hard' = 'medium', 
    count: number = 10
  ): Promise<QuizQuestion[]> {
    const prompt = `Generate a ${count}-question multiple choice quiz on: "${topic}".
Difficulty level: ${difficulty}

Format your response as a JSON array with this exact structure:
[
  {
    "question": "Clear question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Detailed explanation of why this answer is correct",
    "difficulty": "${difficulty}",
    "points": 10
  }
]

Requirements:
- Create engaging, educational questions
- Provide 4 plausible options for each question
- correctAnswer is the index (0-3) of the correct option
- Include detailed explanations
- Vary question types (recall, application, analysis)
- Make distractors (wrong answers) plausible but clearly incorrect

Return ONLY the JSON array, no additional text.`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return this.parseJSON(response.text());
  }

  async generateStudyPlan(params: {
    careerGoal: string;
    currentLevel: string;
    hoursPerWeek: number;
    learningStyle: string;
    weakAreas: string[];
  }): Promise<StudyPlan> {
    const prompt = `Create a personalized study plan for someone pursuing: "${params.careerGoal}".

User Profile:
- Current Level: ${params.currentLevel}
- Available Time: ${params.hoursPerWeek} hours per week
- Learning Style: ${params.learningStyle}
- Weak Areas: ${params.weakAreas.join(', ')}

Format your response as JSON with this exact structure:
{
  "duration_weeks": 12,
  "estimated_hours_per_week": ${params.hoursPerWeek},
  "weekly_schedule": [
    {
      "week": 1,
      "topics": ["Topic 1", "Topic 2"],
      "goals": ["Specific goal 1", "Specific goal 2"],
      "resources": [
        {
          "type": "video",
          "title": "Resource title",
          "url": "URL or 'Search for: [query]'",
          "description": "What you'll learn",
          "duration": "30 mins"
        }
      ],
      "milestones": ["Milestone to achieve this week"]
    }
  ],
  "assessment_schedule": ["Week 4", "Week 8", "Week 12"]
}

Requirements:
- Create a realistic, achievable plan
- Progress from fundamentals to advanced topics
- Include diverse resource types
- Set clear, measurable goals
- Schedule regular assessments
- Consider the user's learning style
- Address weak areas early
- Build on previous weeks' knowledge

Return ONLY the JSON object, no additional text.`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return this.parseJSON(response.text());
  }

  async analyzeWeakAreas(performanceData: {
    quizResults: Array<{ topic: string; score: number; totalQuestions: number }>;
    studyTime: Record<string, number>;
    recentActivity: string[];
  }): Promise<WeakArea[]> {
    const prompt = `Analyze this student's performance data and identify weak areas:

Quiz Results:
${performanceData.quizResults.map(r => 
  `- ${r.topic}: ${r.score}/${r.totalQuestions} (${Math.round(r.score/r.totalQuestions*100)}%)`
).join('\n')}

Study Time (hours):
${Object.entries(performanceData.studyTime).map(([topic, hours]) => 
  `- ${topic}: ${hours} hours`
).join('\n')}

Recent Activity:
${performanceData.recentActivity.join('\n')}

Format your response as a JSON array:
[
  {
    "topic": "Topic name",
    "score": 45,
    "recommendation": "Specific actionable recommendation",
    "priority": "high"
  }
]

Requirements:
- Identify topics with scores below 70%
- Consider time spent vs. performance
- Provide specific, actionable recommendations
- Prioritize by urgency (high, medium, low)
- Be encouraging but honest
- Suggest concrete next steps

Return ONLY the JSON array, no additional text.`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return this.parseJSON(response.text());
  }

  async generatePracticeProblems(
    topic: string,
    type: 'coding' | 'math' | 'conceptual' | 'scenario',
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    count: number = 5
  ): Promise<PracticeProblem[]> {
    const prompt = `Generate ${count} ${difficulty} ${type} practice problems for: "${topic}".

Format your response as a JSON array:
[
  {
    "problem": "Clear problem statement",
    "hints": ["Hint 1", "Hint 2", "Hint 3"],
    "solution": "Step-by-step solution with explanations",
    "difficulty": "${difficulty}",
    "estimated_time": "15 mins",
    "type": "${type}"
  }
]

Requirements:
- Create realistic, practical problems
- Provide progressive hints (don't give away the answer)
- Include detailed, educational solutions
- Estimate realistic completion time
- Make problems relevant to real-world scenarios
- Vary complexity within the difficulty level

Return ONLY the JSON array, no additional text.`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return this.parseJSON(response.text());
  }

  async getStudyTips(params: {
    topic: string;
    learningStyle: string;
    availableTime: string;
    challenges: string[];
  }): Promise<StudyTip[]> {
    const prompt = `Provide personalized study tips for:

Topic: ${params.topic}
Learning Style: ${params.learningStyle}
Available Time: ${params.availableTime}
Current Challenges: ${params.challenges.join(', ')}

Format your response as a JSON array:
[
  {
    "category": "Time Management",
    "tip": "Specific tip",
    "why": "Why this works",
    "how": "How to implement it"
  }
]

Requirements:
- Provide 5-7 actionable tips
- Cover different categories (time management, techniques, resources, motivation)
- Tailor to the learning style
- Address specific challenges
- Include implementation steps
- Be practical and realistic

Return ONLY the JSON array, no additional text.`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return this.parseJSON(response.text());
  }

  async analyzeProgress(progressData: {
    totalStudyTime: number;
    topicsStudied: number;
    averageScore: number;
    streak: number;
    goalsCompleted: number;
    totalGoals: number;
    recentTrends: string[];
  }): Promise<ProgressInsight> {
    const prompt = `Analyze this study progress and provide insights:

Total Study Time: ${progressData.totalStudyTime} hours
Topics Studied: ${progressData.topicsStudied}
Average Quiz Score: ${progressData.averageScore}%
Current Streak: ${progressData.streak} days
Goals Completed: ${progressData.goalsCompleted}/${progressData.totalGoals}
Recent Trends: ${progressData.recentTrends.join(', ')}

Format your response as JSON:
{
  "overall_assessment": "Brief overall assessment",
  "improvement_trends": ["Trend 1", "Trend 2"],
  "areas_of_concern": ["Concern 1", "Concern 2"],
  "predictions": ["Prediction 1", "Prediction 2"],
  "recommended_adjustments": ["Adjustment 1", "Adjustment 2"],
  "encouragement": "Motivational message"
}

Requirements:
- Be encouraging but realistic
- Identify specific trends
- Provide actionable recommendations
- Make data-driven predictions
- End with genuine encouragement
- Keep it concise and clear

Return ONLY the JSON object, no additional text.`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return this.parseJSON(response.text());
  }

  async summarizeContent(content: string, maxLength: number = 500): Promise<{
    keyPoints: string[];
    mainConcepts: Array<{ concept: string; explanation: string }>;
    importantTerms: Array<{ term: string; definition: string }>;
    practiceQuestions: string[];
  }> {
    const prompt = `Summarize this content for studying (max ${maxLength} words):

${content.substring(0, 3000)} ${content.length > 3000 ? '...' : ''}

Format your response as JSON:
{
  "keyPoints": ["Point 1", "Point 2", "Point 3"],
  "mainConcepts": [
    {
      "concept": "Concept name",
      "explanation": "Clear explanation"
    }
  ],
  "importantTerms": [
    {
      "term": "Term",
      "definition": "Definition"
    }
  ],
  "practiceQuestions": ["Question 1", "Question 2", "Question 3"]
}

Requirements:
- Extract 5-7 key points
- Identify 3-5 main concepts
- Define 5-10 important terms
- Create 3-5 practice questions
- Keep explanations concise
- Focus on what's most important

Return ONLY the JSON object, no additional text.`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return this.parseJSON(response.text());
  }
}

// Export singleton instance
export const geminiService = new GeminiService();
