# JWT Authentication Integration Guide

## Overview
This guide explains how to integrate JWT (JSON Web Token) authentication between the Django backend and React frontend.

## Backend Setup (Already Configured)

### Installed Packages
- `djangorestframework-simplejwt` - JWT authentication for Django REST Framework

### Available Endpoints

#### 1. Register (Sign Up)
```
POST /api/users/register/
Body: {
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}

Response: {
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2026-03-02T..."
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

#### 2. Login
```
POST /api/users/login/
Body: {
  "email": "user@example.com",
  "password": "password123"
}

Response: {
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### 3. Refresh Token
```
POST /api/users/token/refresh/
Body: {
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}

Response: {
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### 4. Get User Profile (Protected)
```
GET /api/users/profile/
Headers: {
  "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGc..."
}

Response: {
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2026-03-02T...",
  "progress": {...}
}
```

## Frontend Integration

### Files Created

1. **AuthContext.API-Integrated.tsx** - New auth context with JWT support
2. **apiClient.ts** - API client with automatic token refresh

### How to Switch to JWT Authentication

#### Step 1: Update Main App File

Replace the current AuthContext import in `main.tsx`:

```typescript
// OLD
import { AuthProvider } from '@/contexts/AuthContext';

// NEW
import { AuthProvider } from '@/contexts/AuthContext.API-Integrated';
```

#### Step 2: Start Backend Server

```bash
cd backend
python manage.py runserver
```

Backend will run on `http://localhost:8000`

#### Step 3: Update Frontend .env

Ensure your `.env` file has:
```env
VITE_API_URL=http://localhost:8000/api
```

#### Step 4: Test Authentication

1. Go to `/auth` page
2. Try signing up with a new account
3. Try logging in with existing credentials
4. Check browser DevTools → Application → Local Storage
   - Should see `tokens` with access and refresh tokens
   - Should see `user` with user data

## Features

### 1. Automatic Token Refresh
- Access tokens expire after 5 minutes
- Frontend automatically refreshes tokens every 4 minutes
- If refresh fails, user is logged out

### 2. Protected API Requests
```typescript
import { apiClient } from '@/services/apiClient';

// Public request
const data = await apiClient.get('/careers/');

// Protected request (requires authentication)
const profile = await apiClient.get('/users/profile/', true);

// POST with authentication
const result = await apiClient.post('/careers/save/', { career_id: 1 }, true);
```

### 3. Token Storage
- Tokens stored in localStorage
- Automatically included in API requests
- Cleared on logout

### 4. Error Handling
- 401 Unauthorized → Attempts token refresh
- If refresh fails → Redirects to login
- Network errors → Shows user-friendly message

## API Client Usage Examples

### GET Request
```typescript
import { apiClient } from '@/services/apiClient';

// Public endpoint
const careers = await apiClient.get('/careers/');

// Protected endpoint
const profile = await apiClient.get('/users/profile/', true);
```

### POST Request
```typescript
// Create career analysis
const analysis = await apiClient.post(
  '/careers/analyze/',
  { interests: 'I love coding and solving problems' },
  true // requires authentication
);
```

### PUT/PATCH Request
```typescript
// Update user profile
const updated = await apiClient.patch(
  '/users/profile/',
  { name: 'New Name' },
  true
);
```

### DELETE Request
```typescript
// Delete saved career
await apiClient.delete('/careers/saved/1/', true);
```

## Security Best Practices

### 1. Token Expiration
- Access tokens: 5 minutes (short-lived)
- Refresh tokens: 1 day (longer-lived)
- Tokens automatically refreshed before expiration

### 2. Secure Storage
- Tokens stored in localStorage (acceptable for SPAs)
- For higher security, consider httpOnly cookies (requires backend changes)

### 3. HTTPS in Production
- Always use HTTPS in production
- Tokens transmitted over encrypted connection

### 4. Token Validation
- Backend validates tokens on every request
- Invalid/expired tokens rejected with 401

## Testing JWT Authentication

### Test 1: Sign Up
```bash
curl -X POST http://localhost:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456",
    "name": "Test User"
  }'
```

### Test 2: Login
```bash
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }'
```

### Test 3: Access Protected Endpoint
```bash
# Replace TOKEN with actual access token from login response
curl -X GET http://localhost:8000/api/users/profile/ \
  -H "Authorization: Bearer TOKEN"
```

### Test 4: Refresh Token
```bash
# Replace REFRESH_TOKEN with actual refresh token
curl -X POST http://localhost:8000/api/users/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "REFRESH_TOKEN"
  }'
```

## Troubleshooting

### Issue 1: "Authentication credentials were not provided"
**Cause**: Missing or invalid Authorization header

**Solution**:
- Check that token is in localStorage
- Verify `requiresAuth` parameter is `true`
- Check token format: `Bearer <token>`

### Issue 2: "Token is invalid or expired"
**Cause**: Access token has expired

**Solution**:
- API client automatically refreshes tokens
- If refresh fails, user needs to login again
- Check refresh token is still valid

### Issue 3: CORS Errors
**Cause**: Backend not allowing frontend origin

**Solution**:
- Check `FRONTEND_URL` in backend `.env`
- Verify CORS settings in `settings.py`
- Ensure backend is running

### Issue 4: "Network Error"
**Cause**: Backend not running or wrong URL

**Solution**:
- Start backend: `python manage.py runserver`
- Check `VITE_API_URL` in frontend `.env`
- Verify backend is accessible at the URL

## Migration Checklist

- [ ] Backend server is running
- [ ] Frontend `.env` has correct `VITE_API_URL`
- [ ] Updated `main.tsx` to use new AuthContext
- [ ] Tested signup flow
- [ ] Tested login flow
- [ ] Tested protected routes
- [ ] Verified token refresh works
- [ ] Tested logout functionality

## Comparison: LocalStorage vs JWT

### Current (LocalStorage Only)
- ✅ Simple implementation
- ✅ Works offline
- ❌ No server validation
- ❌ Data not synced across devices
- ❌ No real user accounts

### New (JWT Authentication)
- ✅ Real user accounts in database
- ✅ Server-side validation
- ✅ Secure token-based auth
- ✅ Data synced across devices
- ✅ Can integrate with other services
- ❌ Requires backend server running

## Next Steps

After implementing JWT authentication, you can:

1. **Add Password Reset**
   - Email-based password reset flow
   - Secure token generation

2. **Social Authentication**
   - Google OAuth
   - GitHub OAuth

3. **User Roles & Permissions**
   - Admin users
   - Premium features

4. **Session Management**
   - View active sessions
   - Logout from all devices

5. **Two-Factor Authentication**
   - TOTP-based 2FA
   - SMS verification

## Support

If you encounter issues:
1. Check browser console for errors
2. Check backend logs: `python manage.py runserver`
3. Verify tokens in localStorage
4. Test API endpoints with curl/Postman
5. Check network tab in DevTools
