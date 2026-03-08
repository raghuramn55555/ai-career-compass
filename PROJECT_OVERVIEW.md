# AI Career Compass - Project Overview

## 📋 Summary

A full-stack web application that helps users discover their ideal career path through AI-powered interest analysis and provides personalized learning roadmaps.

## 🎯 Key Features

### 1. Career Discovery
- **Interest Analysis**: Users describe their interests in natural language
- **AI Matching**: System matches users with suitable careers
- **Smart Filtering**: Shows only relevant careers (not all 20)
- **Match Scores**: Each career gets a percentage match score

### 2. Personalized Roadmaps
- **Learning Paths**: Step-by-step milestones for each career
- **Task Management**: Track progress with XP and time estimates
- **Gamification**: Points, levels, streaks, and badges

### 3. Study Tools
- **Pomodoro Timer**: Focus sessions with break reminders
- **Flashcards**: AI-generated study cards
- **Document Tools**: Resume builder, cover letter generator

### 4. User Progress
- **Profile Dashboard**: View stats, achievements, saved careers
- **History**: Track all career analyses
- **Bookmarks**: Save favorite careers

## 🏗️ Architecture

### Frontend (React + TypeScript)
```
ai-career-compass/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── Navbar.tsx      # Navigation
│   │   ├── CareerCard.tsx  # Career display
│   │   └── Timer.tsx       # Pomodoro timer
│   │
│   ├── pages/              # Route pages
│   │   ├── Landing.tsx     # Home page
│   │   ├── Auth.tsx        # Login/Register
│   │   ├── Quiz.tsx        # Interest input
│   │   ├── Results.tsx     # Career matches
│   │   ├── Roadmap.tsx     # Learning path
│   │   └── Profile.tsx     # User dashboard
│   │
│   ├── contexts/           # State management
│   │   ├── AuthContext.tsx      # Authentication
│   │   ├── UserDataContext.tsx  # User progress
│   │   └── ThemeContext.tsx     # Dark/light mode
│   │
│   └── utils/              # Helper functions
│       ├── careerData.ts        # Career database
│       └── flashcardGenerator.ts
│
└── package.json
```

### Backend (Django + DRF)
```
backend/
├── config/                 # Django configuration
│   ├── settings.py        # App settings
│   ├── urls.py            # URL routing
│   └── celery.py          # Background tasks
│
├── users/                 # Authentication app
│   ├── models.py          # User model with progress
│   ├── views.py           # Auth endpoints
│   ├── serializers.py     # Data validation
│   └── urls.py            # Auth routes
│
├── careers/               # Career matching app
│   ├── models.py          # Career, Analysis, Roadmap
│   ├── views.py           # API endpoints
│   ├── serializers.py     # Data serialization
│   ├── llm_service.py     # LLM integration
│   ├── career_matcher.py  # Rule-based matching
│   └── urls.py            # Career routes
│
└── requirements.txt
```

## 🔄 Data Flow

### Career Analysis Flow
```
1. User enters interests on Quiz page
   ↓
2. Frontend sends to backend: POST /api/careers/analyze/
   {
     "text": "I love coding and solving problems",
     "quiz_answers": {...},
     "use_llm": false
   }
   ↓
3. Backend processes:
   - If use_llm=true: Call OpenAI/Claude API
   - If use_llm=false: Use rule-based matcher
   ↓
4. Backend returns matched careers:
   {
     "careers": [
       {
         "title": "Software Engineer",
         "match_percentage": 85,
         "match_reason": "You mentioned coding, problem-solving"
       }
     ],
     "keywords_detected": ["coding", "problem"],
     "personality": ["Analytical", "Tech-Savvy"]
   }
   ↓
5. Frontend displays results on Results page
   - Shows only matched careers (not all 20)
   - No category filters (already filtered)
```

### Authentication Flow
```
1. User registers/logs in
   ↓
2. Backend generates JWT tokens
   ↓
3. Frontend stores tokens in localStorage
   ↓
4. All API requests include:
   Authorization: Bearer <access_token>
```

## 🤖 LLM Integration

### Two Modes

**Rule-Based (Default)**
- Uses keyword matching algorithm
- Fast, no API costs
- Good accuracy for basic matching
- Fallback when LLM unavailable

**LLM-Powered (Optional)**
- Uses OpenAI GPT or Anthropic Claude
- Context-aware analysis
- Better personality insights
- Requires API keys

### When LLM is Used

1. **Career Analysis** (`/api/careers/analyze/`)
   - Analyzes user's interest text
   - Extracts keywords and personality traits
   - Matches with careers intelligently

