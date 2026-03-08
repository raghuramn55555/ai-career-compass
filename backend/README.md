# AI Career Compass Backend

Django REST API backend with LLM integration for intelligent career guidance.

## Features

- **User Authentication**: JWT-based auth with registration/login
- **Career Matching**: Rule-based and LLM-powered career analysis
- **Personalized Roadmaps**: Generate learning paths for careers
- **Progress Tracking**: Track user points, levels, and achievements
- **LLM Integration**: Support for OpenAI GPT and Anthropic Claude

## Architecture

```
backend/
├── config/              # Django settings
├── users/               # User authentication & profiles
├── careers/             # Career matching & analysis
│   ├── llm_service.py   # LLM integration (OpenAI/Anthropic)
│   ├── career_matcher.py # Rule-based matching (fallback)
│   ├── models.py        # Database models
│   ├── views.py         # API endpoints
│   └── serializers.py   # Data serialization
└── manage.py
```

## Setup

### 1. Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```
SECRET_KEY=your-django-secret-key
OPENAI_API_KEY=your-openai-key  # Optional
ANTHROPIC_API_KEY=your-claude-key  # Optional
LLM_PROVIDER=openai  # or anthropic
```

### 3. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Populate Career Data

```bash
python manage.py populate_careers
```

### 5. Create Superuser

```bash
python manage.py createsuperuser
```

### 6. Run Server

```bash
python manage.py runserver
```

API will be available at `http://localhost:8000`

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login (get JWT tokens)
- `GET /api/auth/profile/` - Get user profile
- `PUT /api/auth/profile/` - Update profile

### Careers
- `GET /api/careers/list/` - List all careers
- `POST /api/careers/analyze/` - Analyze interests & match careers
- `GET /api/careers/saved/` - Get saved careers
- `POST /api/careers/saved/` - Save/unsave career
- `POST /api/careers/roadmap/generate/` - Generate learning roadmap
- `GET /api/careers/history/` - Get analysis history

## LLM Integration

### When to Use LLM

The backend supports both rule-based and LLM-powered analysis:

**Rule-based (Default)**:
- Fast, no API costs
- Good for basic keyword matching
- Use when: Budget-conscious, simple matching needed

**LLM-powered (Optional)**:
- More intelligent, context-aware
- Better personality insights
- Use when: Advanced analysis needed, API budget available

### Request Format

```json
POST /api/careers/analyze/
{
  "text": "I love coding and building apps",
  "quiz_answers": {
    "interestAreas": ["technology", "creative"],
    "careerGoal": "create-things"
  },
  "use_llm": false  // Set to true for LLM analysis
}
```

### LLM Providers

**OpenAI GPT-3.5/4**:
- Fast, cost-effective
- Good for structured outputs
- Set `LLM_PROVIDER=openai`

**Anthropic Claude**:
- More nuanced understanding
- Better for complex analysis
- Set `LLM_PROVIDER=anthropic`

## Database Models

### User
- Authentication & profile
- Progress tracking (points, level, streak)
- Study hours & tasks completed

### Career
- Career information
- Keywords for matching
- Skills, education, salary data

### CareerAnalysis
- User's interest analysis history
- Matched careers with scores
- Detected keywords & personality

### SavedCareer
- User's bookmarked careers

### Roadmap
- Personalized learning paths
- Milestones & tasks

## Performance Optimization

1. **Caching**: Add Redis caching for career lists
2. **Async Tasks**: Use Celery for LLM calls
3. **Database**: Switch to PostgreSQL for production
4. **Rate Limiting**: Add throttling for LLM endpoints

## Production Deployment

1. Set `DEBUG=False`
2. Use PostgreSQL database
3. Configure proper `ALLOWED_HOSTS`
4. Set up Redis for Celery
5. Use gunicorn/uwsgi
6. Add HTTPS with nginx

## Testing

```bash
python manage.py test
```

## License

MIT
