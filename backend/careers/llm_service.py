import json
from django.conf import settings
from typing import Dict, List, Any


class LLMService:
    """Service for LLM-powered career analysis and document tools"""

    def __init__(self):
        self.provider = getattr(settings, 'LLM_PROVIDER', 'gemini')
        self.client = None
        self._init_client()

    def _init_client(self):
        try:
            if self.provider == 'gemini':
                from google import genai
                self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
            elif self.provider == 'openai':
                from openai import OpenAI
                self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
            elif self.provider == 'anthropic':
                import anthropic
                self.client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        except Exception as e:
            print(f"LLM init error: {e}")

    # ─── Internal call helpers ────────────────────────────────────────────────

    def _call(self, prompt: str, temperature: float = 0.5) -> str:
        if self.provider == 'gemini':
            response = self.client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt
            )
            return response.text
        elif self.provider == 'openai':
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful AI assistant."},
                    {"role": "user", "content": prompt}
                ],
                temperature=temperature,
                max_tokens=2000
            )
            return response.choices[0].message.content
        elif self.provider == 'anthropic':
            message = self.client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=2000,
                messages=[{"role": "user", "content": prompt}]
            )
            return message.content[0].text
        raise ValueError(f"Unknown provider: {self.provider}")

    def _parse_json(self, text: str) -> Any:
        """Extract and parse JSON from LLM response"""
        try:
            # Try direct parse first
            return json.loads(text)
        except Exception:
            pass
        try:
            # Strip markdown code fences
            start = text.find('{') if '{' in text else text.find('[')
            end = (text.rfind('}') + 1) if '{' in text else (text.rfind(']') + 1)
            return json.loads(text[start:end])
        except Exception:
            return None

    # ─── Career analysis ──────────────────────────────────────────────────────

    def analyze_career_interests(self, user_text: str, quiz_data: Dict = None) -> Dict[str, Any]:
        prompt = self._build_analysis_prompt(user_text, quiz_data)
        try:
            response = self._call(prompt)
            result = self._parse_json(response)
            if result:
                return result
        except Exception as e:
            print(f"LLM analyze error: {e}")
        return self._fallback_analysis(user_text)

    def generate_roadmap(self, career_title: str, user_level: str = "beginner") -> List[Dict]:
        prompt = f"""Generate a detailed learning roadmap for becoming a {career_title}.
User level: {user_level}

Create 4 milestones with 4 tasks each. Return ONLY valid JSON array:
[
  {{
    "id": "m1",
    "title": "Milestone title",
    "description": "Description",
    "tasks": [
      {{"id": "t1", "title": "Task", "xp": 50, "time": "1 hour", "priority": "high", "completed": false}}
    ]
  }}
]"""
        try:
            response = self._call(prompt, temperature=0.7)
            result = self._parse_json(response)
            if result:
                return result
        except Exception as e:
            print(f"LLM roadmap error: {e}")
        return self._fallback_roadmap(career_title)

    # ─── Document tools ───────────────────────────────────────────────────────

    def summarize_document(self, text: str, mode: str = 'summary') -> Dict[str, Any]:
        """
        Summarize document text.
        mode: 'summary' | 'keyTerms' | 'studyGuide'
        """
        mode_instructions = {
            'summary': "Summarize this document for a student exploring career paths. Focus on key insights relevant to professional development.",
            'keyTerms': "Extract and explain the most important technical and domain-specific terms from this document.",
            'studyGuide': "Create a structured study guide from this document with chapters, key concepts, and review questions.",
        }

        instruction = mode_instructions.get(mode, mode_instructions['summary'])

        prompt = f"""{instruction}

Document content:
\"\"\"
{text[:6000]}
\"\"\"

Return ONLY valid JSON in this exact format:
{{
  "title": "A descriptive title for the result",
  "points": ["point 1", "point 2", "point 3", "point 4", "point 5"],
  "terms": ["term1", "term2", "term3", "term4", "term5", "term6"],
  "actions": ["action 1", "action 2", "action 3"]
}}"""

        try:
            response = self._call(prompt)
            result = self._parse_json(response)
            if result and 'points' in result:
                return result
        except Exception as e:
            print(f"LLM summarize error: {e}")

        return self._fallback_summary(mode)

    def ask_document(self, text: str, question: str, history: List[Dict] = None) -> str:
        """Answer a question about a document"""
        history_text = ""
        if history:
            for msg in history[-4:]:  # last 4 messages for context
                role = "User" if msg['role'] == 'user' else "Assistant"
                history_text += f"{role}: {msg['text']}\n"

        prompt = f"""You are a helpful study assistant. Answer the user's question based on the document below.
Be concise, clear, and helpful. If the answer isn't in the document, say so.

Document:
\"\"\"
{text[:5000]}
\"\"\"

{f'Conversation so far:{chr(10)}{history_text}' if history_text else ''}
User question: {question}

Answer:"""

        try:
            return self._call(prompt, temperature=0.7)
        except Exception as e:
            print(f"LLM ask error: {e}")
            return "Sorry, I couldn't process your question. Please try again."

    # ─── Prompt builders ──────────────────────────────────────────────────────

    def _build_analysis_prompt(self, user_text: str, quiz_data: Dict = None) -> str:
        prompt = f"""Analyze this person's career interests and recommend suitable careers:

User Input: "{user_text}"
"""
        if quiz_data:
            prompt += f"\nQuiz Answers: {json.dumps(quiz_data)}"

        prompt += """

Return ONLY valid JSON:
{
  "keywords_detected": ["keyword1", "keyword2"],
  "personality_traits": ["trait1", "trait2"],
  "top_career_categories": [
    {"name": "Technology", "percentage": 40}
  ],
  "recommended_careers": [
    {
      "title": "Software Engineer",
      "match_percentage": 85,
      "reason": "Strong interest in coding and problem-solving"
    }
  ]
}"""
        return prompt

    # ─── Fallbacks ────────────────────────────────────────────────────────────

    def _fallback_analysis(self, user_text: str) -> Dict[str, Any]:
        return {
            "keywords_detected": [],
            "personality_traits": ["Curious Explorer"],
            "top_career_categories": [{"name": "General", "percentage": 100}],
            "recommended_careers": []
        }

    def _fallback_roadmap(self, career_title: str) -> List[Dict]:
        return [
            {
                "id": "m1",
                "title": f"{career_title} Foundations",
                "description": f"Build core knowledge in {career_title.lower()}",
                "tasks": [
                    {"id": "t1", "title": f"Research {career_title}", "xp": 50, "time": "1 hour", "priority": "high", "completed": False},
                    {"id": "t2", "title": "Learn fundamentals", "xp": 75, "time": "2 hours", "priority": "high", "completed": False},
                ]
            }
        ]

    def _fallback_summary(self, mode: str) -> Dict[str, Any]:
        return {
            "title": "Analysis Complete",
            "points": ["Document processed successfully", "Key content identified", "Review the document for more details"],
            "terms": ["Document", "Analysis", "Content"],
            "actions": ["Review the document", "Take notes", "Practice key concepts"]
        }
