// API Service - Connects frontend to Django backend
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const tokens = localStorage.getItem('tokens');
  const token = tokens ? JSON.parse(tokens).access : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const tokens = localStorage.getItem('tokens');
        const refreshToken = tokens ? JSON.parse(tokens).refresh : null;
        const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });
        
        const existing = JSON.parse(localStorage.getItem('tokens') || '{}');
        localStorage.setItem('tokens', JSON.stringify({ ...existing, access: response.data.access }));
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('tokens');
        localStorage.removeItem('current_user');
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// ============================================
// AUTH APIs
// ============================================

export const authAPI = {
  // Register new user
  register: async (username: string, email: string, password: string) => {
    const response = await api.post('/auth/register/', {
      username,
      email,
      password,
    });
    return response.data;
  },

  // Login user
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login/', {
      email,
      password,
    });
    return response.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get('/auth/profile/');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: any) => {
    const response = await api.put('/auth/profile/', data);
    return response.data;
  },

  // Sync progress to DB
  syncProgress: async (data: {
    points: number; level: number; streak: number;
    tasks_completed: number; study_hours: number;
    badges: any[]; roadmap_tasks: string[];
  }) => {
    const response = await api.post('/auth/sync-progress/', data);
    return response.data;
  },

  // Load progress from DB
  loadProgress: async () => {
    const response = await api.get('/auth/sync-progress/');
    return response.data;
  },
};

// ============================================
// CAREER APIs
// ============================================

export const careerAPI = {
  // Get all careers
  getAllCareers: async () => {
    const response = await api.get('/careers/list/');
    return response.data;
  },

  // Analyze user interests and get matched careers
  analyzeInterests: async (text: string, quizAnswers: any = {}, useLLM: boolean = false) => {
    const response = await api.post('/careers/analyze/', {
      text,
      quiz_answers: quizAnswers,
      use_llm: useLLM,
    });
    return response.data;
  },

  // Get saved careers
  getSavedCareers: async () => {
    const response = await api.get('/careers/saved/');
    return response.data;
  },

  // Save or unsave a career
  toggleSaveCareer: async (careerId: string) => {
    const response = await api.post('/careers/saved/', {
      career_id: careerId,
    });
    return response.data;
  },

  // Generate personalized roadmap
  generateRoadmap: async (careerId: string, useLLM: boolean = false) => {
    const response = await api.post('/careers/roadmap/generate/', {
      career_id: careerId,
      use_llm: useLLM,
    });
    return response.data;
  },

  // Generate winding-road roadmap by career title and level
  generateRoadmapByTitle: async (careerTitle: string, level: string = 'beginner') => {
    const response = await api.post('/careers/roadmap/generate-by-title/', {
      career_title: careerTitle,
      level,
    });
    return response.data;
  },

  // Match careers from quiz answers via backend LLM
  matchQuiz: async (quizAnswers: Record<string, string>) => {
    const response = await api.post('/careers/match-quiz/', { quiz_answers: quizAnswers });
    return response.data;
  },

  // Get analysis history
  getAnalysisHistory: async () => {
    const response = await api.get('/careers/history/');
    return response.data;
  },
};

// ============================================
// DOCUMENT APIs
// ============================================

export const documentAPI = {
  // Summarize an uploaded document
  summarize: async (file: File, mode: 'summary' | 'keyTerms' | 'studyGuide') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', mode);
    const response = await api.post('/documents/summarize/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Ask a question about a document (first message — sends file)
  askWithFile: async (file: File, question: string, history: { role: string; text: string }[]) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('question', question);
    formData.append('history', JSON.stringify(history));
    const response = await api.post('/documents/ask/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Ask a follow-up question using cached text
  askWithText: async (text: string, question: string, history: { role: string; text: string }[]) => {
    const response = await api.post('/documents/ask/', { text, question, history });
    return response.data;
  },
};

export default api;
