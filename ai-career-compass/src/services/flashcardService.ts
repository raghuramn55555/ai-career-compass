import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

// API Configuration
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY_FLASHCARDS;
const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Initialize AI clients
const geminiAI = GEMINI_KEY ? new GoogleGenerativeAI(GEMINI_KEY) : null;
const anthropic = ANTHROPIC_KEY ? new Anthropic({ apiKey: ANTHROPIC_KEY, dangerouslyAllowBrowser: true }) : null;
const openai = OPENAI_KEY ? new OpenAI({ apiKey: OPENAI_KEY, dangerouslyAllowBrowser: true }) : null;

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

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  confidence: 'none' | 'hard' | 'medium' | 'easy';
}

export interface FlashcardDeck {
  id: string;
  topic: string;
  cards: Flashcard[];
  lastStudied: string;
  createdAt: string;
}

export class FlashcardService {
  private cache = new Map<string, { data: FlashcardDeck; timestamp: number }>();
  private cacheTTL = 24 * 60 * 60 * 1000; // 24 hours

  private createPrompt(topic: string, count: number = 10): string {
    return `Generate ${count} educational flashcards for the topic: "${topic}".

Format as JSON array with this EXACT structure:
[
  {
    "front": "Question or concept",
    "back": "Answer or explanation",
    "difficulty": "easy|medium|hard"
  }
]

Requirements:
1. Create clear, concise questions and answers
2. Make them educational and progressively challenging
3. Vary difficulty levels
4. Each answer should be 1-3 sentences
5. Focus on key concepts and definitions
6. Make them suitable for studying

Return ONLY the JSON array, no markdown formatting or additional text.`;
  }

  private parseJSON(text: string): any {
    try {
      let cleaned = text.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```\n?/g, '');
      }
      
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      throw new Error('Failed to parse AI response');
    }
  }

  async generateWithGemini(topic: string, count: number = 10): Promise<Flashcard[]> {
    if (!geminiAI) throw new Error('Gemini API key not configured');
    let lastError: Error | null = null;
    for (const modelName of GEMINI_MODELS) {
      try {
        const model = geminiAI.getGenerativeModel({
          model: modelName,
          generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
        });
        const result = await model.generateContent(this.createPrompt(topic, count));
        console.log(`[Gemini Flashcard] Using model: ${modelName}`);
        const cards = this.parseJSON(result.response.text());
        return cards.map((card: any, i: number) => ({
          id: `card-${Date.now()}-${i}`,
          front: card.front,
          back: card.back,
          confidence: 'none' as const,
        }));
      } catch (e: any) {
        const msg = e?.message || '';
        if (msg.includes('429') || msg.toLowerCase().includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
          console.warn(`[Gemini Flashcard] ${modelName} quota exceeded, trying next...`);
          lastError = e;
          continue;
        }
        throw e;
      }
    }
    throw lastError ?? new Error('All Gemini models quota exceeded');
  }

  async generateWithClaude(topic: string, count: number = 10): Promise<Flashcard[]> {
    if (!anthropic) throw new Error('Anthropic API key not configured');
    
    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: this.createPrompt(topic, count)
      }]
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }
    
    const cards = this.parseJSON(content.text);
    return cards.map((card: any, i: number) => ({
      id: `card-${Date.now()}-${i}`,
      front: card.front,
      back: card.back,
      confidence: 'none' as const,
    }));
  }

  async generateWithOpenAI(topic: string, count: number = 10): Promise<Flashcard[]> {
    if (!openai) throw new Error('OpenAI API key not configured');
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{
        role: 'user',
        content: this.createPrompt(topic, count)
      }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }
    
    const cards = this.parseJSON(content);
    return cards.map((card: any, i: number) => ({
      id: `card-${Date.now()}-${i}`,
      front: card.front,
      back: card.back,
      confidence: 'none' as const,
    }));
  }

  async generateFlashcards(topic: string, count: number = 10): Promise<FlashcardDeck> {
    try {
      // Check cache first
      const cacheKey = `${topic}_${count}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        return cached.data;
      }

      // Try APIs in order with fallback
      let lastError: Error | null = null;

      if (geminiAI) {
        try {
          const cards = await this.generateWithGemini(topic, count);
          const deck: FlashcardDeck = {
            id: `deck-${Date.now()}`,
            topic,
            cards,
            lastStudied: new Date().toLocaleDateString(),
            createdAt: new Date().toLocaleDateString(),
          };
          this.cache.set(cacheKey, { data: deck, timestamp: Date.now() });
          return deck;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('Gemini API failed');
          console.warn('Gemini failed, trying Claude:', lastError);
        }
      }

      if (anthropic) {
        try {
          const cards = await this.generateWithClaude(topic, count);
          const deck: FlashcardDeck = {
            id: `deck-${Date.now()}`,
            topic,
            cards,
            lastStudied: new Date().toLocaleDateString(),
            createdAt: new Date().toLocaleDateString(),
          };
          this.cache.set(cacheKey, { data: deck, timestamp: Date.now() });
          return deck;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('Claude API failed');
          console.warn('Claude failed, trying OpenAI:', lastError);
        }
      }

      if (openai) {
        try {
          const cards = await this.generateWithOpenAI(topic, count);
          const deck: FlashcardDeck = {
            id: `deck-${Date.now()}`,
            topic,
            cards,
            lastStudied: new Date().toLocaleDateString(),
            createdAt: new Date().toLocaleDateString(),
          };
          this.cache.set(cacheKey, { data: deck, timestamp: Date.now() });
          return deck;
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
      console.error('Flashcard generation failed:', error);
      throw error;
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
}

export const flashcardService = new FlashcardService();