2. **Roadmap Generation** (`/api/careers/roadmap/generate/`)
   - Creates personalized learning milestones
   - Tailored to user's background
   - Generates specific tasks with XP/time

### Cost Optimization

- LLM is **optional**, not required
- Rule-based matcher is default
- Users can choose when to use LLM
- Caching reduces API calls

## 📊 Database Schema

### Users App
```sql
User
  - id, email, username, password
  - points, level, streak
  - tasks_completed, study_hours
  - join_date
```

### Careers App
```sql
Career
  - id, career_id, title, category
  - keywords (JSON array)
  - education, salary, work_style
  - skills (JSON array)
  - color

CareerAnalysis
  - id, user_id, input_text
  - keywords_detected (JSON)
  - categories (JSON)
  - personality (JSON)
  - matched_careers (JSON)
  - created_at

SavedCareer
  - id, user_id, career_id
  - saved_at

Roadmap
  - id, user_id, career_id
  - milestones (JSON)
  - updated_at
```

## 🔐 Security

- **Authentication**: JWT tokens with expiry
- **Password**: Hashed with Django's PBKDF2
- **CORS**: Configured for frontend origin only
- **API Keys**: Stored in environment variables
- **Validation**: Input sanitization on all endpoints

## 🚀 Deployment

### Development
```bash
# Backend
cd backend
python manage.py runserver

# Frontend
cd ai-career-compass
npm run dev
```

### Production

**Backend**
- Use PostgreSQL instead of SQLite
- Set DEBUG=False
- Configure ALLOWED_HOSTS
- Use gunicorn/uwsgi
- Set up nginx reverse proxy
- Enable HTTPS

**Frontend**
- Build: `npm run build`
- Deploy `dist/` folder to:
  - Vercel
  - Netlify
  - AWS S3 + CloudFront
  - Your own server

## 📈 Performance

### Current (Development)
- SQLite database
- Synchronous API calls
- No caching
- Single server instance

### Optimizations for Production
1. **Database**: PostgreSQL with indexes
2. **Caching**: Redis for career lists
3. **Async**: Celery for LLM calls
4. **CDN**: Static files on CDN
5. **Load Balancer**: Multiple Django instances

## 🧪 Testing

### Backend
```bash
python manage.py test
```

### Frontend
```bash
npm test
```

### Manual Testing Checklist
- [ ] User registration/login
- [ ] Career analysis (rule-based)
- [ ] Career analysis (LLM)
- [ ] Save/unsave careers
- [ ] Generate roadmap
- [ ] Complete tasks
- [ ] View profile stats

## 📝 Environment Files

### Backend `.env`
```env
SECRET_KEY=your-secret-key
DEBUG=True
OPENAI_API_KEY=sk-...  # Optional
ANTHROPIC_API_KEY=sk-ant-...  # Optional
LLM_PROVIDER=openai
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:8000/api
VITE_USE_LLM=false
```

## 🔧 Common Issues

### Backend won't start
- Check Python version (need 3.10+)
- Activate virtual environment
- Run migrations

### Frontend won't start
- Check Node version (need 18+)
- Delete node_modules, reinstall
- Check .env file

### CORS errors
- Verify FRONTEND_URL in backend .env
- Check CORS_ALLOWED_ORIGINS in settings.py

### LLM not working
- Verify API key in backend .env
- Check API key is valid
- Ensure use_llm=true in requests

## 📚 Key Technologies

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool
- **TailwindCSS**: Styling
- **shadcn/ui**: Component library
- **Framer Motion**: Animations
- **React Router**: Navigation

### Backend
- **Django 5**: Web framework
- **DRF**: REST API
- **SimpleJWT**: Authentication
- **OpenAI**: GPT integration
- **Anthropic**: Claude integration
- **Celery**: Background tasks (optional)
- **Redis**: Caching (optional)

## 🎓 Learning Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [DRF Documentation](https://www.django-rest-framework.org/)
- [React Documentation](https://react.dev/)
- [OpenAI API](https://platform.openai.com/docs)
- [Anthropic API](https://docs.anthropic.com/)

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Make changes
4. Write tests
5. Submit pull request

## 📄 License

MIT License - See LICENSE file

## 👥 Team

- Frontend: React + TypeScript
- Backend: Django + DRF
- AI: OpenAI GPT / Anthropic Claude

## 🎯 Future Enhancements

1. **Real-time collaboration**: WebSocket for live analysis
2. **Custom ML model**: Train on user data
3. **Mobile app**: React Native version
4. **Social features**: Share roadmaps, connect with mentors
5. **Advanced analytics**: Career trends, success rates
6. **Multi-language**: i18n support
7. **Video content**: Embedded tutorials
8. **Job board**: Integration with job APIs
