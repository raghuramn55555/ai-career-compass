# Authentication Testing Guide

## Current Status

✅ Backend server is running on `http://localhost:8000`
✅ Backend dependencies installed
✅ Database migrations completed
✅ Superuser exists: koushikpadala83@gmail.com
✅ Test user created: testuser@example.com
✅ API endpoints working correctly
✅ CORS configured for frontend
✅ Frontend environment variables set correctly

## Backend API Endpoints

### 1. Register (Sign Up)
```bash
POST http://localhost:8000/api/auth/register/
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "username": "newuser"
}
```

### 2. Login
```bash
POST http://localhost:8000/api/auth/login/
Content-Type: application/json

{
  "email": "testuser@example.com",
  "password": "test123456"
}

Response:
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Get Profile (Protected)
```bash
GET http://localhost:8000/api/auth/profile/
Authorization: Bearer <access_token>

Response:
{
  "id": 3,
  "username": "testuser",
  "email": "testuser@example.com",
  "join_date": "2026-03-02",
  "points": 0,
  "level": 1,
  "streak": 1,
  "tasks_completed": 0,
  "study_hours": 0.0
}
```

## Frontend Configuration

### Environment Variables (.env)
```env
VITE_API_URL=http://localhost:8000/api
VITE_USE_BACKEND=true
VITE_USE_LLM=false
VITE_GEMINI_API_KEY=<your_key>
```

### AuthContext Configuration
- ✅ Updated to use `/api/auth/` endpoints
- ✅ Handles both backend and localStorage fallback
- ✅ Properly maps backend response fields to frontend User interface

## Testing Steps

### Step 1: Verify Backend is Running
```bash
curl http://localhost:8000/api/auth/register/ -Method GET
```
Should return: Method "GET" not allowed (this is correct - endpoint only accepts POST)

### Step 2: Test Registration via Backend
```bash
curl http://localhost:8000/api/auth/register/ -Method POST -ContentType "application/json" -Body '{"email":"demo@test.com","password":"demo123456","username":"demouser"}' -UseBasicParsing
```

### Step 3: Test Login via Backend
```bash
curl http://localhost:8000/api/auth/login/ -Method POST -ContentType "application/json" -Body '{"email":"demo@test.com","password":"demo123456"}' -UseBasicParsing
```

### Step 4: Test Frontend Registration
1. Open browser to `http://localhost:5173/auth`
2. Click "Sign Up" tab
3. Fill in:
   - Name: Demo User
   - Email: frontend@test.com
   - Password: test123456
   - Confirm Password: test123456
4. Click "Create Account"
5. Check browser console for any errors
6. Check Network tab for API calls

### Step 5: Verify User in Django Admin
1. Go to `http://localhost:8000/admin/`
2. Login with superuser credentials
3. Click "Users" under "USERS" section
4. Look for "frontend@test.com" in the list

## Common Issues & Solutions

### Issue 1: "Network error. Using local storage."
**Cause**: Backend server not running or frontend can't reach it

**Solution**:
```bash
cd backend
python manage.py runserver
```

### Issue 2: CORS Error
**Cause**: Frontend origin not allowed by backend

**Check**: `backend/config/settings.py` should have:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

### Issue 3: "Authentication credentials were not provided"
**Cause**: Token not being sent or invalid format

**Solution**: Check localStorage for 'tokens' key and verify format

### Issue 4: User not appearing in Django admin
**Cause**: Registration falling back to localStorage instead of backend

**Debug**:
1. Open browser DevTools → Console
2. Look for "Backend signup error" or "Backend signup failed"
3. Check Network tab for failed API calls
4. Verify `VITE_USE_BACKEND=true` in `.env`

### Issue 5: "Page not found (404)"
**Cause**: Wrong API endpoint URL

**Solution**: Verify endpoints:
- ✅ `/api/auth/register/` (correct)
- ❌ `/api/users/register/` (wrong)

## Debugging Checklist

- [ ] Backend server is running: `python manage.py runserver`
- [ ] Frontend dev server is running: `npm run dev`
- [ ] `.env` file has `VITE_USE_BACKEND=true`
- [ ] Browser console shows no CORS errors
- [ ] Network tab shows API calls to `http://localhost:8000/api/auth/`
- [ ] Backend logs show incoming requests
- [ ] Tokens are stored in localStorage after successful login

## Current Test Users

### Superuser (Admin Access)
- Email: koushikpadala83@gmail.com
- Can access: `http://localhost:8000/admin/`

### Test User
- Email: testuser@example.com
- Password: test123456
- Created via: Backend API

## Next Steps

1. ✅ Backend API is working
2. ✅ Frontend AuthContext updated
3. 🔄 Test frontend registration
4. 🔄 Verify user appears in Django admin
5. 🔄 Test frontend login
6. 🔄 Test protected routes

## Quick Test Commands

### Create a new user via backend:
```bash
curl http://localhost:8000/api/auth/register/ -Method POST -ContentType "application/json" -Body '{"email":"quick@test.com","password":"quick123","username":"quicktest"}' -UseBasicParsing
```

### Login with that user:
```bash
curl http://localhost:8000/api/auth/login/ -Method POST -ContentType "application/json" -Body '{"email":"quick@test.com","password":"quick123"}' -UseBasicParsing
```

### List all users:
```bash
cd backend
python list_users.py
```

## Frontend Changes Made

1. Updated `AuthContext.tsx`:
   - Changed `/api/users/` to `/api/auth/`
   - Updated registration to send `username` field
   - Fixed response field mapping (`join_date` instead of `created_at`)
   - Added fallback for username (uses email prefix if not provided)

2. Environment variables:
   - `VITE_USE_BACKEND=true` enables backend authentication
   - `VITE_API_URL=http://localhost:8000/api` points to backend

## Testing Authentication Flow

### Registration Flow:
```
User fills form → Frontend calls signupBackend()
  ↓
POST /api/auth/register/ with {email, password, username}
  ↓
Backend creates user in database
  ↓
Backend returns {user, tokens}
  ↓
Frontend stores user data and tokens in localStorage
  ↓
User is logged in and redirected to landing page
```

### Login Flow:
```
User fills form → Frontend calls loginBackend()
  ↓
POST /api/auth/login/ with {email, password}
  ↓
Backend validates credentials and returns {access, refresh} tokens
  ↓
Frontend calls GET /api/auth/profile/ with Bearer token
  ↓
Backend returns user profile data
  ↓
Frontend stores user data and tokens in localStorage
  ↓
User is logged in and redirected to landing page
```

## Verification

After registration/login, check:
1. **localStorage**: Should have `current_user` and `tokens` keys
2. **Django Admin**: User should appear in Users list
3. **Browser Console**: No errors
4. **Network Tab**: Successful API calls (status 200/201)

