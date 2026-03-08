# API Integration Guide

This guide shows where and how the Django backend APIs are used in the React frontend.

## 📍 API Usage Map

### 1. Authentication Flow

**Files Involved:**
- `ai-career-compass/src/services/api.ts` - API client
- `ai-career-compass/src/contexts/AuthContext.tsx` - Auth state management
- `ai-career-compass/src/pages/Auth.tsx` - Login/Register UI

**API Endpoints Used:**
```typescript
// Register
POST /api/auth/register/
Body: { username, email, password }
Response: { user, tokens: { access, refresh } }

// Login
POST /api/auth/login/
Body: { email, password }
Response: { access, refresh }

// Get Profile
GET /api/auth/profile/
Headers: { Authorization: "Bearer <token>" }
Response: { id, username, email, points, level, ... }

// Update Profile
PUT /api/auth/profile/
Body: { points, tasks_completed, study_hours, ... }
```

**Where It's Used:**
```
Auth.tsx (Login/Register page)
    ↓
AuthContext.tsx (login/register functions)
    ↓
api.ts (authAPI.login/register)
    ↓
Django Backend (/api/auth/)
```

---

### 2. Career Analysis Flow

**Files Involved:**
- `ai-career-compass/src/pages/Quiz.tsx` - Interest input
- `ai-career-compass/src/pages/Results.tsx` - Display matches
- `ai-career-compass/src/services/api.ts` - API calls

**API Endpoint Used:**
```typescript
// Analyze Interests
POST /api/careers/analyze/
Body: {
  text: "I love coding and solving problems",
  quiz_answers: {
    interestAreas: ["technology", "creative"],
    careerGoal: "solve-problems",
    skillPreference: "analytical"
  },
  use_llm: false  // true for AI-powered analysis
}

Response: {
  careers: [
    {
      career_id: "software-engineer",
      title: "Software Engineer",
      match_percentage: 85,
      match_reason: "You mentioned coding, problem-solving",
      category: "Tech",
      education: "CS Degree",
      salary: "$90K–$250K",
      skills: ["Programming", "Problem Solving"],
      ...
    }
  ],
  keywords_detected: ["coding", "problem", "solving"],
  categories: [
    { name: "Technology", percentage: 60 },
    { name: "Creative", percentage: 40 }
  ],
  personality: ["Analytical", "Tech-Savvy"],
  input_text: "I love coding..."
}
```

**Where It's Used:**
```
Quiz.tsx (User enters interests)
    ↓
handleAnalyze() or handleRefine()
    ↓
careerAPI.analyzeInterests(text, quizAnswers, useLLM)
    ↓
Django Backend (/api/careers/analyze/)
    ↓
    ├─ use_llm=false → CareerMatcher (rule-based)
    └─ use_llm=true → LLMService (OpenAI/Claude)
    ↓
Results.tsx (Display matched careers)
```

---

### 3. Save/Unsave Careers

**Files Involved:**
- `ai-career-compass/src/pages/Results.tsx` - Career cards
- `ai-career-compass/src/pages/Profile.tsx` - Saved careers list
- `ai-career-compass/src/contexts/UserDataContext.tsx` - State management

**API Endpoints Used:**
```typescript
// Get Saved Careers
GET /api/careers/saved/
Response: [
  {
    id: 1,
    career: { career_id, title, category, ... },
    saved_at: "2024-01-15T10:30:00Z"
  }
]

// Toggle Save Career
POST /api/careers/saved/
Body: { career_id: "software-engineer" }
Response: { message: "Career saved" } or { message: "Career unsaved" }
```

**Where It's Used:**
```
Results.tsx (Click bookmark icon)
    ↓
toggleSavedCareer(careerId)
    ↓
careerAPI.toggleSaveCareer(careerId)
    ↓
Django Backend (/api/careers/saved/)
    ↓
Profile.tsx (View saved careers)
```

---

### 4. Roadmap Generation

**Files Involved:**
- `ai-career-compass/src/pages/Results.tsx` - "View Roadmap" button
- `ai-career-compass/src/pages/Roadmap.tsx` - Display roadmap
- `ai-career-compass/src/contexts/UserDataContext.tsx` - Roadmap state

