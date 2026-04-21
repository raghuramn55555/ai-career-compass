import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserData } from '@/contexts/UserDataContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

const Chatbot = ({ isOpen, onClose }: ChatbotProps) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { selectedCareer, roadmap } = useUserData();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello! I'm your professional career advisor. I'm here to provide expert guidance on your career journey.

I can assist you with:
• Career development strategies and planning
• Educational pathway recommendations
• Skill development and training advice
• Industry insights and market trends
• Professional networking strategies
• Interview preparation and resume guidance
• Career transition planning
• Work-life balance and professional growth

As you're pursuing a career in ${selectedCareer?.title || 'your chosen field'}, I'm here to provide personalized advice based on your progress and goals.

How may I assist you today?`,
      timestamp: new Date(),
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare context about user's career and progress
      const context = {
        career: selectedCareer?.title || 'Not selected',
        careerDescription: selectedCareer?.category || '',
        totalTasks: roadmap.reduce((acc, m) => acc + m.tasks.length, 0),
        completedTasks: roadmap.reduce((acc, m) => acc + m.tasks.filter(t => t.completed).length, 0),
        currentMilestone: roadmap.find(m => m.tasks.some(t => !t.completed))?.title || 'All milestones completed',
      };

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        console.error('❌ VITE_GEMINI_API_KEY not found in environment variables');
        throw new Error('API key not configured');
      }

      // Models in priority order — best first, falls back on quota errors
      const CHATBOT_MODELS = [
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

      // Analyze user message to determine appropriate response length
      let maxTokens = 1200;
      const userMessageLower = userMessage.content.toLowerCase();
      if (userMessageLower.match(/^(yes|no|ok|thanks|thank you)$/)) maxTokens = 50;
      else if (userMessageLower.match(/\b(what is|what's|define|meaning of)\b/)) maxTokens = 800;
      else if (userMessageLower.match(/\b(explain|describe|how to|guide|steps|detailed|comprehensive|everything about|tell me about)\b/)) maxTokens = 2500;
      else if (userMessageLower.match(/\b(list|compare|difference|pros and cons|advantages|tips)\b/)) maxTokens = 1500;

      const conversationText = `You are a professional career advisor and mentor with extensive experience in career development, education planning, and professional growth. Your role is to provide expert guidance to individuals pursuing their career goals.

CONTEXT:
- Career Goal: ${context.career}
- Career Category: ${context.careerDescription}
- Progress: ${context.completedTasks} out of ${context.totalTasks} tasks completed
- Current Milestone: ${context.currentMilestone}

COMMUNICATION STYLE:
- Professional yet approachable and supportive
- Provide actionable, specific advice
- Structure responses with clear steps or bullet points

Client Question: ${userMessage.content}

Please provide professional career guidance:`;

      // Try models top-down until one works
      let data: any = null;
      let lastChatError: Error | null = null;
      for (const modelName of CHATBOT_MODELS) {
        try {
          const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: conversationText }] }],
              generationConfig: { temperature: 0.7, maxOutputTokens: maxTokens, candidateCount: 1 },
            }),
          });

          if (response.status === 429) {
            console.warn(`[Chatbot] ${modelName} quota exceeded, trying next...`);
            lastChatError = new Error(`429 quota exceeded for ${modelName}`);
            continue;
          }

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
          }

          data = await response.json();
          console.log(`[Chatbot] Using model: ${modelName}`);
          break;
        } catch (e: any) {
          const msg = e?.message || '';
          if (msg.includes('429') || msg.toLowerCase().includes('quota')) {
            lastChatError = e;
            continue;
          }
          throw e;
        }
      }

      if (!data) throw lastChatError ?? new Error('All Gemini models quota exceeded');

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.candidates[0].content.parts[0].text,
        timestamp: new Date(),
      };

      console.log('💬 Assistant response:', assistantMessage.content);
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('❌ Error calling AI:', error);
      
      // Professional fallback response
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I apologize, but I'm experiencing a temporary connection issue with my advisory system. However, I can still provide you with some professional guidance:

Based on your career goal of becoming a ${selectedCareer?.title || 'professional in your field'}, here are some key recommendations:

1. Structured Learning Approach
   • Break down complex topics into manageable learning modules
   • Dedicate consistent time daily (even 30-45 minutes makes a significant difference)
   • Focus on practical application alongside theoretical knowledge

2. Skill Development Strategy
   • Prioritize core competencies required in your field
   • Build a portfolio of projects demonstrating your capabilities
   • Seek feedback from mentors or peers regularly

3. Professional Networking
   • Join industry-specific communities and forums
   • Attend virtual or in-person networking events
   • Connect with professionals on LinkedIn in your target field

4. Continuous Progress Tracking
   • Set measurable short-term and long-term goals
   • Review and adjust your learning path quarterly
   • Celebrate milestones to maintain motivation

Is there a specific aspect of your career development you'd like to discuss in more detail?`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />

          {/* Chatbot Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-4 right-4 w-[400px] h-[600px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] z-50 flex flex-col glass-card rounded-2xl shadow-2xl border border-border overflow-hidden"
          >
            {/* Header */}
            <div className="gradient-bg-primary p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Professional Career Advisor</h3>
                  <p className="text-xs text-white/80">Expert guidance for your career</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user'
                        ? 'gradient-bg-primary'
                        : 'bg-secondary'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div
                    className={`flex-1 rounded-2xl p-3 text-sm ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-12'
                        : 'bg-secondary mr-12'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-60 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 rounded-2xl p-3 bg-secondary mr-12">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="gradient-bg-primary text-primary-foreground p-2 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Powered by Google Gemini
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Chatbot;
