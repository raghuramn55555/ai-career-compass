# API Flow Diagrams

## 🔄 Complete System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend                            │
│                  (localhost:5173)                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Landing  │  │   Auth   │  │   Quiz   │  │ Results  │   │
│  │  Page    │  │   Page   │  │   Page   │  │   Page   │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │             │              │              │          │
│  ┌────┴─────────────┴──────────────┴──────────────┴─────┐  │
│  │           API Service (api.ts)                        │  │
│  │  • authAPI.login/register                             │  │
│  │  • careerAPI.analyzeInterests                         │  │
│  │  • careerAPI.generateRoadmap                          │  │
│  └───────────────────────┬───────────────────────────────┘  │
│                          │ HTTP/REST                         │
└──────────────────────────┼───────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  Django Backend                              │
│                 (localhost:8000)                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │   Users App      │         │   Careers App    │         │
│  ├──────────────────┤         ├──────────────────┤         │
│  │ /api/auth/       │         │ /api/careers/    │         │
│  │ • register/      │         │ • list/          │         │
│  │ • login/         │         │ • analyze/       │         │
│  │ • profile/       │         │ • saved/         │         │
│  └────────┬─────────┘         │ • roadmap/       │         │
│           │                   │ • history/       │         │
│           │                   └────────┬─────────┘         │
│           │                            │                    │
│           ▼                            ▼                    │
│  ┌─────────────────────────────────────────────┐           │
│  │          SQLite Database                     │           │
│  │  • User (auth, progress)                    │           │
│  │  • Career (career data)                     │           │
│  │  • CareerAnalysis (history)                 │           │
│  │  • SavedCareer (bookmarks)                  │           │
│  │  • Roadmap (learning paths)                 │           │
│  └─────────────────────────────────────────────┘           │
│                            │                                 │
│                            ▼                                 │
│  ┌─────────────────────────────────────────────┐           │
│  │        Career Matching Engine                │           │
│  ├─────────────────────────────────────────────┤           │
│  │  ┌──────────────┐    ┌──────────────────┐  │           │
│  │  │ Rule-Based   │    │   LLM Service    │  │           │
│  │  │   Matcher    │    │  (Optional)      │  │           │
│  │  │  (Default)   │    │                  │  │           │
│  │  └──────────────┘    └────────┬─────────┘  │           │
│  └─────────────────────────────────┼───────────┘           │
└────────────────────────────────────┼───────────────────────┘
                                     │
                                     ▼
                          ┌──────────────────────┐
                          │   LLM APIs           │
                          │  • OpenAI GPT        │
                          │  • Anthropic Claude  │
                          └──────────────────────┘
```

---

## 📱 User Journey: Career Discovery

```
┌─────────────────────────────────────────────────────────────┐
│                    USER JOURNEY                              │
└─────────────────────────────────────────────────────────────┘

1️⃣ REGISTRATION
   User fills form → Auth.tsx
                      ↓
   POST /api/auth/register/
   { username, email, password }
                      ↓
   Backend creates user
                      ↓
   Returns { user, tokens }
                      ↓
   Store tokens in localStorage
                      ↓
   Redirect to Quiz

2️⃣ INTEREST ANALYSIS
   User enters interests → Quiz.tsx
   "I love coding and solving problems"
                      ↓
   POST /api/careers/analyze/
   {
     text: "I love coding...",
     quiz_answers: {...},
     use_llm: false
   }
                      ↓
   Backend processes:
   ┌─────────────────────────┐
   │ use_llm == false?       │
   ├─────────────────────────┤
   │ YES → CareerMatcher     │
   │  • Extract keywords     │
   │  • Score careers        │
   │  • Filter (score >= 2)  │
   │                         │
   │ NO → LLMService         │
   │  • Call OpenAI/Claude   │
   │  • Parse response       │
   │  • Fallback on error    │
   └─────────────────────────┘
                      ↓
   Returns matched careers
   {
     careers: [
       {
         title: "Software Engineer",
         match_percentage: 85,
         match_reason: "You mentioned coding..."
       }
     ],
     keywords_detected: ["coding", "problem"],
     personality: ["Analytical"]
   }
                      ↓
   Display on Results.tsx
   (Only matched careers, no category filters)

3️⃣ SAVE CAREER
   User clicks bookmark → Results.tsx
                      ↓
   POST /api/careers/saved/
   { career_id: "software-engineer" }
                      ↓
   Backend toggles save
                      ↓
   Returns { message: "Career saved" }
                      ↓
   Update UI (filled bookmark icon)

4️⃣ GENERATE ROADMAP
   User clicks "View Roadmap" → Results.tsx
                      ↓
   POST /api/careers/roadmap/generate/
   {
     career_id: "software-engineer",
     use_llm: false
   }
                      ↓
   Backend generates:
   ┌─────────────────────────┐
   │ use_llm == false?       │
   ├─────────────────────────┤
   │ YES → CareerMatcher     │
   │  • Generate 4 milestones│
   │  • 4 tasks per milestone│
   │  • XP, time, priority   │
   │                         │
   │ NO → LLMService         │
   │  • Call LLM API         │
   │  • Generate custom path │
   │  • Personalized tasks   │
   └─────────────────────────┘
                      ↓
   Returns roadmap
   {
     milestones: [
       {
         id: "m1",
         title: "Tech Foundations",
         tasks: [...]
       }
     ]
   }
                      ↓
   Display on Roadmap.tsx