**API Endpoint Used:**
```typescript
// Generate Roadmap
POST /api/careers/roadmap/generate/
Body: {
  career_id: "software-engineer",
  use_llm: false  // true for AI-generated roadmap
}

Response: {
  id: 1,
  career: { career_id, title, ... },
  milestones: [
    {
      id: "m1",
      title: "Tech Foundations",
      description: "Build core knowledge",
      tasks: [
        {
          id: "t1",
          title: "Research Software Engineer career",
          xp: 50,
          time: "1 hour",
          completed: false,
          priority: "high"
        },
        ...
      ]
    },
    ...
  ]
}
```

**Where It's Used:**
```
Results.tsx (Click "View Roadmap")
    ↓
handleViewRoadmap(career)
    ↓
careerAPI.generateRoadmap(career.career_id, useLLM)
    ↓
Django Backend (/api/careers/roadmap/generate/)
    ↓
    ├─ use_llm=false → CareerMatcher.generate_roadmap()
    └─ use_llm=true → LLMService.generate_roadmap()
    ↓
Roadmap.tsx (Display milestones & tasks)
```

---

### 5. Analysis History

**Files Involved:**
- `ai-career-compass/src/pages/Profile.tsx` - History section

**API Endpoint Used:**
```typescript
// Get Analysis History
GET /api/careers/history/
Response: [
  {
    id: 1,
    input_text: "I love coding...",
    keywords_detected: ["coding", "problem"],
    categories: [...],
    personality: ["Analytical"],
    matched_careers: [...],
    created_at: "2024-01-15T10:30:00Z"
  }
]
```

**Where It's Used:**
```
Profile.tsx (Analysis History section)
    ↓
careerAPI.getAnalysisHistory()
    ↓
Django Backend (/api/careers/history/)
```

---

## 🔄 Complete Data Flow Example

### User Journey: From Interest to Roadmap

```
1. User Registration
   Auth.tsx → authAPI.register() → POST /api/auth/register/
   ↓ Store tokens in localStorage
   
2. Interest Analysis
   Quiz.tsx → careerAPI.analyzeInterests() → POST /api/careers/analyze/
   ↓ Backend processes with LLM or rule-based
   ↓ Returns matched careers
   
3. View Results
   Results.tsx → Display filtered careers
   ↓ User clicks bookmark
   ↓ careerAPI.toggleSaveCareer() → POST /api/careers/saved/
   
4. Generate Roadmap
   Results.tsx → careerAPI.generateRoadmap() → POST /api/careers/roadmap/generate/
   ↓ Backend generates personalized milestones
   ↓ Returns roadmap with tasks
   
5. View Roadmap
   Roadmap.tsx → Display milestones
   ↓ User completes tasks
   ↓ authAPI.updateProfile() → PUT /api/auth/profile/
   ↓ Update points, level, tasks_completed
   
6. View Profile
   Profile.tsx → authAPI.getProfile() → GET /api/auth/profile/
   ↓ Display stats, saved careers, history
```

---

## 📝 Implementation Steps

### Step 1: Set Up API Service

**File:** `ai-career-compass/src/services/api.ts`

Already created! This file contains:
- Axios instance with base URL
- Token management (add to headers)
- Token refresh on 401
- All API functions (authAPI, careerAPI)

### Step 2: Update AuthContext

**File:** `ai-career-compass/src/contexts/AuthContext.tsx`

Replace with `AuthContext.API.tsx` to:
- Call backend for login/register
- Store JWT tokens
- Load user profile from API
- Handle token refresh

### Step 3: Update Quiz Page

**File:** `ai-career-compass/src/pages/Quiz.tsx`

Key changes:
```typescript
// Import API
import { careerAPI } from '@/services/api';

// In handleAnalyze()
const response = await careerAPI.analyzeInterests(text, {}, useLLM);
setAnalysisResult(response);

// In handleRefine()
const response = await careerAPI.analyzeInterests(
  enhancedText, 
  quizAnswers,
  useLLM
);
```

### Step 4: Update Results Page

**File:** `ai-career-compass/src/pages/Results.tsx`

