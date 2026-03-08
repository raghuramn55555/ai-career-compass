# AI Career Compass

Full-stack career guidance platform with AI-powered interest analysis and personalized learning roadmaps.

## 🚀 Features

- **AI Career Matching**: Analyze interests and match with suitable careers
- **Personalized Roadmaps**: Generate custom learning paths with milestones
- **Progress Tracking**: Track points, levels, streaks, and achievements
- **Study Tools**: Pomodoro timer, flashcards, document analysis
- **LLM Integration**: Optional OpenAI/Anthropic for advanced analysis

## 🏗️ Tech Stack

### Frontend
- React + TypeScript
- Vite
- TailwindCSS + shadcn/ui
- React Router
- Framer Motion

### Backend
- Django + Django REST Framework
- JWT Authentication
- SQLite (dev) / PostgreSQL (prod)
- OpenAI GPT / Anthropic Claude (optional)
- Celery + Redis (optional)

## 📦 Project Structure

```
.
├── ai-career-compass/     # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   └── utils/         # Utilities
│   └── package.json
│
└── backend/               # Django backend
    ├── config/            # Django settings
    ├── users/             # User authentication
    ├── careers/           # Career matching engine
    │   ├── llm_service.py      # LLM integration
    │   └── career_matcher.py   # Rule-based matching
    └── requirements.txt
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- Git

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd ai-career-compass
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment (edit .env file)
# Add your API keys if using LLM features

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Populate career data
python manage.py populate_careers

# Create admin user
python manage.py createsuperuser

# Run backend server
python manage.py runserver
```

Backend will run at `http://localhost:8000`

### 3. Frontend Setup

```bash
cd ai-career-compass

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will run at `http://localhost:5173`

## 🔑 Environment Configuration

### Backend (.env)

```env
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Optional: Add for LLM features
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
LLM_PROVIDER=openai
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000/api
VITE_USE_LLM=false
```

## 🤖 LLM Integration

The system supports two modes:

### Rule-Based (Default)
- Fast, no API costs
- Keyword-based matching
- Good for basic career matching

### LLM-Powered (Optional)
- Intelligent, context-aware analysis
- Better personality insights
- Requires API keys (OpenAI or Anthropic)

To enable LLM:
1. Add API key to `backend/.env`
2. Set `VITE_USE_LLM=true` in frontend
3. Restart both servers

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register/` - Register user
- `POST /api/auth/login/` - Login (get JWT)
- `GET /api/auth/profile/` - Get profile
- `PUT /api/auth/profile/` - Update profile

### Careers
- `GET /api/careers/list/` - List all careers
- `POST /api/careers/analyze/` - Analyze interests
- `POST /api/careers/saved/` - Save/unsave career
- `POST /api/careers/roadmap/generate/` - Generate roadmap
- `GET /api/careers/history/` - Analysis history

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd ai-career-compass
npm test
```

## 🚀 Production Deployment

### Backend
1. Set `DEBUG=False`
2. Use PostgreSQL database
3. Configure `ALLOWED_HOSTS`
4. Use gunicorn: `gunicorn config.wsgi:application`
5. Set up nginx reverse proxy
6. Enable HTTPS

### Frontend
```bash
npm run build
# Deploy dist/ folder to hosting service
```

## 📝 Development Workflow

1. Start backend: `cd backend && python manage.py runserver`
2. Start frontend: `cd ai-career-compass && npm run dev`
3. Access app at `http://localhost:5173`
4. Admin panel at `http://localhost:8000/admin`

## 🔧 Troubleshooting

### Backend won't start
- Check Python version: `python --version` (need 3.10+)
- Activate virtual environment
- Run migrations: `python manage.py migrate`

### Frontend won't start
- Check Node version: `node --version` (need 18+)
- Delete `node_modules` and run `npm install`
- Check `.env` file exists

### CORS errors
- Verify `FRONTEND_URL` in backend `.env`
- Check `CORS_ALLOWED_ORIGINS` in `backend/config/settings.py`

### LLM not working
- Verify API key in backend `.env`
- Check API key is valid
- Set `use_llm: true` in API requests

## 📚 Documentation

- [Backend Architecture](backend/ARCHITECTURE.md)
- [Backend Setup](backend/README.md)
- [API Documentation](backend/README.md#api-endpoints)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

## 📄 License

MIT License

## 🙏 Acknowledgments

- OpenAI for GPT API
- Anthropic for Claude API
- shadcn/ui for components
- Django REST Framework

## 📧 Support

For issues and questions, please open a GitHub issue.