5️⃣ COMPLETE TASK
   User checks task → Roadmap.tsx
                      ↓
   Update local state
                      ↓
   PUT /api/auth/profile/
   {
     points: user.points + task.xp,
     tasks_completed: user.tasks_completed + 1
   }
                      ↓
   Backend updates user
                      ↓
   Returns updated profile
                      ↓
   Update UI (points, level, progress)

6️⃣ VIEW PROFILE
   User navigates to Profile → Profile.tsx
                      ↓
   GET /api/auth/profile/
                      ↓
   Returns user data
   {
     points, level, streak,
     tasks_completed, study_hours
   }
                      ↓
   GET /api/careers/saved/
                      ↓
   Returns saved careers
                      ↓
   GET /api/careers/history/
                      ↓
   Returns analysis history
                      ↓
   Display all data on Profile page
```

---

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                 AUTHENTICATION FLOW                          │
└─────────────────────────────────────────────────────────────┘

REGISTRATION
   Auth.tsx (Register form)
      ↓
   authAPI.register(username, email, password)
      ↓
   POST /api/auth/register/
      ↓
   Django creates user
      ↓
   Generate JWT tokens
      ↓
   Response: {
     user: { id, username, email, ... },
     tokens: {
       access: "eyJ0eXAiOiJKV1QiLCJhbGc...",
       refresh: "eyJ0eXAiOiJKV1QiLCJhbGc..."
     }
   }
      ↓
   Store in localStorage:
   • access_token
   • refresh_token
      ↓
   Set user in AuthContext
      ↓
   Redirect to /quiz

LOGIN
   Auth.tsx (Login form)
      ↓
   authAPI.login(email, password)
      ↓
   POST /api/auth/login/
      ↓
   Django validates credentials
      ↓
   Generate JWT tokens
      ↓
   Response: {
     access: "eyJ0eXAiOiJKV1QiLCJhbGc...",
     refresh: "eyJ0eXAiOiJKV1QiLCJhbGc..."
   }
      ↓
   Store tokens
      ↓
   GET /api/auth/profile/
      ↓
   Load user data
      ↓
   Set user in AuthContext
      ↓
   Redirect to /quiz

AUTHENTICATED REQUEST
   Any API call
      ↓
   Axios interceptor adds:
   Authorization: Bearer <access_token>
      ↓
   Django validates token
      ↓
   ✓ Valid → Process request
   ✗ Invalid (401) → Refresh token

TOKEN REFRESH
   API returns 401
      ↓
   Axios interceptor catches
      ↓
   POST /api/auth/token/refresh/
   { refresh: <refresh_token> }
      ↓
   Django validates refresh token
      ↓
   Generate new access token
      ↓
   Response: {
     access: "new_token..."
   }
      ↓
   Update localStorage
      ↓
   Retry original request
      ↓
   ✓ Success
   ✗ Refresh failed → Logout user
```

---

## 🎯 Career Analysis Flow (Detailed)

