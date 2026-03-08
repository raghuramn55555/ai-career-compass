# AI Chatbot Integration Guide

## Overview
The AI Career Assistant chatbot has been integrated into the Roadmap page, powered by Google Gemini AI.

## Changes Made

### 1. Roadmap Page Updates
- Changed "AI Assistant" button from redirecting to `/quiz` to opening a chatbot modal
- Added chatbot state management with `chatbotOpen` state
- Updated sidebar navigation to handle chatbot action

### 2. Chatbot Component (`src/components/Chatbot.tsx`)
- Created a full-featured chatbot modal with:
  - Real-time messaging interface
  - Google Gemini AI integration
  - Context-aware responses based on user's career and progress
  - Conversation history (last 5 messages)
  - Loading states and error handling
  - Smooth animations with Framer Motion

### 3. API Configuration
- **Frontend**: `VITE_GEMINI_API_KEY` in `ai-career-compass/.env`
- **Backend**: `GEMINI_API_KEY` in `backend/.env`
- Get your API key from: https://makersuite.google.com/app/apikey

## Features

### Context-Aware Responses
The chatbot knows about:
- User's selected career path
- Career description
- Total tasks in roadmap
- Completed tasks count
- Current milestone

### Conversation Flow
1. User types a message
2. Message is sent to Google Gemini API with:
   - System instruction (career context)
   - Last 5 messages for context
   - User's new message
3. AI generates a response (max 300 tokens)
4. Response is displayed in the chat

### Error Handling
If the API call fails, the chatbot provides a helpful fallback response with:
- General career advice
- Tips for learning
- Suggestions for the user's specific career

## Google Gemini API

### Endpoint
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
```

### Request Format
```json
{
  "system_instruction": {
    "parts": [{ "text": "System prompt with career context" }]
  },
  "contents": [
    {
      "role": "user",
      "parts": [{ "text": "User message" }]
    }
  ],
  "generationConfig": {
    "temperature": 0.7,
    "maxOutputTokens": 300
  }
}
```

### Response Format
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "AI response text"
          }
        ]
      }
    }
  ]
}
```

## Usage

### Opening the Chatbot
1. Navigate to the Roadmap page (`/roadmap`)
2. Click "AI Assistant" in the left sidebar
3. Chatbot modal opens in the bottom-right corner

### Chatting
- Type your question in the input field
- Press Enter or click the Send button
- AI responds with career-specific advice
- Conversation history is maintained

### Closing the Chatbot
- Click the X button in the header
- Click outside the modal (on the backdrop)

## Example Conversations

### Career Advice
**User**: "What should I focus on first?"
**AI**: "Based on your current milestone, I recommend focusing on [specific advice based on career and progress]..."

### Learning Tips
**User**: "How can I stay motivated?"
**AI**: "Here are some strategies for staying motivated in your journey to become a [career]..."

### Task Help
**User**: "I'm stuck on [topic]"
**AI**: "Let me help you with that. For [career], understanding [topic] is important because..."

## Testing

### Test the Chatbot
1. Start the frontend: `npm run dev` in `ai-career-compass/`
2. Login and complete the quiz to select a career
3. Navigate to Roadmap page
4. Click "AI Assistant" in sidebar
5. Try asking:
   - "What should I learn first?"
   - "How do I become a [your career]?"
   - "Give me study tips"
   - "What's the best way to practice?"

### Verify API Key
If you get errors, check:
1. `.env` file has `VITE_GEMINI_API_KEY` set
2. API key is valid (test at https://makersuite.google.com/)
3. Browser console for error messages
4. Network tab for API request/response

## API Key Management

### Getting a Gemini API Key
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key (starts with `AIzaSy...`)
5. Add to `.env` files

### Security Notes
⚠️ **Important**:
- Never commit API keys to Git
- `.env` files are in `.gitignore`
- In production, use environment variables
- Consider rate limiting for API calls
- Monitor API usage in Google Cloud Console

## Customization

### Changing AI Behavior
Edit the system instruction in `Chatbot.tsx`:
```typescript
const systemInstruction = `You are a helpful AI career assistant...`;
```

### Adjusting Response Length
Change `maxOutputTokens` in the API call:
```typescript
generationConfig: {
  temperature: 0.7,
  maxOutputTokens: 300, // Increase for longer responses
}
```

### Styling
The chatbot uses Tailwind CSS classes and can be customized:
- Modal size: `w-[400px] h-[600px]`
- Colors: Uses theme colors (primary, secondary, etc.)
- Position: `fixed bottom-4 right-4`

## Troubleshooting

### Chatbot doesn't open
- Check browser console for errors
- Verify `Chatbot` component is imported in `Roadmap.tsx`
- Check `chatbotOpen` state is working

### API errors
- Verify API key is correct
- Check network tab for 400/401 errors
- Ensure API key has proper permissions
- Check Gemini API quota/limits

### Slow responses
- Gemini API typically responds in 1-3 seconds
- Check network connection
- Consider reducing `maxOutputTokens`

### Fallback responses
- If you see generic responses, API call failed
- Check console for error details
- Verify API key and network connectivity

## Future Enhancements

Potential improvements:
- Save conversation history to localStorage
- Add voice input/output
- Support file uploads (images, documents)
- Multi-language support
- Suggested questions/prompts
- Integration with Study Tools
- Career-specific knowledge base
- Personalized learning recommendations
