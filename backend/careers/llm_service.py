import json
from django.conf import settings
from typing import Dict, List, Any

# Gemini models in priority order — falls back to next on 429 quota errors
GEMINI_MODEL_FALLBACK = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.5-flash-lite',
]

class LLMService:
    """Service for LLM-powered career analysis"""
    
    def __init__(self):
        self.provider = settings.LLM_PROVIDER
        
        if self.provider == 'openai':
            import openai
            openai.api_key = settings.OPENAI_API_KEY
            self.client = openai
        elif self.provider == 'anthropic':
            import anthropic
            self.client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        elif self.provider == 'gemini':
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.client = genai
        else:
            self.client = None
    
    def analyze_career_interests(self, user_text: str, quiz_data: Dict = None) -> Dict[str, Any]:
        """
        Use LLM to analyze user interests and provide career recommendations
        """
        prompt = self._build_analysis_prompt(user_text, quiz_data)
        
        try:
            if self.provider == 'openai':
                response = self._call_openai(prompt)
            elif self.provider == 'anthropic':
                response = self._call_anthropic(prompt)
            elif self.provider == 'gemini':
                response = self._call_gemini(prompt)
            else:
                return self._fallback_analysis(user_text)
            
            return self._parse_llm_response(response)
        except Exception as e:
            print(f"LLM Error: {e}")
            return self._fallback_analysis(user_text)
    
    def generate_roadmap(self, career_title: str, user_level: str = "beginner") -> List[Dict]:
        """Generate personalized learning roadmap using LLM"""
        prompt = f"""Generate a detailed learning roadmap for becoming a {career_title}.
        User level: {user_level}
        Create 4 milestones with 4 tasks each. Return ONLY valid JSON array, no markdown:
        [
          {{
            "id": "m1",
            "title": "Milestone title",
            "description": "Description",
            "tasks": [
              {{"id": "t1", "title": "Task", "xp": 50, "time": "1 hour", "priority": "high"}}
            ]
          }}
        ]
        """
        try:
            if self.provider == 'gemini':
                response = self._call_gemini(prompt, temperature=0.7)
            elif self.provider == 'openai':
                response = self._call_openai(prompt, temperature=0.7)
            elif self.provider == 'anthropic':
                response = self._call_anthropic(prompt, temperature=0.7)
            else:
                return self._fallback_roadmap(career_title)

            response = response.strip()
            if response.startswith('```'):
                response = response.split('```')[1]
                if response.startswith('json'):
                    response = response[4:]
            start = response.find('[')
            end = response.rfind(']') + 1
            if start != -1 and end > 0:
                response = response[start:end]
            return json.loads(response)
        except Exception as e:
            print(f"generate_roadmap error: {e}")
            return self._fallback_roadmap(career_title)

    
    def _build_analysis_prompt(self, user_text: str, quiz_data: Dict = None) -> str:
        """Build prompt for career analysis"""
        prompt = f"""Analyze this person's career interests and recommend suitable careers:

User Input: "{user_text}"
"""
        if quiz_data:
            prompt += f"\nQuiz Answers: {json.dumps(quiz_data)}"
        
        prompt += """

Provide analysis in JSON format:
{
  "keywords_detected": ["keyword1", "keyword2"],
  "personality_traits": ["trait1", "trait2"],
  "top_career_categories": [
    {"name": "Technology", "percentage": 40},
    {"name": "Healthcare", "percentage": 30}
  ],
  "recommended_careers": [
    {
      "title": "Software Engineer",
      "match_percentage": 85,
      "reason": "Strong interest in coding and problem-solving"
    }
  ]
}
"""
        return prompt
    
    def _call_openai(self, prompt: str, temperature: float = 0.5) -> str:
        """Call OpenAI API"""
        response = self.client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a career counselor AI."},
                {"role": "user", "content": prompt}
            ],
            temperature=temperature,
            max_tokens=1500
        )
        return response.choices[0].message.content
    
    def _call_anthropic(self, prompt: str, temperature: float = 0.5) -> str:
        """Call Anthropic Claude API"""
        message = self.client.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=1500,
            temperature=temperature,
            messages=[{"role": "user", "content": prompt}]
        )
        return message.content[0].text
    
    def _call_gemini(self, prompt: str, temperature: float = 0.5) -> str:
        """Call Google Gemini API with automatic model fallback on quota errors"""
        last_error = None
        for model_name in GEMINI_MODEL_FALLBACK:
            try:
                model = self.client.GenerativeModel(model_name)
                response = model.generate_content(
                    prompt,
                    generation_config=self.client.types.GenerationConfig(
                        temperature=temperature,
                        max_output_tokens=4000
                    )
                )
                print(f"[Gemini] Using model: {model_name}")
                return response.text
            except Exception as e:
                err_str = str(e)
                if '429' in err_str or 'quota' in err_str.lower() or 'RESOURCE_EXHAUSTED' in err_str:
                    print(f"[Gemini] {model_name} quota exceeded, trying next model...")
                    last_error = e
                    continue
                # Non-quota error — raise immediately
                raise e
        # All models exhausted
        raise Exception(f"All Gemini models quota exceeded. Last error: {last_error}")
    
    def _parse_llm_response(self, response: str) -> Dict[str, Any]:
        """Parse LLM JSON response"""
        try:
            # Extract JSON from response
            start = response.find('{')
            end = response.rfind('}') + 1
            json_str = response[start:end]
            return json.loads(json_str)
        except:
            return self._fallback_analysis("")
    
    def _fallback_analysis(self, user_text: str) -> Dict[str, Any]:
        """Fallback analysis when LLM fails"""
        return {
            "keywords_detected": [],
            "personality_traits": ["Curious Explorer"],
            "top_career_categories": [{"name": "General", "percentage": 100}],
            "recommended_careers": []
        }
    
    def _fallback_roadmap(self, career_title: str) -> List[Dict]:
        """Fallback roadmap when LLM fails"""
        return [
            {
                "id": "m1",
                "title": f"{career_title} Foundations",
                "description": f"Build core knowledge in {career_title.lower()}",
                "tasks": [
                    {"id": "t1", "title": f"Research {career_title}", "xp": 50, "time": "1 hour", "priority": "high"},
                    {"id": "t2", "title": "Learn fundamentals", "xp": 75, "time": "2 hours", "priority": "high"},
                ]
            }
        ]

    def generate_study_plan(self, career: str, skill_level: str = "beginner") -> Dict[str, Any]:
        """Generate AI-powered study plan for a career"""
        prompt = f"""Return ONLY a JSON object for a {career} study plan at {skill_level} level. Use EXACTLY this structure with no extra fields:
{{"career":"{career}","skill_level":"{skill_level}","study_plan":[{{"topic":"Python Basics","description":"Learn Python syntax and data structures.","youtube_link":"https://www.youtube.com/results?search_query=python+basics","estimated_hours":15,"difficulty":"beginner","prerequisites":[]}},{{"topic":"Mathematics for ML","description":"Study linear algebra, calculus and statistics.","youtube_link":"https://www.youtube.com/results?search_query=math+for+machine+learning","estimated_hours":20,"difficulty":"beginner","prerequisites":["Python Basics"]}}],"total_estimated_hours":35}}
Replace the example topics with 6-8 real topics for {career} at {skill_level} level. Keep descriptions to one short sentence. Return ONLY the JSON, nothing else."""

        try:
            if self.provider == 'gemini':
                response = self._call_gemini(prompt, temperature=0.5)
            elif self.provider == 'openai':
                response = self._call_openai(prompt, temperature=0.5)
            elif self.provider == 'anthropic':
                response = self._call_anthropic(prompt, temperature=0.5)
            else:
                return self._fallback_study_plan(career, skill_level)

            return self._parse_study_plan_response(response)
        except Exception as e:
            print(f"Study plan generation error: {e}")
            return self._fallback_study_plan(career, skill_level)
    
    def _parse_study_plan_response(self, response: str) -> Dict[str, Any]:
        """Parse study plan JSON response - handles multiline strings from Gemini"""
        import re
        try:
            text = response.strip()
            # Strip markdown fences
            if '```' in text:
                parts = text.split('```')
                for part in parts:
                    if '{' in part:
                        text = part.lstrip('json').strip()
                        break

            # Find JSON boundaries
            start = text.find('{')
            end = text.rfind('}') + 1
            if start == -1 or end == 0:
                raise ValueError("No JSON object found")
            text = text[start:end]

            # Replace actual newlines inside JSON string values with a space
            # This handles Gemini's multiline descriptions
            def fix_string_newlines(s):
                result = []
                in_string = False
                escape = False
                for ch in s:
                    if escape:
                        result.append(ch)
                        escape = False
                    elif ch == '\\':
                        result.append(ch)
                        escape = True
                    elif ch == '"':
                        result.append(ch)
                        in_string = not in_string
                    elif in_string and ch in ('\n', '\r'):
                        result.append(' ')
                    else:
                        result.append(ch)
                return ''.join(result)

            text = fix_string_newlines(text)
            # Fix trailing commas
            text = re.sub(r',(\s*[}\]])', r'\1', text)

            result = json.loads(text)
            if not result.get('study_plan'):
                raise ValueError("Empty study_plan array")
            return result
        except Exception as e:
            print(f"Study plan parse error: {e}")
            return {"study_plan": [], "total_estimated_hours": 0}
    
    def _fallback_study_plan(self, career: str, skill_level: str) -> Dict[str, Any]:
        """Fallback study plan when LLM fails"""
        return {
            "career": career,
            "skill_level": skill_level,
            "study_plan": [
                {
                    "topic": f"Introduction to {career}",
                    "description": f"Learn the basics and fundamentals of {career}.",
                    "youtube_link": f"https://www.youtube.com/results?search_query={career.replace(' ', '+')}+basics",
                    "estimated_hours": 10,
                    "difficulty": "beginner",
                    "prerequisites": []
                }
            ],
            "total_estimated_hours": 10
        }

    def summarize_document(self, text: str, mode: str = 'summary') -> Dict[str, Any]:
        """
        Summarize a document using LLM
        Modes: 'summary', 'keyTerms', 'studyGuide'
        """
        # Limit text to avoid token limits
        doc_text = text[:3000] if len(text) > 3000 else text
        
        if mode == 'summary':
            prompt = f"""Summarize this document in 8-10 key points.

STRICT RULES:
- Each point must be a plain, complete sentence.
- Do NOT use markdown, asterisks (*), bold (**), bullet symbols, hyphens, or any special formatting.
- Do NOT use nested points or sub-bullets.
- Write each point as a simple factual sentence, e.g. "Intruders are attackers who attempt unauthorized access to a network."

{doc_text}

Return ONLY this JSON (no markdown, no extra text):
{{"title": "Summary", "points": ["Plain sentence point 1.", "Plain sentence point 2."], "terms": [], "actions": []}}"""
        elif mode == 'keyTerms':
            prompt = f"""Extract 5-8 key terms and concepts from this document.

STRICT RULES:
- Each term must be a short plain-text label with no asterisks, bold, or markdown.
- Example good terms: "Intrusion Detection", "Password Hashing", "Access Control"

{doc_text}

Return ONLY this JSON (no markdown, no extra text):
{{"title": "Key Terms", "points": [], "terms": ["Term One", "Term Two", "Term Three"], "actions": []}}"""
        else:  # studyGuide
            prompt = f"""Create a study guide from this document.

STRICT RULES:
- All points and action items must be plain sentences with no markdown, asterisks, bold, or bullet symbols.
- Points should summarize what to understand. Actions should say what to do, e.g. "Review the types of intruders and their methods."

{doc_text}

Return ONLY this JSON (no markdown, no extra text):
{{"title": "Study Guide", "points": ["Plain sentence point 1.", "Plain sentence point 2."], "terms": ["Term One", "Term Two"], "actions": ["Plain action item 1.", "Plain action item 2."]}}"""
        
        try:
            if self.provider == 'openai':
                response = self._call_openai(prompt, temperature=0.5)
            elif self.provider == 'anthropic':
                response = self._call_anthropic(prompt, temperature=0.5)
            elif self.provider == 'gemini':
                response = self._call_gemini(prompt, temperature=0.5)
            else:
                raise Exception("No LLM provider configured")
            
            # Parse JSON response - more robust extraction
            response = response.strip()
            start = response.find('{')
            end = response.rfind('}') + 1
            
            if start == -1 or end == 0:
                raise ValueError("No JSON found in response")
            
            json_str = response[start:end]
            result = json.loads(json_str)
            
            # Ensure all required fields exist
            return {
                "title": result.get("title", "Summary"),
                "points": result.get("points", []),
                "terms": result.get("terms", []),
                "actions": result.get("actions", [])
            }
        except Exception as e:
            print(f"Document summarization error: {e}")
            print(f"Response was: {response if 'response' in locals() else 'No response'}")
            return {
                "title": "Summary",
                "points": ["Unable to summarize document. Please try again."],
                "terms": [],
                "actions": []
            }
    
    def ask_document(self, text: str, question: str, history: List[Dict] = None) -> str:
        """
        Answer a question about a document
        """
        if history is None:
            history = []
        
        # Build context from history (last 2 messages for brevity)
        context = ""
        for msg in history[-2:]:
            role = "User" if msg.get('role') == 'user' else "Assistant"
            context += f"{role}: {msg.get('text', '')}\n"
        
        # Limit document text to avoid token limits
        doc_excerpt = text[:4000] if len(text) > 4000 else text
        
        prompt = f"""You are a helpful assistant answering questions about a document.

DOCUMENT CONTENT:
{doc_excerpt}

CONVERSATION HISTORY:
{context if context else "No previous messages"}

USER QUESTION: {question}

STRICT RULES:
- Answer in plain, clear sentences only.
- Do NOT use markdown, asterisks (*), bold (**), bullet points, or any special formatting.
- Write naturally as if explaining to a student in plain English.
- If the answer is not in the document, say so plainly."""
        
        try:
            if self.provider == 'openai':
                response = self._call_openai(prompt, temperature=0.7)
            elif self.provider == 'anthropic':
                response = self._call_anthropic(prompt, temperature=0.7)
            elif self.provider == 'gemini':
                response = self._call_gemini(prompt, temperature=0.7)
            else:
                raise Exception("No LLM provider configured")
            
            return response.strip()
        except Exception as e:
            print(f"Document Q&A error: {e}")
            return "I couldn't answer that question about the document. Please try again."

    def generate_roadmap_by_title(self, career_title: str, level: str = 'beginner') -> Dict[str, Any]:
        """
        Generate winding-road roadmap steps for a career title and level.
        Returns: {"career": str, "roadmap": [{"step_number": int, "title": str, "description": str}]}
        """
        prompt = f"""Generate 6 learning milestones for becoming a {career_title} at {level} level.
Return ONLY valid JSON, no markdown:
{{"career":"{career_title}","roadmap":[{{"step_number":1,"title":"Step Title","description":"Short description under 15 words"}},{{"step_number":2,"title":"Step Title","description":"Short description under 15 words"}},{{"step_number":3,"title":"Step Title","description":"Short description under 15 words"}},{{"step_number":4,"title":"Step Title","description":"Short description under 15 words"}},{{"step_number":5,"title":"Step Title","description":"Short description under 15 words"}},{{"step_number":6,"title":"Step Title","description":"Short description under 15 words"}}]}}
Replace all titles and descriptions with real content for {career_title} at {level} level. Keep descriptions under 15 words each."""

        try:
            if self.provider == 'gemini':
                response = self._call_gemini(prompt, temperature=0.7)
            elif self.provider == 'openai':
                response = self._call_openai(prompt, temperature=0.7)
            elif self.provider == 'anthropic':
                response = self._call_anthropic(prompt, temperature=0.7)
            else:
                raise Exception("No LLM provider configured")

            response = response.strip()
            # Strip markdown code fences if present
            if response.startswith('```'):
                response = response.split('```')[1]
                if response.startswith('json'):
                    response = response[4:]

            start = response.find('{')
            end = response.rfind('}') + 1
            if start == -1 or end == 0:
                raise ValueError("No JSON in response")

            parsed = json.loads(response[start:end])

            if not isinstance(parsed.get('roadmap'), list):
                raise ValueError("Invalid roadmap structure")

            parsed['roadmap'] = [
                {
                    'step_number': s.get('step_number', i + 1),
                    'title': s.get('title', 'Step'),
                    'description': s.get('description', '')
                }
                for i, s in enumerate(parsed['roadmap'])
            ]
            return parsed

        except Exception as e:
            print(f"generate_roadmap_by_title error: {e}")
            # Fallback
            return {
                "career": career_title,
                "roadmap": [
                    {"step_number": i + 1, "title": f"Step {i + 1}", "description": f"Learn {career_title} fundamentals step {i + 1}"}
                    for i in range(6)
                ]
            }

    def match_careers_from_quiz(self, quiz_answers: Dict[str, str]) -> Dict[str, Any]:
        """
        Match careers based on quiz answers using LLM
        """
        answers_text = "\n".join([f"Q: {q}\nA: {a}" for q, a in quiz_answers.items()])
        
        prompt = f"""Analyze these quiz answers and recommend the top 5 career matches:

{answers_text}

Return ONLY this JSON format, no other text:
{{
  "careers": [
    {{"career": "Career Name", "matchPercentage": 95, "reason": "Why this matches", "skills": ["skill1", "skill2"], "interests": ["interest1", "interest2"]}},
    {{"career": "Career Name 2", "matchPercentage": 85, "reason": "Why this matches", "skills": ["skill1", "skill2"], "interests": ["interest1", "interest2"]}},
    {{"career": "Career Name 3", "matchPercentage": 75, "reason": "Why this matches", "skills": ["skill1", "skill2"], "interests": ["interest1", "interest2"]}},
    {{"career": "Career Name 4", "matchPercentage": 65, "reason": "Why this matches", "skills": ["skill1", "skill2"], "interests": ["interest1", "interest2"]}},
    {{"career": "Career Name 5", "matchPercentage": 55, "reason": "Why this matches", "skills": ["skill1", "skill2"], "interests": ["interest1", "interest2"]}}
  ],
  "summary": "Overall career analysis summary"
}}

Requirements:
- matchPercentage must be a number between 0-100
- Keep reasons short (1-2 sentences)
- Include 2-3 relevant skills for each career
- Include 2-3 interests for each career
- Return exactly 5 careers"""
        
        try:
            if self.provider == 'openai':
                response = self._call_openai(prompt, temperature=0.7)
            elif self.provider == 'anthropic':
                response = self._call_anthropic(prompt, temperature=0.7)
            elif self.provider == 'gemini':
                response = self._call_gemini(prompt, temperature=0.7)
            else:
                raise Exception("No LLM provider configured")
            
            # Parse JSON response
            response = response.strip()
            start = response.find('{')
            end = response.rfind('}') + 1
            
            if start == -1 or end == 0:
                raise ValueError("No JSON found in response")
            
            json_str = response[start:end]
            result = json.loads(json_str)
            
            return {
                "success": True,
                "careers": result.get("careers", []),
                "summary": result.get("summary", "")
            }
        except Exception as e:
            print(f"Career matching error: {e}")
            return {
                "success": False,
                "careers": [],
                "error": str(e)
            }