```
┌─────────────────────────────────────────────────────────────┐
│              CAREER ANALYSIS FLOW                            │
└─────────────────────────────────────────────────────────────┘

USER INPUT
   Quiz.tsx
   User types: "I love coding, building apps, and solving problems"
   Quiz answers: {
     interestAreas: ["technology", "creative"],
     careerGoal: "solve-problems",
     skillPreference: "analytical"
   }
      ↓
   handleAnalyze() or handleRefine()
      ↓
   careerAPI.analyzeInterests(text, quizAnswers, useLLM)
      ↓
   POST /api/careers/analyze/
   {
     "text": "I love coding, building apps, and solving problems",
     "quiz_answers": {
       "interestAreas": ["technology", "creative"],
       "careerGoal": "solve-problems",
       "skillPreference": "analytical"
     },
     "use_llm": false
   }

BACKEND PROCESSING
      ↓
   AnalyzeInterestsView.post()
      ↓
   ┌─────────────────────────────────────────┐
   │ Check use_llm parameter                 │
   └─────────────────────────────────────────┘
      ↓
   ┌─────────────────┐    ┌──────────────────┐
   │ use_llm=false   │    │  use_llm=true    │
   │ (Default)       │    │  (Optional)      │
   └────────┬────────┘    └────────┬─────────┘
            │                      │
            ▼                      ▼
   ┌─────────────────┐    ┌──────────────────┐
   │ CareerMatcher   │    │  LLMService      │
   │ (Rule-based)    │    │  (AI-powered)    │
   └────────┬────────┘    └────────┬─────────┘
            │                      │
            ▼                      ▼
   
   RULE-BASED MATCHER:
   1. Extract words from text
      ["love", "coding", "building", "apps", "solving", "problems"]
   
   2. Remove stopwords
      ["coding", "building", "apps", "solving", "problems"]
   
   3. Detect interest keywords
      • "coding" → technology
      • "building" → create
      • "solving" → solve
      • "problems" → solve
   
   4. Score each career
      For each career in database:
        score = 0
        For each career keyword:
          If keyword in user words:
            score += 1
      
      Software Engineer:
        Keywords: [code, programming, build, software, app, problem, solving]
        Matches: coding(1), building(1), apps(1), solving(1), problems(1)
        Score: 5
        Match %: (5 / 7) * 100 = 71%
      
      Data Scientist:
        Keywords: [data, numbers, analysis, problem, solving]
        Matches: solving(1), problems(1)
        Score: 2
        Match %: (2 / 5) * 100 = 40%
   
   5. Filter careers (score >= 2)
      Keep: Software Engineer (5), Data Scientist (2), UX Designer (3)
      Remove: Chef (0), Lawyer (1)
   
   6. Sort by match percentage
      [Software Engineer (71%), UX Designer (60%), Data Scientist (40%)]
   
   LLM SERVICE:
   1. Build prompt
      "Analyze this person's career interests:
       User Input: 'I love coding...'
       Quiz Answers: {...}
       
       Provide JSON with:
       - keywords_detected
       - personality_traits
       - recommended_careers with match_percentage"
   
   2. Call OpenAI/Claude API
      response = openai.ChatCompletion.create(...)
   
   3. Parse JSON response
      Extract careers, keywords, personality
   
   4. Fallback on error
      If API fails → Use CareerMatcher

RESPONSE
      ↓
   Save to CareerAnalysis model
      ↓
   Return to frontend:
   {
     "careers": [
       {
         "career_id": "software-engineer",
         "title": "Software Engineer",
         "match_percentage": 71,
         "match_reason": "You mentioned coding, building, apps, solving, problems",
         "category": "Tech",
         "education": "CS Degree / Self-taught",
         "salary": "$90K–$250K",
         "work_style": "Remote / Office",
         "skills": ["Programming", "Problem Solving", "System Design"],
         "color": "hsl(190, 90%, 50%)"
       },
       {
         "career_id": "ux-designer",
         "title": "UX/UI Designer",
         "match_percentage": 60,
         "match_reason": "You mentioned building, apps, creative",
         ...
       }
     ],
     "keywords_detected": ["coding", "building", "apps", "solving", "problems"],
     "categories": [
       { "name": "Technology", "percentage": 70 },
       { "name": "Creative", "percentage": 30 }
     ],
     "personality": ["Analytical", "Tech-Savvy", "Problem Solver"],
     "input_text": "I love coding, building apps, and solving problems"
   }

FRONTEND DISPLAY
      ↓
   Results.tsx
      ↓
   Display ONLY matched careers (3 careers, not all 20)
   NO category filter tabs (already filtered)
   Show match percentage and reason for each
```

---

## 🗺️ Roadmap Generation Flow

```
┌─────────────────────────────────────────────────────────────┐
│            ROADMAP GENERATION FLOW                           │
└─────────────────────────────────────────────────────────────┘

USER ACTION
   Results.tsx
   User clicks "View Roadmap" on Software Engineer card
      ↓
   handleViewRoadmap(career)
      ↓
   careerAPI.generateRoadmap("software-engineer", useLLM)
      ↓
   POST /api/careers/roadmap/generate/
   {
     "career_id": "software-engineer",
     "use_llm": false
   }

BACKEND PROCESSING
      ↓
   GenerateRoadmapView.post()
      ↓
   Get Career from database
      ↓
   ┌─────────────────────────────────────────┐
   │ Check use_llm parameter                 │
   └─────────────────────────────────────────┘
      ↓
   ┌─────────────────┐    ┌──────────────────┐
   │ use_llm=false   │    │  use_llm=true    │
   └────────┬────────┘    └────────┬─────────┘
            │                      │
            ▼                      ▼
   CareerMatcher          LLMService
   .generate_roadmap()    .generate_roadmap()
            │                      │
            ▼                      ▼
   
   Generate 4 milestones:
   1. Tech Foundations
   2. CS Degree Preparation
   3. Skill Development
   4. Career Launch
   
   Each milestone has 4 tasks:
   • Task title
   • XP points (50-150)
   • Time estimate
   • Priority (high/medium/low)
   • Completed status (false)
      ↓
   Save to Roadmap model
      ↓
   Return:
   {
     "id": 1,
     "career": { career_id, title, ... },
     "milestones": [
       {
         "id": "m1",
         "title": "Tech Foundations",
         "description": "Build core knowledge in software engineering",
         "tasks": [
           {
             "id": "t1",
             "title": "Research Software Engineer career path",
             "xp": 50,
             "time": "1 hour",
             "completed": false,
             "priority": "high"
           },
           ...
         ]
       },
       ...
     ],
     "created_at": "2024-01-15T10:30:00Z"
   }

FRONTEND DISPLAY
      ↓
   Roadmap.tsx
      ↓
   Display milestones with progress bars
   Show tasks with checkboxes
   Track XP and completion
```

This comprehensive guide shows exactly where and how every API is used in your application!