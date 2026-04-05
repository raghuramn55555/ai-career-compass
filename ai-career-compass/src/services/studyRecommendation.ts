import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import type { StudyPlan, StudyPlanRequest, StudyPlanResponse } from '@/types/studyPlan';

// API Configuration
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY_STUDY_PLANS;
const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Initialize AI clients - only if keys are valid (not placeholders)
const geminiAI = GEMINI_KEY && !GEMINI_KEY.includes('your_') ? new GoogleGenerativeAI(GEMINI_KEY) : null;
const anthropic = ANTHROPIC_KEY && !ANTHROPIC_KEY.includes('your_') ? new Anthropic({ apiKey: ANTHROPIC_KEY, dangerouslyAllowBrowser: true }) : null;
const openai = OPENAI_KEY && !OPENAI_KEY.includes('your_') ? new OpenAI({ apiKey: OPENAI_KEY, dangerouslyAllowBrowser: true }) : null;

export class StudyRecommendationService {
  private cache = new Map<string, { data: StudyPlan; timestamp: number }>();
  private cacheTTL = 24 * 60 * 60 * 1000; // 24 hours

  private getCacheKey(request: StudyPlanRequest): string {
    return `${request.career}_${request.skill_level}`;
  }

  private getFromCache(key: string): StudyPlan | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.cacheTTL) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private saveToCache(key: string, data: StudyPlan): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private createPrompt(request: StudyPlanRequest): string {
    return `Generate a study plan for: ${request.career} (${request.skill_level} level)

Return ONLY this JSON format, no other text:
{
  "career": "${request.career}",
  "skill_level": "${request.skill_level}",
  "study_plan": [
    {"topic": "Topic 1", "description": "Description", "youtube_link": "https://www.youtube.com/results?search_query=topic1", "estimated_hours": 20, "difficulty": "beginner", "prerequisites": []},
    {"topic": "Topic 2", "description": "Description", "youtube_link": "https://www.youtube.com/results?search_query=topic2", "estimated_hours": 25, "difficulty": "beginner", "prerequisites": ["Topic 1"]},
    {"topic": "Topic 3", "description": "Description", "youtube_link": "https://www.youtube.com/results?search_query=topic3", "estimated_hours": 30, "difficulty": "intermediate", "prerequisites": ["Topic 1", "Topic 2"]},
    {"topic": "Topic 4", "description": "Description", "youtube_link": "https://www.youtube.com/results?search_query=topic4", "estimated_hours": 35, "difficulty": "intermediate", "prerequisites": ["Topic 2", "Topic 3"]},
    {"topic": "Topic 5", "description": "Description", "youtube_link": "https://www.youtube.com/results?search_query=topic5", "estimated_hours": 40, "difficulty": "advanced", "prerequisites": ["Topic 3", "Topic 4"]}
  ],
  "total_estimated_hours": 150
}

Create 5-8 topics. Keep descriptions short (one sentence). Use real topic names for ${request.career}.`;
  }

  private parseJSON(text: string): any {
    try {
      // Remove markdown code blocks if present
      let cleaned = text.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```\n?/g, '');
      }
      
      // Try to find JSON object in the text
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleaned = jsonMatch[0];
      }

      // Fix common JSON issues
      // Replace unescaped newlines in strings
      cleaned = cleaned.replace(/:\s*"([^"]*)\n([^"]*?)"/g, ': "$1 $2"');
      
      // Fix trailing commas
      cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
      
      const parsed = JSON.parse(cleaned);
      return parsed;
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      console.log('Raw text (first 500 chars):', text.substring(0, 500));
      
      // Try a more aggressive cleanup
      try {
        let aggressive = text.trim();
        // Extract just the JSON part
        const start = aggressive.indexOf('{');
        const end = aggressive.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
          aggressive = aggressive.substring(start, end + 1);
          // Remove all newlines within strings
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

  async generateWithGemini(request: StudyPlanRequest): Promise<StudyPlan> {
    if (!geminiAI) throw new Error('Gemini API key not configured');
    
    const model = geminiAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 3000,
      }
    });

    const result = await model.generateContent(this.createPrompt(request));
    const response = await result.response;
    return this.parseJSON(response.text());
  }

  async generateWithClaude(request: StudyPlanRequest): Promise<StudyPlan> {
    if (!anthropic) throw new Error('Anthropic API key not configured');
    
    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 3000,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: this.createPrompt(request)
      }]
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }
    
    return this.parseJSON(content.text);
  }

  async generateWithOpenAI(request: StudyPlanRequest): Promise<StudyPlan> {
    if (!openai) throw new Error('OpenAI API key not configured');
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{
        role: 'user',
        content: this.createPrompt(request)
      }],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }
    
    return this.parseJSON(content);
  }

  async generateStudyPlan(request: StudyPlanRequest): Promise<StudyPlanResponse> {
    try {
      // Check cache first
      const cacheKey = this.getCacheKey(request);
      const cached = this.getFromCache(cacheKey);
      
      if (cached) {
        return {
          success: true,
          data: cached,
          cached: true
        };
      }

      // Try backend first if available
      const storedTokens = localStorage.getItem('tokens');
      const token = storedTokens ? JSON.parse(storedTokens).access : null;
      if (token && API_URL) {
        try {
          const backendResponse = await fetch(`${API_URL}/careers/study-plan/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              career: request.career,
              skill_level: request.skill_level
            })
          });

          if (backendResponse.ok) {
            const data = await backendResponse.json();
            const studyPlan: StudyPlan = {
              id: data.id,
              career: data.career,
              skill_level: data.skill_level,
              study_plan: data.study_plan,
              total_estimated_hours: data.total_estimated_hours,
              created_at: data.created_at,
              user_id: request.user_id
            };
            
            this.saveToCache(cacheKey, studyPlan);
            
            return {
              success: true,
              data: studyPlan,
              cached: false
            };
          }
        } catch (backendError) {
          console.warn('Backend unavailable, falling back to client-side LLM:', backendError);
        }
      }

      // Fallback to client-side LLM with retry logic
      let lastError: Error | null = null;
      
      if (geminiAI) {
        try {
          const studyPlan = await this.generateWithGemini(request);
          this.saveToCache(cacheKey, studyPlan);
          return {
            success: true,
            data: studyPlan,
            cached: false
          };
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('Gemini API failed');
          console.warn('Gemini failed, trying Claude:', lastError);
        }
      }
      
      if (anthropic) {
        try {
          const studyPlan = await this.generateWithClaude(request);
          this.saveToCache(cacheKey, studyPlan);
          return {
            success: true,
            data: studyPlan,
            cached: false
          };
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('Claude API failed');
          console.warn('Claude failed, trying OpenAI:', lastError);
        }
      }
      
      if (openai) {
        try {
          const studyPlan = await this.generateWithOpenAI(request);
          this.saveToCache(cacheKey, studyPlan);
          return {
            success: true,
            data: studyPlan,
            cached: false
          };
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('OpenAI API failed');
          console.warn('OpenAI failed:', lastError);
        }
      }

      // If all APIs failed, throw the last error
      if (lastError) {
        throw lastError;
      }
      
      throw new Error('No AI API keys configured. Please add at least one API key (Gemini, Claude, or OpenAI)');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Study plan generation failed:', errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  getAvailableAPIs(): { gemini: boolean; claude: boolean; openai: boolean } {
    return {
      gemini: !!geminiAI,
      claude: !!anthropic,
      openai: !!openai
    };
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}
