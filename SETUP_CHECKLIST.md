# Setup Checklist

## ✅ Initial Setup

### Backend Setup
- [ ] Navigate to `backend/` folder
- [ ] Create virtual environment: `python -m venv venv`
- [ ] Activate virtual environment
  - Windows: `venv\Scripts\activate`
  - Mac/Linux: `source venv/bin/activate`
- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Verify `.env` file exists (created automatically)
- [ ] Run migrations: `python manage.py migrate`
- [ ] Populate careers: `python manage.py populate_careers`
- [ ] Create superuser: `python manage.py createsuperuser`
- [ ] Test backend: `python manage.py runserver`
- [ ] Visit http://localhost:8000/admin to verify

### Frontend Setup
- [ ] Navigate to `ai-career-compass/` folder
- [ ] Install dependencies: `npm install`
- [ ] Verify `.env` file exists (created automatically)
- [ ] Test frontend: `npm run dev`
- [ ] Visit http://localhost:5173 to verify

## 🔑 Optional: LLM Setup

### If you want AI-powered analysis:
- [ ] Get OpenAI API key from https://platform.openai.com/api-keys
  OR
- [ ] Get Anthropic API key from https://console.anthropic.com/
- [ ] Add key to `backend/.env`:
  ```
  OPENAI_API_KEY=sk-...
  # or
  ANTHROPIC_API_KEY=sk-ant-...
  ```
- [ ] Set provider in `backend/.env`:
  ```
  LLM_PROVIDER=openai  # or anthropic
  ```
- [ ] Update `ai-career-compass/.env`:
  ```
  VITE_USE_LLM=true
  ```
- [ ] Restart both servers

## 🧪 Testing

### Backend Tests
- [ ] Run: `cd backend && python manage.py test`
- [ ] All tests should pass

### Frontend Tests
- [ ] Run: `cd ai-career-compass && npm test`
- [ ] All tests should pass

### Manual Testing
- [ ] Register a new user
- [ ] Login with credentials
- [ ] Complete interest quiz
- [ ] View career matches (should show filtered results)
- [ ] Save a career
- [ ] Generate roadmap
- [ ] Complete a task
- [ ] Check profile stats updated
- [ ] Logout and login again

## 🚀 Quick Start (After Initial Setup)

### Option 1: Manual Start
```bash
# Terminal 1 - Backend
cd backend
venv\Scripts\activate  # Windows
python manage.py runserver

# Terminal 2 - Frontend
cd ai-career-compass
npm run dev
```

### Option 2: Quick Start Script
```bash
# Windows
start.bat

# Mac/Linux
bash start.sh
```

## 📋 Verification Checklist

### Backend Verification
- [ ] Admin panel accessible at http://localhost:8000/admin
- [ ] Can login with superuser credentials
- [ ] Careers visible in admin panel
- [ ] API endpoints respond:
  - [ ] http://localhost:8000/api/careers/list/
  - [ ] http://localhost:8000/api/auth/register/

### Frontend Verification
- [ ] Landing page loads at http://localhost:5173
- [ ] Can navigate to different pages
- [ ] Dark/light mode toggle works
- [ ] Forms are responsive
- [ ] No console errors

### Integration Verification
- [ ] Frontend can register new user
- [ ] Frontend can login
- [ ] Career analysis works
- [ ] Results page shows filtered careers
- [ ] Can save/unsave careers
- [ ] Roadmap generation works
- [ ] Profile shows correct data

## 🔧 Troubleshooting

### Backend Issues
- [ ] Python version is 3.10 or higher: `python --version`
- [ ] Virtual environment is activated (see `(venv)` in terminal)
- [ ] All migrations applied: `python manage.py migrate`
- [ ] Port 8000 is not in use
- [ ] `.env` file exists in backend folder

### Frontend Issues
- [ ] Node version is 18 or higher: `node --version`
- [ ] Dependencies installed: check `node_modules/` exists
- [ ] Port 5173 is not in use
- [ ] `.env` file exists in ai-career-compass folder
- [ ] Backend is running before starting frontend

### CORS Issues
- [ ] Backend `.env` has correct FRONTEND_URL
- [ ] Frontend `.env` has correct VITE_API_URL
- [ ] Both servers are running
- [ ] No browser extensions blocking requests

### LLM Issues
- [ ] API key is valid and has credits
- [ ] API key is correctly set in backend `.env`
- [ ] No extra spaces in API key
- [ ] LLM_PROVIDER matches your API key (openai or anthropic)
- [ ] Backend restarted after adding API key

## 📝 Environment Files Check

### Backend `.env` should have:
```env
SECRET_KEY=django-insecure-dev-key-change-in-production-abc123xyz789
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
OPENAI_API_KEY=  # Optional
ANTHROPIC_API_KEY=  # Optional
LLM_PROVIDER=openai
REDIS_URL=redis://localhost:6379/0
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env` should have:
```env
VITE_API_URL=http://localhost:8000/api
VITE_USE_LLM=false
```

## ✨ Success Indicators

You're all set when:
- [ ] Both servers start without errors
- [ ] Can register and login
- [ ] Career analysis returns filtered results
- [ ] No category tabs shown on results page (after analysis)
- [ ] Roadmap generates successfully
- [ ] Profile shows correct stats
- [ ] No console errors in browser

## 🎉 Next Steps

Once everything is working:
1. Explore all features
2. Try with and without LLM
3. Test different interest inputs
4. Complete some roadmap tasks
5. Check the gamification features
6. Review the code structure
7. Read ARCHITECTURE.md for details
8. Start customizing for your needs!

## 📞 Need Help?

- Check README.md for detailed instructions
- Review ARCHITECTURE.md for system design
- Check PROJECT_OVERVIEW.md for feature details
- Open an issue on GitHub
