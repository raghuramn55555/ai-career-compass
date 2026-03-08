import json
from django.conf import settings
from typing import Dict, List, Any

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
    
    def analyze_career_interests(self, user_text: str, quiz_data: Dict = None) -> Dict[str, Any]:
        """
        Use LLM to analyze user interests and provide career recommendations
        """
        prompt = self._build_analysis_prompt(user_text, quiz_data)
        
        try:
            if self.provider == 'openai':
                response = self._call_openai(prompt)
            else:
                response = self._call_anthropic(prompt)
            
            return self._parse_llm_response(response)
        except Exception as e:
            print(f"LLM Error: {e}")
            return self._fallback_analysis(user_text)
    
    def generate_roadmap(self, career_title: str, user_level: str = "beginner") -> List[Dict]:
        """
        Generate personalized learning roadmap using LLM
        """
        prompt = f"""Generate a detailed learning roadmap for becoming a {career_title}.
        User level: {user_level}
        
        Create 4 milestones with 4 tasks each. Format as JSON:
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
            if self.provider == 'openai':
                response = self._call_openai(prompt, temperature=0.7)
            else:
                response = self._call_anthropic(prompt, temperature=0.7)
            
            return json.loads(response)
        except:
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
        response = self.client.ChatCompletion.create(
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
