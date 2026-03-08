# Quiz Format Guide

## 🎯 New Question & Answer Format

The quiz has been redesigned from a free-text input to a structured question-and-answer format for better career matching accuracy.

## 📋 Quiz Structure

### 8 Questions Total

1. **Activity Preferences** - What type of activities do you enjoy?
2. **Subject Interests** - Which subjects interest you most?
3. **Work Environment** - What kind of work environment appeals to you?
4. **Career Motivation** - What motivates you in your career?
5. **Skill Preferences** - Which skills do you want to use most?
6. **Work Style** - How do you prefer to work?
7. **Work Pace** - What's your ideal work pace?
8. **Education Level** - What level of education are you willing to pursue?

## 🎨 User Experience

### Visual Design
- **Progress Bar**: Shows completion percentage (Question X of 8)
- **Animated Transitions**: Smooth slide animations between questions
- **Radio Button Selection**: Clear visual feedback for selected answers
- **Navigation**: Back/Next buttons with disabled states
- **Loading State**: Animated "Analyzing Your Answers..." screen

### Flow
```
Start Quiz
    ↓
Question 1 → Select Answer → Next
    ↓
Question 2 → Select Answer → Next
    ↓
... (continue for all 8 questions)
    ↓
Question 8 → Select Answer → "See My Results"
    ↓
Analyzing Screen (1.5 seconds)
    ↓
Navigate to Results Page
```

## 🔍 How Matching Works

### 1. Answer Collection
Each answer option contains:
- **Label**: User-friendly text
- **Keywords**: Career-matching terms

Example:
```typescript
{
  id: 'helping',
  label: 'Helping and caring for others',
  keywords: ['help', 'care', 'support', 'people', 'community', 'compassion']
}
```

### 2. Interest Text Building
When user completes quiz:
```typescript
// Combine all selected answer labels
"Helping and caring for others. Science, Technology, Engineering, Math. 
Remote or flexible workspace. Making a positive impact on society..."

// Add all keywords for enhanced matching
+ "help care support people community compassion science technology 
engineering math computer code programming remote flexible..."
```

### 3. Career Analysis
The combined text is sent to the career matching algorithm:
```typescript
analyzeInterests(interestText, {})
```

This matches against career keywords to find the best fits.

## 📊 Question Breakdown

### Question 1: Activity Preferences
**Purpose**: Identify core work activities

Options:
- Helping and caring for others → Healthcare, Education, Social Work
- Creating and designing things → Creative, Tech, Architecture
- Analyzing data and solving problems → Tech, Science, Business
- Building and fixing things → Trades, Engineering

### Question 2: Subject Interests
**Purpose**: Match academic/professional domains

Options:
- STEM → Tech, Science, Engineering careers
- Arts & Design → Creative careers
- Health & Medicine → Healthcare careers
- Business & Finance → Business careers
- Psychology & Education → Education, Healthcare careers

### Question 3: Work Environment
**Purpose**: Match work setting preferences

Options:
- Office/Corporate → Business, Tech (office-based)
- Remote/Flexible → Tech, Creative (remote-friendly)
- Outdoor/Field → Science, Trades
- Hospital/Clinic/Lab → Healthcare, Science
- Studio/Creative → Creative, Design

### Question 4: Career Motivation
**Purpose**: Understand career drivers

Options:
- Social Impact → Healthcare, Education, Social Work
- Innovation → Tech, Science, Creative
- Financial Stability → Business, Tech, Legal
- Personal Growth → Education, Science
- Independence → Entrepreneurship, Creative

### Question 5: Skill Preferences
**Purpose**: Match skill utilization

Options:
- Technical/Analytical → Tech, Science, Engineering
- Creative/Artistic → Creative, Design
- Communication/People → Healthcare, Education, Business
- Leadership/Management → Business, Entrepreneurship
- Hands-on/Practical → Trades, Healthcare

### Question 6: Work Style
**Purpose**: Team vs individual preference

Options:
- Team-based → Healthcare, Business, Education
- Independent → Tech (some roles), Creative
- Mix of both → Most careers

### Question 7: Work Pace
**Purpose**: Match work rhythm

Options:
- Fast-paced → Tech startups, Healthcare (ER), Business
- Steady → Education, Government, Research
- Varied → Consulting, Entrepreneurship

### Question 8: Education Level
**Purpose**: Filter by education requirements

Options:
- Doctorate (8+ years) → Doctor, Psychologist, Lawyer
- Master's (6-7 years) → Data Scientist, Social Worker
- Bachelor's (4 years) → Engineer, Teacher, Nurse
- Associate/Certification (2 years) → Trades, Technical roles
- Self-taught → Software Engineer, Entrepreneur, Creative

## 🎯 Matching Algorithm

### Keyword Accumulation
```typescript
User answers Question 1: "Analyzing data and solving problems"
Keywords added: ['analyze', 'data', 'solve', 'problem', 'logic', 'math']

User answers Question 2: "STEM"
Keywords added: ['science', 'technology', 'engineering', 'math', 'computer', 'code']

... (continue for all 8 questions)

Final keyword pool: 40-60 keywords
```

### Career Scoring
```typescript
For each career:
  score = 0
  For each career keyword:
    If keyword in user's keyword pool:
      score += 1
  
  match_percentage = (score / total_career_keywords) * 100

Filter: Keep careers with score >= 2
Sort: By match_percentage (highest first)
```

