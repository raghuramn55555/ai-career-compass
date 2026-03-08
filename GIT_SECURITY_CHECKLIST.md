# Git Security Checklist ✅

## Status: READY TO PUSH! 🎉

Your repository is secure and ready to be pushed to Git. All sensitive data is protected.

## What's Protected

### ✅ API Keys
- ✅ Gemini API key (in `.env` files only)
- ✅ Anthropic API key (in `.env` files only)
- ✅ Django SECRET_KEY (in `.env` files only)

### ✅ Sensitive Files
- ✅ `.env` files (ignored by Git)
- ✅ `db.sqlite3` (database with user data - ignored)
- ✅ `__pycache__/` and `*.pyc` (Python cache - ignored)
- ✅ `node_modules/` (dependencies - ignored)
- ✅ Virtual environments (ignored)

### ✅ Example Files (Safe to Commit)
- ✅ `.env.example` files (no real keys)
- ✅ All source code (no hardcoded keys)
- ✅ Documentation files

## Files That Will Be Committed

### Safe to Commit:
```
✅ Source code (.tsx, .ts, .py files)
✅ Configuration files (package.json, requirements.txt)
✅ .gitignore files
✅ .env.example files (templates only)
✅ Documentation (.md files)
✅ Public assets (images, icons)
```

### Will NOT Be Committed (Protected):
```
❌ .env files (contain real API keys)
❌ db.sqlite3 (contains user data)
❌ node_modules/ (dependencies)
❌ venv/ (Python virtual environment)
❌ __pycache__/ (Python cache)
❌ dist/ (build output)
```

## Pre-Push Verification

Run these commands to verify nothing sensitive will be committed:

### 1. Check Git Status
```bash
git status
```
Should NOT show:
- `.env` files
- `db.sqlite3`
- `node_modules/`
- `venv/` or `env/`

### 2. Check for API Keys in Staged Files
```bash
git diff --cached | grep -i "AIzaSy"
git diff --cached | grep -i "sk-ant-"
```
Should return: No matches (empty output)

### 3. Verify .gitignore is Working
```bash
git check-ignore backend/.env
git check-ignore ai-career-compass/.env
git check-ignore backend/db.sqlite3
```
Should return: The file paths (meaning they're ignored)

## Setup Instructions for Team Members

When someone clones your repository, they need to:

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd <repo-name>
```

### 2. Setup Backend
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

# Copy .env.example to .env
copy .env.example .env  # Windows
cp .env.example .env    # Mac/Linux

# Edit .env and add their own API keys
# They need to get their own keys from:
# - Gemini: https://makersuite.google.com/app/apikey
# - Anthropic: https://console.anthropic.com/

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start server
python manage.py runserver
```

### 3. Setup Frontend
```bash
cd ai-career-compass

# Install dependencies
npm install

# Copy .env.example to .env
copy .env.example .env  # Windows
cp .env.example .env    # Mac/Linux

# Edit .env and add their own Gemini API key

# Start dev server
npm run dev
```

## Environment Variables Required

### Backend (.env)
```env
SECRET_KEY=<generate-new-secret-key>
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
GEMINI_API_KEY=<your-gemini-key>
ANTHROPIC_API_KEY=<your-anthropic-key>
LLM_PROVIDER=gemini
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api
VITE_USE_BACKEND=true
VITE_USE_LLM=false
VITE_GEMINI_API_KEY=<your-gemini-key>
```

## Git Commands to Push

### First Time Setup
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Check what will be committed
git status

# Commit
git commit -m "Initial commit: AI Career Compass application"

# Add remote repository
git remote add origin <your-repo-url>

# Push to GitHub
git push -u origin main
```

### Subsequent Pushes
```bash
git add .
git commit -m "Your commit message"
git push
```

## Security Best Practices

### ✅ DO:
- Keep `.env` files in `.gitignore`
- Use `.env.example` as templates
- Rotate API keys if accidentally committed
- Use different API keys for development and production
- Add `.env` to `.gitignore` before first commit

### ❌ DON'T:
- Commit `.env` files
- Hardcode API keys in source code
- Share API keys in documentation
- Commit database files with user data
- Push without checking `git status` first

## If You Accidentally Commit Secrets

If you accidentally commit API keys or secrets:

### 1. Remove from Git History
```bash
# Remove file from Git but keep locally
git rm --cached backend/.env
git rm --cached ai-career-compass/.env

# Commit the removal
git commit -m "Remove .env files from Git"

# Push
git push
```

### 2. Rotate API Keys
- Generate new Gemini API key: https://makersuite.google.com/app/apikey
- Generate new Anthropic API key: https://console.anthropic.com/
- Update your local `.env` files with new keys

### 3. Clean Git History (if needed)
```bash
# Use BFG Repo-Cleaner or git filter-branch
# This is advanced - see GitHub docs
```

## README.md Setup Instructions

Add this to your README.md:

```markdown
## Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- Git

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone <your-repo-url>
   cd <repo-name>
   \`\`\`

2. Setup backend:
   \`\`\`bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env and add your API keys
   python manage.py migrate
   python manage.py createsuperuser
   python manage.py runserver
   \`\`\`

3. Setup frontend (in new terminal):
   \`\`\`bash
   cd ai-career-compass
   npm install
   cp .env.example .env
   # Edit .env and add your API keys
   npm run dev
   \`\`\`

4. Get API Keys:
   - Gemini: https://makersuite.google.com/app/apikey
   - Anthropic: https://console.anthropic.com/

### Environment Variables

See `.env.example` files in `backend/` and `ai-career-compass/` directories.
```

## Verification Checklist

Before pushing, verify:

- [ ] `.env` files are in `.gitignore`
- [ ] No API keys in source code
- [ ] `.env.example` files have placeholder values
- [ ] `db.sqlite3` is in `.gitignore`
- [ ] `node_modules/` is in `.gitignore`
- [ ] Virtual environment folders are in `.gitignore`
- [ ] `git status` shows no sensitive files
- [ ] README.md has setup instructions
- [ ] Documentation doesn't contain real API keys

## Current .gitignore Coverage

### Root .gitignore
```
✅ backend/.env
✅ ai-career-compass/.env
✅ backend/db.sqlite3
✅ backend/venv/
✅ ai-career-compass/node_modules/
✅ .vscode/
✅ .DS_Store
```

### Backend .gitignore
```
✅ .env
✅ db.sqlite3
✅ venv/
✅ __pycache__/
✅ *.pyc
✅ /media
✅ /staticfiles
```

### Frontend .gitignore
```
✅ .env
✅ .env.local
✅ node_modules/
✅ dist/
✅ .vscode/
```

## Summary

✅ Your repository is SECURE and ready to push!

All sensitive data is protected by `.gitignore`:
- API keys are only in `.env` files (not committed)
- Database with user data is not committed
- No hardcoded secrets in source code
- `.env.example` files provide templates for team members

You can safely push to Git now! 🚀

