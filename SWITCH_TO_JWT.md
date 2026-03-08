# Quick Guide: Switch to JWT Authentication

## Current Setup
Your app currently uses **localStorage-only authentication** (no backend required).

## To Enable JWT Authentication

### Step 1: Update App.tsx

Open `ai-career-compass/src/App.tsx` and change line 7:

```typescript
// BEFORE (localStorage only)
import { AuthProvider } from "@/contexts/AuthContext";

// AFTER (JWT with backend)
import { AuthProvider } from "@/contexts/AuthContext.API-Integrated";
```

### Step 2: Start Backend Server

Open a new terminal and run:

```bash
cd backend
python manage.py runserver
```

Keep this terminal running. Backend will be available at `http://localhost:8000`

### Step 3: Start Frontend

In another terminal:

```bash
cd ai-career-compass
npm run dev
```

### Step 4: Test It!

1. Go to `http://localhost:5173/auth`
2. Click "Sign Up" tab
3. Create a new account:
   - Name: Test User
   - Email: test@example.com
   - Password: test123456
4. You should be logged in and redirected to landing page
5. Open DevTools (F12) → Application → Local Storage
   - You should see `tokens` with JWT tokens
   - You should see `user` with user data

## What Changes?

### Before (localStorage only):
- ✅ Works without backend
- ❌ No real user accounts
- ❌ Data not saved to database
- ❌ Can't sync across devices

### After (JWT authentication):
- ✅ Real user accounts in database
- ✅ Secure authentication
- ✅ Data persists on server
- ✅ Can access from any device
- ❌ Requires backend server running

## Features You Get

1. **Real User Accounts**
   - Users stored in PostgreSQL/SQLite database
   - Passwords securely hashed
   - Email-based authentication

2. **JWT Tokens**
   - Access token (5 min expiry)
   - Refresh token (1 day expiry)
   - Automatic token refresh

3. **Protected API Endpoints**
   - User profile
   - Career progress
   - Saved careers
   - Roadmap data

4. **Security**
   - Server-side validation
   - Token-based authentication
   - Automatic logout on token expiry

## Using the API Client

Once JWT is enabled, you can make authenticated API calls:

```typescript
import { apiClient } from '@/services/apiClient';

// Public request (no auth needed)
const careers = await apiClient.get('/careers/');

// Protected request (requires login)
const profile = await apiClient.get('/users/profile/', true);

// POST with authentication
const result = await apiClient.post(
  '/careers/analyze/',
  { interests: 'I love coding' },
  true // requires auth
);
```

## Troubleshooting

### Backend Not Starting?

```bash
# Install dependencies
cd backend
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start server
python manage.py runserver
```

### CORS Errors?

Check `backend/.env`:
```env
FRONTEND_URL=http://localhost:5173
```

### Can't Login?

1. Check backend is running: `http://localhost:8000/api/`
2. Check frontend .env has: `VITE_API_URL=http://localhost:8000/api`
3. Clear localStorage and try again
4. Check browser console for errors

## Switch Back to localStorage

If you want to go back to localStorage-only:

In `ai-career-compass/src/App.tsx`:

```typescript
// Switch back to localStorage
import { AuthProvider } from "@/contexts/AuthContext";
```

No backend needed!

## Next Steps

After enabling JWT:

1. **Test all features**
   - Signup, login, logout
   - Profile page
   - Protected routes

2. **Integrate career data**
   - Save career analysis to backend
   - Sync roadmap progress
   - Store user preferences

3. **Add more features**
   - Password reset
   - Email verification
   - Social login (Google, GitHub)

## Need Help?

- Check `JWT_AUTHENTICATION_GUIDE.md` for detailed docs
- Test API endpoints: `http://localhost:8000/api/`
- View Django admin: `http://localhost:8000/admin/`
- Check backend logs in terminal
