# Debug Authentication Issue

## What I Just Fixed

### Critical Bug Found! 🐛
The `Auth.tsx` page was NOT awaiting the async `login()` and `signup()` functions. This caused the code to try to access `.success` and `.error` properties on a Promise object instead of the actual result.

### The Fix
```typescript
// BEFORE (Wrong - not awaiting)
const result = signup(email, password, name);
if (!result.success) { ... }

// AFTER (Correct - awaiting the Promise)
const result = await signup(email, password, name);
if (!result.success) { ... }
```

Also changed the function signature:
```typescript
// BEFORE
const handleSubmit = (e: React.FormEvent) => {

// AFTER
const handleSubmit = async (e: React.FormEvent) => {
```

## Testing Steps

### Step 1: Verify Backend is Running
```bash
curl http://localhost:8000/admin/
```
Should return the Django admin page (not 404).

### Step 2: Test with HTML Test Page
1. Open `test-auth-api.html` in your browser
2. Click "Test Connection" - should show ✅ Backend is reachable
3. Click "Register" - should show success with user data and tokens
4. Click "Login" - should show success with JWT tokens
5. Click "Get Profile" - should show user profile data
6. Click "Check Storage" - should show tokens and user data

### Step 3: Test Frontend Application
1. **Restart the frontend dev server** (important!):
   ```bash
   cd ai-career-compass
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. Open browser to `http://localhost:5173/auth`

3. Open DevTools (F12):
   - Go to Console tab
   - Go to Network tab

4. Try to register:
   - Name: Frontend Test
   - Email: frontend@test.com
   - Password: test123456
   - Confirm: test123456
   - Click "Create Account"

5. Check Console for:
   - ✅ No errors
   - ✅ No "Backend signup failed" message
   - ❌ Any error messages

6. Check Network tab for:
   - ✅ POST request to `http://localhost:8000/api/auth/register/`
   - ✅ Status 201 (Created)
   - ✅ Response contains `user` and `tokens`

7. Check Application tab → Local Storage:
   - ✅ `current_user` key exists
   - ✅ `tokens` key exists with `access` and `refresh`

8. Verify in Django Admin:
   - Go to `http://localhost:8000/admin/`
   - Login with superuser
   - Click "Users"
   - ✅ Should see "frontend" or "Frontend Test" user

## Common Error Messages & Solutions

### Error: "Authentication failed"
**Possible Causes:**
1. Backend not running
2. CORS blocking requests
3. Wrong API endpoint
4. Network error

**Debug:**
```javascript
// Open browser console and run:
fetch('http://localhost:8000/api/auth/register/', {method: 'OPTIONS'})
  .then(r => console.log('Backend reachable:', r.ok))
  .catch(e => console.error('Backend error:', e));
```

### Error: "Network error. Using local storage."
**Cause:** Frontend can't reach backend

**Solutions:**
1. Start backend: `cd backend && python manage.py runserver`
2. Check backend is on port 8000
3. Check CORS settings in `backend/config/settings.py`

### Error: "Page not found (404)"
**Cause:** Wrong API endpoint

**Check:** Network tab should show requests to `/api/auth/` not `/api/users/`

### Error: "username field is required"
**Cause:** Backend expects username in registration

**Fixed:** AuthContext now sends username field

### Error: "Cannot read property 'success' of undefined"
**Cause:** Not awaiting async function

**Fixed:** Added `await` to login/signup calls in Auth.tsx

## Verification Checklist

- [ ] Backend server running on port 8000
- [ ] Frontend server restarted after code changes
- [ ] `test-auth-api.html` shows all tests passing
- [ ] Browser console shows no errors
- [ ] Network tab shows successful API calls
- [ ] localStorage has `tokens` and `current_user`
- [ ] Django admin shows registered users

## Current Configuration

### Backend (Django)
- URL: `http://localhost:8000`
- Endpoints:
  - POST `/api/auth/register/` - Register new user
  - POST `/api/auth/login/` - Login and get JWT tokens
  - GET `/api/auth/profile/` - Get user profile (requires auth)
  - POST `/api/auth/token/refresh/` - Refresh access token

### Frontend (React)
- URL: `http://localhost:5173`
- Environment: `.env` file
  - `VITE_API_URL=http://localhost:8000/api`
  - `VITE_USE_BACKEND=true`

### CORS Settings
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
CORS_ALLOW_CREDENTIALS = True
```

## Test Users

### Superuser (Admin)
- Email: koushikpadala83@gmail.com
- Access: Django admin panel

### Test Users Created
- testuser@example.com (password: test123456)
- debugtest@example.com (password: debug123456)

## Files Modified

1. ✅ `ai-career-compass/src/contexts/AuthContext.tsx`
   - Fixed API endpoints (/api/auth/ instead of /api/users/)
   - Added username field to registration
   - Fixed response field mapping

2. ✅ `ai-career-compass/src/pages/Auth.tsx`
   - Made handleSubmit async
   - Added await to login/signup calls

## Next Steps

1. **Restart frontend server** (most important!)
2. Open `test-auth-api.html` to verify backend
3. Test registration in frontend app
4. Check Django admin for new users
5. If still failing, check browser console for specific error

## Advanced Debugging

### Check Backend Logs
When you run `python manage.py runserver`, watch the terminal for:
```
POST /api/auth/register/ HTTP/1.1" 201
POST /api/auth/login/ HTTP/1.1" 200
GET /api/auth/profile/ HTTP/1.1" 200
```

### Check Frontend Network Requests
In DevTools → Network tab, look for:
- Request URL: `http://localhost:8000/api/auth/register/`
- Request Method: POST
- Status Code: 201 (success) or 400/500 (error)
- Response: Should contain `user` and `tokens` objects

### Manual API Test
```bash
# Test registration
curl http://localhost:8000/api/auth/register/ -Method POST -ContentType "application/json" -Body '{"email":"manual@test.com","password":"test123","username":"manualtest"}' -UseBasicParsing

# Test login
curl http://localhost:8000/api/auth/login/ -Method POST -ContentType "application/json" -Body '{"email":"manual@test.com","password":"test123"}' -UseBasicParsing
```

## If Still Not Working

1. **Clear browser cache and localStorage**:
   ```javascript
   // In browser console:
   localStorage.clear();
   location.reload();
   ```

2. **Check environment variables are loaded**:
   ```javascript
   // In browser console:
   console.log('API URL:', import.meta.env.VITE_API_URL);
   console.log('Use Backend:', import.meta.env.VITE_USE_BACKEND);
   ```

3. **Test with curl** to isolate frontend vs backend issues

4. **Check for CORS errors** in console (red text mentioning CORS)

5. **Verify Django settings** have correct CORS configuration

## Success Indicators

When everything works correctly:
1. ✅ No console errors
2. ✅ Redirects to landing page after signup
3. ✅ localStorage has tokens
4. ✅ User appears in Django admin
5. ✅ Can login with registered credentials
6. ✅ Profile data loads correctly