### Example Match
```
User Keywords: [analyze, data, solve, problem, technology, code, programming, ...]

Software Engineer:
  Career Keywords: [code, programming, technology, software, data, problem, solving]
  Matches: code(✓), programming(✓), technology(✓), data(✓), problem(✓), solving(✓)
  Score: 6/7 = 86% match

Data Scientist:
  Career Keywords: [data, numbers, statistics, analysis, problem, solving]
  Matches: data(✓), analysis(✓), problem(✓), solving(✓)
  Score: 4/6 = 67% match

Chef:
  Career Keywords: [cook, food, create, taste, kitchen]
  Matches: None
  Score: 0/5 = 0% match (filtered out)
```

## 🎨 UI Components

### Progress Bar
```tsx
<div className="h-2 bg-secondary rounded-full">
  <motion.div
    className="h-full gradient-bg-primary"
    animate={{ width: `${progress}%` }}
  />
</div>
```

### Question Card
```tsx
<motion.div
  key={currentQuestion}
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: -20 }}
>
  <h2>{question.text}</h2>
  {/* Options */}
</motion.div>
```

### Answer Option
```tsx
<button
  onClick={() => handleAnswer(option.id)}
  className={isSelected ? 'border-primary bg-primary/10' : 'border-border'}
>
  <div className="radio-button">
    {isSelected && <Check />}
  </div>
  <span>{option.label}</span>
</button>
```

### Navigation
```tsx
<button onClick={handleBack} disabled={currentQuestion === 0}>
  <ChevronLeft /> Back
</button>

<button onClick={handleNext} disabled={!isAnswered}>
  {isLastQuestion ? 'See My Results' : 'Next'} <ChevronRight />
</button>
```

## 📱 Responsive Design

### Mobile (< 768px)
- Single column layout
- Larger touch targets
- Simplified navigation
- Full-width buttons

### Desktop (≥ 768px)
- Centered content (max-width: 768px)
- Hover effects on options
- Side-by-side navigation buttons

## ♿ Accessibility

- **Keyboard Navigation**: Tab through options, Enter to select
- **Screen Readers**: Proper ARIA labels
- **Focus States**: Clear visual indicators
- **Color Contrast**: WCAG AA compliant
- **Progress Indication**: Both visual and text

## 🔄 State Management

```typescript
const [currentQuestion, setCurrentQuestion] = useState(0);
const [answers, setAnswers] = useState<Record<number, string>>({});
const [loading, setLoading] = useState(false);
const [showResults, setShowResults] = useState(false);

// Answer format: { 0: 'helping', 1: 'stem', 2: 'remote', ... }
```

## 🚀 Future Enhancements

1. **Skip Questions**: Allow users to skip optional questions
2. **Question Branching**: Show different questions based on previous answers
3. **Save Progress**: Allow users to resume quiz later
4. **Retake Quiz**: Easy way to start over
5. **Question Explanations**: Help text for each question
6. **Answer Review**: Summary page before final submission
7. **Multiple Selection**: Some questions allow multiple answers
8. **Weighted Scoring**: Some questions count more than others

## 📊 Analytics Tracking

Track user behavior:
- Question completion rate
- Most common answer combinations
- Time spent per question
- Drop-off points
- Career match accuracy feedback

## 🎯 Benefits of Q&A Format

### vs Free Text Input

**Advantages:**
1. ✅ More structured data for matching
2. ✅ Easier for users (no writing required)
3. ✅ Consistent keyword extraction
4. ✅ Better mobile experience
5. ✅ Faster completion time
6. ✅ More accurate matching
7. ✅ Easier to analyze user patterns

**Trade-offs:**
1. ❌ Less personal/expressive
2. ❌ Limited to predefined options
3. ❌ May miss unique interests

**Solution**: Hybrid approach
- Q&A format for core matching
- Optional free-text field for additional context
- "Other" option in questions

## 🔧 Customization

### Adding New Questions
```typescript
{
  id: 9,
  question: "Your new question here?",
  options: [
    {
      id: 'option1',
      label: 'Option 1 label',
      keywords: ['keyword1', 'keyword2', ...]
    },
    // ... more options
  ]
}
```

### Modifying Keywords
Update keywords in each option to improve matching:
```typescript
keywords: ['old', 'keywords', 'new', 'better', 'keywords']
```

### Changing Question Order
Reorder questions in the `quizQuestions` array for better flow.

## 📝 Testing

### Manual Testing Checklist
- [ ] All questions display correctly
- [ ] Can select answers
- [ ] Back button works
- [ ] Next button enables after selection
- [ ] Progress bar updates
- [ ] Final submission works
- [ ] Results page shows matched careers
- [ ] Mobile responsive
- [ ] Keyboard navigation works

### Test Scenarios
1. **Tech Career Path**: Select all tech-related answers → Should match Software Engineer, Data Scientist
2. **Healthcare Path**: Select healthcare answers → Should match Doctor, Nurse
3. **Creative Path**: Select creative answers → Should match Designer, Architect
4. **Mixed Interests**: Select varied answers → Should show diverse career options

This new format provides a better user experience and more accurate career matching! 🎯
