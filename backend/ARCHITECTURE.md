# Backend Architecture

## Overview

Django REST Framework backend with intelligent career matching using both rule-based algorithms and optional LLM integration.

## System Design

```
┌─────────────────┐
│   React Frontend│
│  (Port 5173)    │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────────────────────────┐
│     Django Backend (Port 8000)      │
├─────────────────────────────────────┤
│  ┌──────────┐      ┌─────────────┐ │
│  │   Users  │      │   Careers   │ │
│  │   App    │      │     App     │ │
│  └──────────┘      └─────────────┘ │
│       │                   │         │
│       ▼                   ▼         │
│  ┌──────────────────────────────┐  │
│  │      PostgreSQL/SQLite       │  │
│  └──────────────────────────────┘  │
└──────────────┬──────────────────────┘
               │
               ▼
    ┌──────────────────────┐
    │   LLM Services       │
    ├──────────────────────┤
    │  • Gemini│
    │  • Anthropic Claude  │
    └──────────────────────┘
```

## Core Components

### 1. Users App
**Purpose**: Authentication & user management

**Models**:
- `User`: Extended Django user with progress tracking
  - points, level, streak
  - tasks_completed, study_hours

**Endpoints**:
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - JWT authentication
- `GET/PUT /api/auth/profile/` - Profile management

**Authentication**: JWT tokens (SimpleJWT)

### 2. Careers App
**Purpose**: Career matching & roadmap generation

**Models**:
- `Career`: Career information database
- `CareerAnalysis`: User analysis history
- `SavedCareer`: Bookmarked careers
- `Roadmap`: Personalized learning paths

**Services**:
- `LLMService`: LLM integration layer
- `CareerMatcher`: Rule-based matching

**Endpoints**:
- `GET /api/careers/list/` - All careers
- `POST /api/careers/analyze/` - Interest analysis
- `POST /api/careers/roadmap/generate/` - Roadmap creation

## LLM Integration Strategy

### Hybrid Approach

The system uses a **hybrid approach** combining rule-based and LLM-powered analysis:

```python
if use_llm and has_api_key:
    result = LLMService().analyze()  # Intelligent analysis
else:
    result = CareerMatcher().analyze()  # Fast, rule-based
```

### When LLM is Used

**Career Analysis** (`/api/careers/analyze/`):
- Input: User's interest text + quiz answers
- LLM Task: Extract keywords, identify personality traits, match careers
- Output: Ranked career list with match percentages
- Benefit: Context-aware, nuanced understanding

**Roadmap Generation** (`/api/careers/roadmap/generate/`):
- Input: Career title + user level
- LLM Task: Generate personalized learning milestones
- Output: 4 milestones with tasks, XP, time estimates
- Benefit: Tailored to user's background

### LLM Prompt Engineering

**Analysis Prompt**:
```
Analyze this person's career interests:
User Input: "I love coding and solving problems"

Provide JSON:
{
  "keywords_detected": ["coding", "problem-solving"],
  "personality_traits": ["Analytical", "Tech-Savvy"],
  "recommended_careers": [...]
}
```

**Roadmap Prompt**:
```
Generate learning roadmap for Software Engineer
User level: beginner

Create 4 milestones with 4 tasks each
Format: JSON with id, title, description, tasks
```

### Cost Optimization

1. **Caching**: Cache common analyses
2. **Fallback**: Always have rule-based backup
3. **Batching**: Group multiple requests
4. **Token Limits**: Optimize prompt length

## Data Flow

### Career Analysis Flow

```
User Input
    ↓
Frontend sends POST /api/careers/analyze/
    ↓
Backend receives: {text, quiz_answers, use_llm}
    ↓
┌─────────────────────────────┐
│  use_llm == true?           │
├─────────────────────────────┤
│ YES → LLMService            │
│  • Call OpenAI/Claude       │
│  • Parse JSON response      │
│  • Fallback on error        │
│                             │
│ NO → CareerMatcher          │
│  • Keyword extraction       │
│  • Score calculation        │
│  • Career ranking           │
└─────────────────────────────┘
    ↓
Save CareerAnalysis to DB
    ↓
Return matched careers to frontend
```

