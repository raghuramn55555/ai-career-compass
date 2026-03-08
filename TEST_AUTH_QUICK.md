# Quick Authentication Test

## What Was Fixed

1. **URL Endpoints**: Changed from `/api/users/` to `/api/auth/`
2. **Registration Fields**: Added `username` field (required by backend)
3. **Response Mapping**: Fixed field names (`join_date` vs `created_at`)
4. **Username Handling**: Uses name as username, or email prefix if no name provided

## Test Now

### Option 1: Test via Frontend (Recommended)

1. **Make sure backend is running**:
   ```bash
   cd backend
   python manage.py runserver
   ```

2. **Restart frontend** (to pick up AuthContext changes):
   - Stop the dev server (Ctrl+C)
   - Start it again:
   ```bash
   cd ai-career-compass
   npm run dev
   ```

3. **Test Registration**:
   - Go to: `http://localhost:5173/auth`
   - Click "Sign Up"
   - Fill in:
     - Name: Test Frontend
     - Email: frontend@test.com
     - Password: test123456
     - Confirm: test123456
   - Click "Create Account"

4. **Verify Success**:
   - Should redirect to landing page
   - Open DevTools → Console (should see no errors)
   - Open DevTools → Application → Local Storage
     - Should see `current_user` with your data
     - Should see `tokens` with access and refresh tokens

5. **Verify in Django Admin**:
   - Go to: `http://localhost:8000/admin/`
   - Login with: koushikpadala83@gmail.com
   - Click "Users"
   - Should see "Test Frontend" or "frontend" in the list!

### Option 2: Test via API (Quick Check)

```bash
# Test registration
curl http://localhost:8000/api/auth/register/ -Method POST -ContentType "application/json" -Body '{"email":"api@test.com","password":"api123456","username":"apitest"}' -UseBasicParsing

# Test login
curl http://localhost:8000/api/auth/login/ -Method POST -ContentType "application/json" -Body '{"email":"api@test.com","password":"api123456"}' -UseBasicParsing
```

## What to Look For

### ✅ Success Indicators:
- No console errors
- Redirects to landing page after signup/login
- `tokens` in localStorage
- User appears in Django admin
- Network tab shows 200/201 status codes

### ❌ Failure Indicators:
- "Network error. Using local storage." in console
- No `tokens` in localStorage (only `current_user`)
- User NOT in Django admin
- CORS errors in console
- 404 or 500 errors in Network tab

## Troubleshooting

### If registration fails:
1. Check backend is running: `http://localhost:8000/admin/`
2. Check console for errors
3. Check Network tab for failed requests
4. Verify `.env` has `VITE_USE_BACKEND=true`

### If user not in Django admin:
- Registration fell back to localStorage
- Check console for "Backend signup failed" message
- Backend might not be running
- CORS might be blocking requests

## Expected Behavior

### With Backend Enabled (`VITE_USE_BACKEND=true`):
1. Tries backend first
2. If backend fails → Falls back to localStorage
3. Shows console message if fallback occurs

### With Backend Disabled (`VITE_USE_BACKEND=false`):
1. Uses localStorage only
2. Users NOT saved to database
3. No API calls made

## Current Status

- ✅ Backend running on port 8000
- ✅ Backend API tested and working
- ✅ Frontend AuthContext updated
- ✅ CORS configured
- ✅ Environment variables set
- 🔄 Need to restart frontend to apply changes
- 🔄 Need to test registration via frontend

## Next Action

**Restart the frontend dev server** to pick up the AuthContext changes, then test registration!

