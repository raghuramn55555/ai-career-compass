# Authentication System - localStorage Validation

## Overview
The authentication system now includes proper validation for both signup and login using localStorage.

## Features

### 1. Signup Validation
- **Email validation**: Checks for valid email format
- **Duplicate check**: Prevents registering with an already registered email
- **Password strength**: Requires minimum 6 characters
- **Required fields**: Name, email, and password must be provided
- **Password confirmation**: Ensures passwords match

### 2. Login Validation
- **Credential verification**: Checks email and password against registered users
- **Case-insensitive email**: Email matching is case-insensitive
- **Error messages**: Clear feedback for invalid credentials

### 3. localStorage Structure

#### Registered Users
```json
// Key: "registered_users"
[
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "joinDate": "3/2/2026"
  }
]
```

#### Current User
```json
// Key: "current_user"
{
  "name": "John Doe",
  "email": "john@example.com",
  "joinDate": "3/2/2026"
}
```

## Security Notes

⚠️ **Important**: This is a client-side demo implementation. In production:
- Never store passwords in plain text
- Use proper backend authentication with JWT tokens
- Hash passwords using bcrypt or similar
- Implement HTTPS
- Add rate limiting
- Use secure session management

## Testing the Authentication

### Test Scenario 1: New User Signup
1. Go to `/auth`
2. Click "Sign Up" tab
3. Enter:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "test123"
   - Confirm Password: "test123"
4. Click "Create Account"
5. ✅ User is created and logged in
6. Check localStorage: `registered_users` contains the new user

### Test Scenario 2: Duplicate Email Prevention
1. Try to sign up again with "test@example.com"
2. ❌ Error: "Email already registered. Please login."

### Test Scenario 3: Login with Valid Credentials
1. Logout
2. Go to `/auth`
3. Click "Login" tab
4. Enter:
   - Email: "test@example.com"
   - Password: "test123"
5. Click "Sign In"
6. ✅ User is logged in successfully

### Test Scenario 4: Login with Invalid Credentials
1. Try to login with wrong password
2. ❌ Error: "Invalid email or password"

### Test Scenario 5: Validation Errors
- Empty fields: "All fields are required"
- Short password: "Password must be at least 6 characters"
- Invalid email: "Invalid email format"
- Password mismatch: "Passwords do not match"

## How It Works

### Signup Flow
```
User submits form
  ↓
Validate input (email format, password length, required fields)
  ↓
Check if email already exists in registered_users
  ↓
If exists → Show error
  ↓
If new → Create user object with password
  ↓
Save to registered_users array in localStorage
  ↓
Set as current_user (without password)
  ↓
Update React state
  ↓
Navigate to landing page
```

### Login Flow
```
User submits form
  ↓
Validate input (required fields)
  ↓
Get registered_users from localStorage
  ↓
Find user with matching email and password
  ↓
If not found → Show error
  ↓
If found → Set as current_user (without password)
  ↓
Update React state
  ↓
Navigate to landing page
```

### Session Persistence
```
App loads
  ↓
AuthProvider initializes
  ↓
Check localStorage for current_user
  ↓
If exists and valid → Restore user session
  ↓
If not → User remains logged out
```

## API Integration Ready

The current implementation is ready to be replaced with backend API calls:

```typescript
// Replace localStorage logic with API calls
const signup = async (email: string, password: string, name: string) => {
  const response = await fetch('http://localhost:8000/api/users/register/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name })
  });
  
  if (!response.ok) {
    const error = await response.json();
    return { success: false, error: error.message };
  }
  
  const data = await response.json();
  // Store JWT token instead of user data
  localStorage.setItem('token', data.access);
  return { success: true };
};
```

## Clearing Test Data

To reset the authentication system:
```javascript
// Open browser console and run:
localStorage.removeItem('registered_users');
localStorage.removeItem('current_user');
// Then refresh the page
```