### Authentication Flow

```
User Registration
    ↓
POST /api/auth/register/
    ↓
Create User + Generate JWT
    ↓
Return {user, tokens: {access, refresh}}
    ↓
Frontend stores tokens
    ↓
Subsequent requests include:
Authorization: Bearer <access_token>
```

## Database Schema

```sql
-- Users
User
  - id (PK)
  - email (unique)
  - username
  - password (hashed)
  - points, level, streak
  - tasks_completed, study_hours

-- Careers
Career
  - id (PK)
  - career_id (unique)
  - title, category
  - keywords (JSON)
  - education, salary, work_style
  - skills (JSON)

CareerAnalysis
  - id (PK)
  - user_id (FK)
  - input_text
  - keywords_detected (JSON)
  - categories (JSON)
  - personality (JSON)
  - matched_careers (JSON)
  - created_at

SavedCareer
  - id (PK)
  - user_id (FK)
  - career_id (FK)
  - saved_at

Roadmap
  - id (PK)
  - user_id (FK)
  - career_id (FK)
  - milestones (JSON)
  - updated_at
```

## Security

1. **Authentication**: JWT tokens with expiry
2. **CORS**: Configured for frontend origin
3. **Password**: Django's built-in hashing
4. **API Keys**: Stored in environment variables
5. **Rate Limiting**: TODO - Add throttling

## Performance Considerations

### Current Setup (Development)
- SQLite database
- Synchronous LLM calls
- No caching

### Production Recommendations
1. **Database**: PostgreSQL with connection pooling
2. **Caching**: Redis for career lists, analysis results
3. **Async**: Celery for LLM calls (avoid blocking)
4. **CDN**: Static files on CDN
5. **Load Balancer**: Multiple Django instances

### Scaling Strategy

```
┌──────────────┐
│ Load Balancer│
└──────┬───────┘
       │
   ┌───┴────┬────────┬────────┐
   ▼        ▼        ▼        ▼
Django   Django   Django   Django
Instance Instance Instance Instance
   │        │        │        │
   └────────┴────────┴────────┘
            │
            ▼
    ┌──────────────┐
    │  PostgreSQL  │
    │  (Primary)   │
    └──────────────┘
            │
    ┌───────┴────────┐
    ▼                ▼
  Redis          Celery
  Cache          Workers
```

## Error Handling

### LLM Failures
```python
try:
    result = llm_service.analyze()
except Exception as e:
    logger.error(f"LLM failed: {e}")
    result = career_matcher.analyze()  # Fallback
```

### API Errors
- 400: Bad request (missing fields)
- 401: Unauthorized (invalid token)
- 404: Not found
- 500: Server error (logged)

## Testing Strategy

1. **Unit Tests**: Models, serializers, matchers
2. **Integration Tests**: API endpoints
3. **LLM Mocking**: Mock LLM responses in tests
4. **Load Testing**: Simulate concurrent users

## Deployment

### Development
```bash
python manage.py runserver
```

### Production
```bash
gunicorn config.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers 4 \
  --timeout 120
```

### Environment Variables
```
DEBUG=False
ALLOWED_HOSTS=yourdomain.com
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
OPENAI_API_KEY=sk-...
```

## Monitoring

1. **Logging**: Django logging to file/service
2. **Metrics**: Track LLM usage, response times
3. **Alerts**: Failed LLM calls, high error rates
4. **Analytics**: Popular careers, user engagement

## Future Enhancements

1. **Real-time**: WebSocket for live analysis
2. **ML Model**: Train custom career matching model
3. **Recommendations**: Collaborative filtering
4. **A/B Testing**: Compare LLM vs rule-based
5. **Multi-language**: i18n support
