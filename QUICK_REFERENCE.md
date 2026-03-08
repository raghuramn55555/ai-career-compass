# Quick Reference - API Usage

## 📍 Where APIs Are Used

### 1. **Authentication** (`/api/auth/`)

| Frontend File | Function | API Endpoint | Purpose |
|--------------|----------|--------------|---------|
| `Auth.tsx` | `handleRegister()` | `POST /api/auth/register/` | Create new user account |
| `Auth.tsx` | `handleLogin()` | `POST /api/auth/login/` | Login and get JWT tokens |
| `AuthContext.tsx` | `loadUser()` | `GET /api/auth/profile/` | Load user data on app start |
| `Profile.tsx` | `updateProfile()` | `PUT /api/auth/profile/` | Update user stats (points, level) |

### 2. **Career Analysis** (`/api/careers/analyze/`)

| Frontend File | Function | API Endpoint | Purpose |
|--------------|----------|--------------|---------|
| `Quiz.tsx` | `handleAnalyze()` | `POST /api/careers/analyze/` | Analyze interests, get matched careers |
| `Quiz.tsx` | `handleRefine()` | `POST /api/careers/analyze/` | Analyze with quiz answers |

**Request:**
```json
{
  "text": "I love coding and solving problems",
  "quiz_answers": { "interestAreas": ["technology"] },
  "use_llm": false
}
```

**Response:**
```json
{
  "careers": [{ "title": "Software Engineer", "match_percentage": 85, ... }],
  "keywords_detected": ["coding", "problem"],
  "personality": ["Analytical"]
}
```

### 3. **Save Careers** (`/api/careers/saved/`)

| Frontend File | Function | API Endpoint | Purpose |
|--------------|----------|--------------|---------|
| `Results.tsx` | `toggleSavedCareer()` | `POST /api/careers/saved/` | Save/unsave a career |
| `Profile.tsx` | `loadSavedCareers()` | `GET /api/careers/saved/` | Get all saved careers |

### 4. **Roadmap Generation** (`/api/careers/roadmap/generate/`)

| Frontend File | Function | API Endpoint | Purpose |
|--------------|----------|--------------|---------|
| `Results.tsx` | `handleViewRoadmap()` | `POST /api/careers/roadmap/generate/` | Generate learning roadmap |

**Request:**
```json
{
  "career_id": "software-engineer",
  "use_llm": false
}
```

**Response:**
```json
{
  "milestones": [
    {
      "id": "m1",
      "title": "Tech Foundations",
      "tasks": [
        { "id": "t1", "title": "Research career", "xp": 50, ... }
      ]
    }
  ]
}
```

### 5. **Analysis History** (`/api/careers/history/`)

| Frontend File | Function | API Endpoint | Purpose |
|--------------|----------|--------------|---------|
| `Profile.tsx` | `loadHistory()` | `GET /api/careers/history/` | Get past analyses |

---

## 🔑 Key Files

### Backend
- `backend/careers/views.py` - API endpoints
- `backend/careers/llm_service.py` - LLM integration
- `backend/careers/career_matcher.py` - Rule-based matching
- `backend/users/views.py` - Auth endpoints

### Frontend
- `ai-career-compass/src/services/api.ts` - API client
- `ai-career-compass/src/contexts/AuthContext.tsx` - Auth state
- `ai-career-compass/src/pages/Quiz.tsx` - Interest input
- `ai-career-compass/src/pages/Results.tsx` - Career display
- `ai-career-compass/src/pages/Roadmap.tsx` - Learning path

---

## 🚀 Quick Start

### 1. Start Backend
```bash
cd backend
python manage.py runserver
# Runs on http://localhost:8000
```

### 2. Start Frontend
```bash
cd ai-career-compass
npm run dev
# Runs on http://localhost:5173
```

### 3. Test API
```bash
# Test career list
curl http://localhost:8000/api/careers/list/

# Test analysis (requires auth)
curl -X POST http://localhost:8000/api/careers/analyze/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"text":"I love coding","use_llm":false}'
```

---

## 🔧 Configuration

### Enable LLM Analysis

**Backend** (`backend/.env`):
```env
OPENAI_API_KEY=sk-...
LLM_PROVIDER=openai
```

**Frontend** (`ai-career-compass/.env`):
```env
VITE_USE_LLM=true
```

---

## 📊 Data Flow Summary

```
User Input (Quiz.tsx)
    ↓
API Call (api.ts)
    ↓
Django Backend (views.py)
    ↓
    ├─ Rule-Based (career_matcher.py) [Default]
    └─ LLM-Powered (llm_service.py) [Optional]
    ↓
Database (models.py)
    ↓
Response (JSON)
    ↓
Display (Results.tsx)
```

---

## 🐛 Common Issues

### CORS Error
**Fix:** Check `backend/config/settings.py`:
```python
CORS_ALLOWED_ORIGINS = ["http://localhost:5173"]
```

### 401 Unauthorized
**Fix:** Check token in localStorage:
```javascript
localStorage.getItem('access_token')
```

### API Not Found
**Fix:** Verify backend is running:
```bash
curl http://localhost:8000/api/careers/list/
```

---

## 📚 Documentation

- [Complete API Integration Guide](API_INTEGRATION_GUIDE.md)
- [API Flow Diagrams](API_FLOW_DIAGRAM.md)
- [Backend Architecture](backend/ARCHITECTURE.md)
- [Project Overview](PROJECT_OVERVIEW.md)
- [Setup Checklist](SETUP_CHECKLIST.md)
