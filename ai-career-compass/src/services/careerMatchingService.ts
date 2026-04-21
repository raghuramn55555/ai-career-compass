import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

// API Configuration
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY_CAREER_ANALYSIS;
const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Initialize AI clients - only if keys are valid (not placeholders)
const geminiAI = GEMINI_KEY && !GEMINI_KEY.includes('your_') ? new GoogleGenerativeAI(GEMINI_KEY) : null;
const anthropic = ANTHROPIC_KEY && !ANTHROPIC_KEY.includes('your_') ? new Anthropic({ apiKey: ANTHROPIC_KEY, dangerouslyAllowBrowser: true }) : null;
const openai = OPENAI_KEY && !OPENAI_KEY.includes('your_') ? new OpenAI({ apiKey: OPENAI_KEY, dangerouslyAllowBrowser: true }) : null;

// Models in priority order — best first, falls back on quota errors
const GEMINI_MODELS = [
  'gemini-2.5-pro',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-flash-latest',
  'gemini-3-flash-preview',
  'gemini-3.1-flash-lite-preview',
  'gemini-flash-lite-latest',
];

export interface CareerMatch {
  career: string;
  matchPercentage: number;
  reason: string;
  skills: string[];
  interests: string[];
}

export interface CareerMatchResponse {
  success: boolean;
  careers: CareerMatch[];
  summary?: string;
  error?: string;
}

export class CareerMatchingService {
  private cache = new Map<string, { data: CareerMatchResponse; timestamp: number }>();
  private cacheTTL = 24 * 60 * 60 * 1000; // 24 hours

  private getCacheKey(quizAnswers: Record<string, any>): string {
    return `career_match_${JSON.stringify(quizAnswers).substring(0, 100)}`;
  }

  private createPrompt(quizAnswers: Record<string, any>): string {
    const answersText = Object.entries(quizAnswers)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    return `Analyze these quiz answers and recommend the top 5 career matches:

${answersText}

Return ONLY this JSON format, no other text:
{
  "careers": [
    {"career": "Career Name", "matchPercentage": 95, "reason": "Why this matches", "skills": ["skill1", "skill2"], "interests": ["interest1", "interest2"]},
    {"career": "Career Name 2", "matchPercentage": 85, "reason": "Why this matches", "skills": ["skill1", "skill2"], "interests": ["interest1", "interest2"]},
    {"career": "Career Name 3", "matchPercentage": 75, "reason": "Why this matches", "skills": ["skill1", "skill2"], "interests": ["interest1", "interest2"]},
    {"career": "Career Name 4", "matchPercentage": 65, "reason": "Why this matches", "skills": ["skill1", "skill2"], "interests": ["interest1", "interest2"]},
    {"career": "Career Name 5", "matchPercentage": 55, "reason": "Why this matches", "skills": ["skill1", "skill2"], "interests": ["interest1", "interest2"]}
  ],
  "summary": "Overall career analysis summary"
}

Make sure matchPercentage is a number between 0-100. Keep reasons short (1-2 sentences).`;
  }

  private parseJSON(text: string): any {
    try {
      let cleaned = text.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```\n?/g, '');
      }

      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleaned = jsonMatch[0];
      }

      // Fix common JSON issues
      cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');

      const parsed = JSON.parse(cleaned);
      return parsed;
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      console.log('Raw text (first 500 chars):', text.substring(0, 500));

      try {
        let aggressive = text.trim();
        const start = aggressive.indexOf('{');
        const end = aggressive.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
          aggressive = aggressive.substring(start, end + 1);
          aggressive = aggressive.replace(/"\s*:\s*"([^"]*?)"/g, (match) => {
            return match.replace(/\n/g, ' ');
          });
          const parsed = JSON.parse(aggressive);
          return parsed;
        }
      } catch (e) {
        console.error('Aggressive cleanup also failed:', e);
      }

      throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async matchWithGemini(quizAnswers: Record<string, any>): Promise<CareerMatchResponse> {
    if (!geminiAI) throw new Error('Gemini API key not configured');
    let lastError: Error | null = null;
    for (const modelName of GEMINI_MODELS) {
      try {
        const model = geminiAI.getGenerativeModel({
          model: modelName,
          generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
        });
        const result = await model.generateContent(this.createPrompt(quizAnswers));
        console.log(`[Gemini Career] Using model: ${modelName}`);
        const parsed = this.parseJSON(result.response.text());
        return { success: true, careers: parsed.careers || [], summary: parsed.summary };
      } catch (e: any) {
        const msg = e?.message || '';
        if (msg.includes('429') || msg.toLowerCase().includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
          console.warn(`[Gemini Career] ${modelName} quota exceeded, trying next...`);
          lastError = e;
          continue;
        }
        throw e;
      }
    }
    throw lastError ?? new Error('All Gemini models quota exceeded');
  }

  async matchWithClaude(quizAnswers: Record<string, any>): Promise<CareerMatchResponse> {
    if (!anthropic) throw new Error('Anthropic API key not configured');

    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: this.createPrompt(quizAnswers)
      }]
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    const parsed = this.parseJSON(content.text);

    return {
      success: true,
      careers: parsed.careers || [],
      summary: parsed.summary
    };
  }

  async matchWithOpenAI(quizAnswers: Record<string, any>): Promise<CareerMatchResponse> {
    if (!openai) throw new Error('OpenAI API key not configured');

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{
        role: 'user',
        content: this.createPrompt(quizAnswers)
      }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const parsed = this.parseJSON(content);

    return {
      success: true,
      careers: parsed.careers || [],
      summary: parsed.summary
    };
  }

  async matchCareers(quizAnswers: Record<string, any>): Promise<CareerMatchResponse> {
    try {
      // Check cache first
      const cacheKey = this.getCacheKey(quizAnswers);
      const cached = this.cache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        return cached.data;
      }

      // Try APIs in order with fallback
      let lastError: Error | null = null;

      if (geminiAI) {
        try {
          const result = await this.matchWithGemini(quizAnswers);
          this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
          return result;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('Gemini API failed');
          console.warn('Gemini failed, trying Claude:', lastError);
        }
      }

      if (anthropic) {
        try {
          const result = await this.matchWithClaude(quizAnswers);
          this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
          return result;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('Claude API failed');
          console.warn('Claude failed, trying OpenAI:', lastError);
        }
      }

      if (openai) {
        try {
          const result = await this.matchWithOpenAI(quizAnswers);
          this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
          return result;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('OpenAI API failed');
          console.warn('OpenAI failed:', lastError);
        }
      }

      // If all APIs failed, throw the last error
      if (lastError) {
        throw lastError;
      }

      throw new Error('No AI API keys configured');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Career matching failed:', errorMessage);

      return {
        success: false,
        careers: [],
        error: errorMessage
      };
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const careerMatchingService = new CareerMatchingService();