Key changes:
```typescript
// Load saved careers from API
useEffect(() => {
  const loadSavedCareers = async () => {
    const saved = await careerAPI.getSavedCareers();
    setSavedCareerIds(saved.map(s => s.career.career_id));
  };
  loadSavedCareers();
}, []);

// Toggle save
const handleToggleSave = async (careerId: string) => {
  await careerAPI.toggleSaveCareer(careerId);
  // Update local state
};

// Generate roadmap
const handleViewRoadmap = async (career: Career) => {
  const roadmap = await careerAPI.generateRoadmap(career.career_id, useLLM);
  navigate('/roadmap', { state: { roadmap } });
};
```

### Step 5: Update Profile Page

**File:** `ai-career-compass/src/pages/Profile.tsx`

Key changes:
```typescript
// Load user data from API
useEffect(() => {
  const loadProfile = async () => {
    const profile = await authAPI.getProfile();
    setUserData(profile);
    
    const saved = await careerAPI.getSavedCareers();
    setSavedCareers(saved);
    
    const history = await careerAPI.getAnalysisHistory();
    setHistory(history);
  };
  loadProfile();
}, []);
```

---

## 🔑 Environment Variables

### Backend `.env`
```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Optional: For LLM features
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
LLM_PROVIDER=openai

FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`
```env
# Backend API URL
VITE_API_URL=http://localhost:8000/api

# Enable LLM-powered analysis
VITE_USE_LLM=false  # Set to true to use AI
```

---

## 🧪 Testing API Integration

### 1. Test Authentication
```bash
# Register
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"test123"}'

# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### 2. Test Career Analysis
```bash
# Analyze interests
curl -X POST http://localhost:8000/api/careers/analyze/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{"text":"I love coding","use_llm":false}'
```

### 3. Test in Browser
1. Start backend: `cd backend && python manage.py runserver`
2. Start frontend: `cd ai-career-compass && npm run dev`
3. Open browser: http://localhost:5173
4. Register/Login
5. Complete quiz
6. Check Network tab for API calls

---

## 🐛 Troubleshooting

### CORS Errors
**Problem:** "Access-Control-Allow-Origin" error

**Solution:**
1. Check `backend/config/settings.py`:
   ```python
   CORS_ALLOWED_ORIGINS = [
       "http://localhost:5173",
   ]
   ```
2. Verify frontend `.env` has correct API URL

### 401 Unauthorized
**Problem:** API returns 401 even with token

**Solution:**
1. Check token is stored: `localStorage.getItem('access_token')`
2. Verify token format: `Bearer <token>`
3. Check token expiry (default: 1 day)

### API Not Found (404)
**Problem:** Endpoint returns 404

**Solution:**
1. Verify backend is running: http://localhost:8000/api/careers/list/
2. Check URL in `api.ts` matches backend URLs
3. Ensure trailing slashes match Django URLs

---

## 📊 API Response Examples

### Successful Analysis
```json
{
  "careers": [
    {
      "career_id": "software-engineer",
      "title": "Software Engineer",
      "match_percentage": 85,
      "match_reason": "You mentioned coding, problem-solving",
      "category": "Tech",
      "education": "CS Degree / Self-taught",
      "salary": "$90K–$250K",
      "work_style": "Remote / Office",
      "skills": ["Programming", "Problem Solving"],
      "color": "hsl(190, 90%, 50%)"
    }
  ],
  "keywords_detected": ["coding", "problem"],
  "categories": [
    { "name": "Technology", "percentage": 60 }
  ],
  "personality": ["Analytical", "Tech-Savvy"],
  "input_text": "I love coding and solving problems"
}
```

### Error Response
```json
{
  "error": "Text is required",
  "detail": "Please provide interest text"
}
```

---

## 🚀 Next Steps

1. ✅ Backend is running and tested
2. ⏳ Integrate API calls in frontend
3. ⏳ Test authentication flow
4. ⏳ Test career analysis
5. ⏳ Test roadmap generation
6. ⏳ Deploy to production

---

## 📚 Additional Resources

- [Django REST Framework Docs](https://www.django-rest-framework.org/)
- [Axios Documentation](https://axios-http.com/)
- [JWT Authentication](https://jwt.io/)
- [Backend Architecture](backend/ARCHITECTURE.md)
