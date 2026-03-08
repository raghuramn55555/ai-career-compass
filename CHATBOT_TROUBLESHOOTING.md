# Chatbot Troubleshooting Guide

## Quick Fixes

### 1. Restart the Development Server
Vite doesn't hot-reload environment variables. After adding/changing `.env` files:

```bash
# Stop the server (Ctrl+C)
# Then restart:
cd ai-career-compass
npm run dev
```

### 2. Clear Browser Cache
Sometimes the browser caches old code:
- Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Or open DevTools (F12) → Network tab → Check "Disable cache"

### 3. Check Browser Console
Open DevTools (F12) → Console tab to see detailed error logs:
- Look for messages starting with 🔑, 📝, 🎯, 🌐, 📡, ✅, or ❌
- These show the API call flow and any errors

## Testing the API Key

### Method 1: Use the Test HTML File
1. Open `test-gemini-api.html` in your browser
2. The API key should be pre-filled
3. Click "Test API"
4. You should see a success message with AI response

### Method 2: Test in Browser Console
Open DevTools Console and paste:

```javascript
const apiKey = 'YOUR_API_KEY_HERE'; // Replace with your actual API key
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: 'Say hello' }] }]
  })
})
.then(r => r.json())
.then(d => console.log('✅ Success:', d))
.catch(e => console.error('❌ Error:', e));
```

## Common Issues

### Issue 1: "I'm having trouble connecting to the AI service"
**Cause**: API call is failing

**Solutions**:
1. Check browser console for the actual error
2. Verify API key is correct in `.env` file
3. Restart dev server after changing `.env`
4. Test API key using the HTML test file

### Issue 2: API Key Not Loading
**Symptoms**: Console shows "🔑 API Key loaded: MISSING"

**Solutions**:
1. Verify `.env` file exists in `ai-career-compass/` folder
2. Check the variable name is exactly `VITE_GEMINI_API_KEY`
3. Restart the dev server (Vite only reads .env on startup)
4. Check there are no extra spaces or quotes around the key

### Issue 3: CORS Error
**Symptoms**: Console shows "CORS policy" error

**Solutions**:
- This shouldn't happen with Gemini API (it allows browser requests)
- If you see this, the API endpoint might be wrong
- Verify the URL is: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent`

### Issue 4: 400 Bad Request
**Symptoms**: Console shows "API Error: 400"

**Solutions**:
1. Check the request format in console logs
2. Verify the API endpoint includes `-latest` suffix
3. Make sure the request body has the correct structure

### Issue 5: 403 Forbidden / 401 Unauthorized
**Symptoms**: Console shows "API Error: 403" or "401"

**Solutions**:
1. API key is invalid or expired
2. Get a new key from https://makersuite.google.com/app/apikey
3. Update both `.env` files (frontend and backend)
4. Restart dev server

### Issue 6: 429 Too Many Requests
**Symptoms**: Console shows "API Error: 429"

**Solutions**:
- You've hit the rate limit
- Wait a few minutes before trying again
- Consider upgrading your Gemini API plan

## Verification Checklist

- [ ] `.env` file exists in `ai-career-compass/` folder
- [ ] `VITE_GEMINI_API_KEY=your_actual_api_key_here` is in the file
- [ ] Dev server was restarted after adding/changing `.env`
- [ ] Browser cache was cleared (Ctrl+Shift+R)
- [ ] Browser console shows no errors
- [ ] Test HTML file works successfully
- [ ] API key is valid (test at https://makersuite.google.com/)

## Debug Steps

### Step 1: Check Environment Variable
In browser console, type:
```javascript
console.log('API Key:', import.meta.env.VITE_GEMINI_API_KEY);
```

Expected: Should show your API key (or at least the first few characters)
If undefined: `.env` file not loaded or dev server not restarted

### Step 2: Check API Endpoint
Look for the 🌐 log in console when you send a message.
Expected: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=API_KEY_HIDDEN`

### Step 3: Check Response Status
Look for the 📡 log in console.
Expected: `Response status: 200`
If 400/401/403: API key or request format issue
If 429: Rate limit hit

### Step 4: Check Response Data
Look for the ✅ log in console.
Expected: Should show the full API response with candidates array

## Still Not Working?

### Get Detailed Logs
1. Open browser DevTools (F12)
2. Go to Console tab
3. Send a message in the chatbot
4. Look for all the emoji logs (🔑📝🎯🌐📡✅❌)
5. Copy the error message and check what it says

### Common Error Messages

**"API key not valid"**
- Get a new key from https://makersuite.google.com/app/apikey

**"Model not found"**
- Check the model name is `gemini-1.5-flash-latest`

**"Invalid argument"**
- Request body format is wrong (shouldn't happen with current code)

**"Network error"**
- Check your internet connection
- Try the test HTML file to isolate the issue

## Contact Support

If none of these solutions work:
1. Open `test-gemini-api.html` and click "Test API"
2. Take a screenshot of the result
3. Open browser console in the app
4. Send a chatbot message
5. Take a screenshot of all console logs
6. Share both screenshots for debugging

## Environment File Template

Your `ai-career-compass/.env` should look like this:

```env
# Backend API URL
VITE_API_URL=http://localhost:8000/api

# Enable LLM-powered analysis (requires backend API keys)
VITE_USE_LLM=false

# Google Gemini API Key for Chatbot
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

Replace `your_actual_api_key_here` with your real API key from https://makersuite.google.com/app/apikey

No quotes, no extra spaces, no comments on the same line as the value.
