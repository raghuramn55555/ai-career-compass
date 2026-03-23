import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY_STUDY_PLANS;

const geminiAI = GEMINI_KEY && !GEMINI_KEY.includes('your_') ? new GoogleGenerativeAI(GEMINI_KEY) : null;

export interface RoadmapStep {
  step_number: number;
  title: string;
  description: string;
}

export interface RoadmapData {
  career: string;
  roadmap: RoadmapStep[];
}

export interface RoadmapResponse {
  success: boolean;
  data?: RoadmapData;
  error?: string;
  cached?: boolean;
}

export class RoadmapService {
  private cache = new Map<string, { data: RoadmapData; timestamp: number }>();
  private cacheTTL = 24 * 60 * 60 * 1000;

  private getCacheKey(career: string, level: string): string {
    return `roadmap_${career}_${level}`;
  }

  private createPrompt(career: string, level: string): string {
    return `Generate 6 milestones for ${career} at ${level} level.
Return ONLY valid JSON (no markdown, no extra text):
{"career":"${career}","roadmap":[{"step_number":1,"title":"Learn Basics","description":"Start with fundamentals"},{"step_number":2,"title":"Build Foundation","description":"Master core concepts"},{"step_number":3,"title":"Practice Skills","description":"Apply knowledge through projects"},{"step_number":4,"title":"Advanced Topics","description":"Explore complex areas"},{"step_number":5,"title":"Real Projects","description":"Build portfolio pieces"},{"step_number":6,"title":"Job Ready","description":"Prepare for career"}]}
Replace titles and descriptions for ${career}. Keep descriptions under 15 words. Return ONLY the JSON object.`;
  }

  private parseJSON(text: string): RoadmapData {
    try {
      let cleaned = text.trim();
      
      // Remove markdown code blocks
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```\n?/g, '');
      }

      // Extract JSON object
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleaned = jsonMatch[0];
      }

      // Aggressive JSON cleanup
      cleaned = cleaned
        .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
        .replace(/,\s*,/g, ',') // Remove double commas
        .replace(/\n/g, ' ') // Remove newlines
        .replace(/\r/g, '') // Remove carriage returns
        .replace(/\t/g, ' ') // Replace tabs with spaces
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/"\s*:\s*"/g, '":"') // Normalize key-value spacing
        .replace(/,\s*}/g, '}') // Remove trailing comma before }
        .replace(/,\s*]/g, ']'); // Remove trailing comma before ]

      // Try to parse
      let parsed = JSON.parse(cleaned);
      
      // Validate structure
      if (!parsed.career || !Array.isArray(parsed.roadmap)) {
        throw new Error('Invalid roadmap structure');
      }

      // Ensure all steps have required fields
      parsed.roadmap = parsed.roadmap.map((step: any, index: number) => ({
        step_number: step.step_number || index + 1,
        title: step.title || 'Untitled Step',
        description: step.description || 'No description'
      }));

      return parsed;
    } catch (error) {
      console.error('Failed to parse roadmap JSON:', error);
      console.log('Raw text:', text.substring(0, 1000));
      throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateWithGemini(career: string, level: string): Promise<RoadmapData> {
    if (!geminiAI) throw new Error('Gemini API key not configured');

    const model = geminiAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
        responseMimeType: "application/json",
      }
    });

    let retries = 0;
    const maxRetries = 3;
    
    while (retries < maxRetries) {
      try {
        const result = await model.generateContent(this.createPrompt(career, level));
        const response = await result.response;
        return this.parseJSON(response.text());
      } catch (error: any) {
        // Check if it's a quota error
        if (error?.message?.includes('429') || error?.message?.includes('quota')) {
          retries++;
          if (retries < maxRetries) {
            const waitTime = Math.pow(2, retries) * 1000; // Exponential backoff
            console.warn(`Quota exceeded. Retrying in ${waitTime}ms... (Attempt ${retries}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
        }
        throw error;
      }
    }
    
    throw new Error('Gemini API quota exceeded after retries');
  }

  async generateWithClaude(career: string, level: string): Promise<RoadmapData> {
    throw new Error('Anthropic API credit exhausted. Using Gemini API instead.');
  }

  async generateWithOpenAI(career: string, level: string): Promise<RoadmapData> {
    throw new Error('OpenAI quota exceeded. Using Gemini API instead.');
  }

  async generateRoadmap(career: string, level: string = 'beginner'): Promise<RoadmapResponse> {
    try {
      const cacheKey = this.getCacheKey(career, level);
      const cached = this.cache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        return {
          success: true,
          data: cached.data,
          cached: true
        };
      }

      let lastError: Error | null = null;

      if (geminiAI) {
        try {
          const data = await this.generateWithGemini(career, level);
          this.cache.set(cacheKey, { data, timestamp: Date.now() });
          return { success: true, data, cached: false };
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('Gemini failed');
          console.error('Gemini API error:', lastError);
        }
      }

      if (lastError) throw lastError;
      throw new Error('Gemini API key not configured');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Roadmap generation failed:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const roadmapService = new RoadmapService();
