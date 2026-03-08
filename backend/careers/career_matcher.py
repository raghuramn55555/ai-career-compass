import re
from typing import Dict, List, Any
from .models import Career

class CareerMatcher:
    """Rule-based career matching (fallback when LLM not used)"""
    
    STOPWORDS = {'i', 'me', 'my', 'a', 'an', 'the', 'is', 'am', 'are', 'was', 
                 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 
                 'does', 'did', 'will', 'would', 'could', 'should', 'to', 'of', 
                 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'like', 'want'}
    
    INTEREST_KEYWORDS = {
        'help': ['help', 'helping', 'assist', 'support'],
        'people': ['people', 'person', 'social', 'community'],
        'technology': ['technology', 'tech', 'computer', 'digital'],
        'code': ['code', 'coding', 'programming', 'developer'],
        'health': ['health', 'medicine', 'medical', 'care'],
        'creative': ['creative', 'art', 'design', 'aesthetic'],
        'business': ['business', 'entrepreneur', 'startup'],
        'science': ['science', 'research', 'experiment'],
    }
    
    PERSONALITY_MAP = {
        'help': 'Empathetic & Caring',
        'people': 'Social & Collaborative',
        'creative': 'Creative & Innovative',
        'technology': 'Tech-Savvy',
        'science': 'Curious & Investigative',
    }
    
    def analyze_interests(self, text: str, quiz_data: Dict = None) -> Dict[str, Any]:
        """Analyze user interests and match careers"""
        words = self._extract_words(text)
        detected_keywords = []
        detected_categories = {}
        
        # Detect keywords
        for word in words:
            for category, synonyms in self.INTEREST_KEYWORDS.items():
                if any(syn in word or word in syn for syn in synonyms):
                    detected_categories[category] = detected_categories.get(category, 0) + 1
                    if word not in detected_keywords:
                        detected_keywords.append(word)
        
        # Score careers
        careers = Career.objects.all()
        scored_careers = []
        
        for career in careers:
            score = 0
            matched_keywords = []
            
            for keyword in career.keywords:
                for word in words:
                    if word in keyword or keyword in word:
                        score += 1
                        if keyword not in matched_keywords:
                            matched_keywords.append(keyword)
            
            if score >= 2:  # Minimum threshold
                match_percentage = min(98, int((score / len(career.keywords)) * 100))
                reason = f"You mentioned {', '.join(matched_keywords[:3])}" if matched_keywords else "Potential match"
                
                scored_careers.append({
                    'career_id': career.career_id,
                    'title': career.title,
                    'category': career.category,
                    'match_percentage': match_percentage,
                    'match_reason': reason,
                    'education': career.education,
                    'salary': career.salary,
                    'work_style': career.work_style,
                    'skills': career.skills,
                    'color': career.color
                })
        
        # Sort by match percentage
        scored_careers.sort(key=lambda x: x['match_percentage'], reverse=True)
        
        # Get top careers or default to top 10
        final_careers = scored_careers[:15] if scored_careers else self._get_default_careers()[:10]
        
        # Calculate category percentages
        total = sum(detected_categories.values()) or 1
        categories = [
            {'name': cat.title(), 'percentage': int((count / total) * 100)}
            for cat, count in sorted(detected_categories.items(), key=lambda x: x[1], reverse=True)
        ]
        
        # Get personality traits
        personality = [
            self.PERSONALITY_MAP.get(cat, cat.title())
            for cat in list(detected_categories.keys())[:4]
        ]
        
        return {
            'keywords_detected': detected_keywords,
            'personality_traits': personality or ['Curious Explorer'],
            'top_career_categories': categories or [{'name': 'General', 'percentage': 100}],
            'recommended_careers': final_careers
        }

    
    def generate_roadmap(self, career: Career) -> List[Dict]:
        """Generate basic roadmap for a career"""
        return [
            {
                "id": "m1",
                "title": f"{career.category} Foundations",
                "description": f"Build core knowledge in {career.title.lower()}",
                "tasks": [
                    {"id": "t1", "title": f"Research {career.title} career path", "xp": 50, "time": "1 hour", "completed": False, "priority": "high"},
                    {"id": "t2", "title": f"Learn {career.skills[0] if career.skills else 'fundamentals'}", "xp": 75, "time": "2 hours", "completed": False, "priority": "high"},
                    {"id": "t3", "title": f"Study {career.skills[1] if len(career.skills) > 1 else 'theory'}", "xp": 60, "time": "1.5 hours", "completed": False, "priority": "medium"},
                    {"id": "t4", "title": "Create a study plan", "xp": 40, "time": "30 min", "completed": False, "priority": "medium"},
                ]
            },
            {
                "id": "m2",
                "title": f"{career.education} Preparation",
                "description": f"Prepare for education in {career.title.lower()}",
                "tasks": [
                    {"id": "t5", "title": "Research educational programs", "xp": 50, "time": "1 hour", "completed": False, "priority": "high"},
                    {"id": "t6", "title": f"Practice {career.skills[2] if len(career.skills) > 2 else 'core skills'}", "xp": 80, "time": "2 hours", "completed": False, "priority": "high"},
                    {"id": "t7", "title": "Connect with professionals", "xp": 60, "time": "1 hour", "completed": False, "priority": "medium"},
                    {"id": "t8", "title": "Build a portfolio outline", "xp": 70, "time": "1.5 hours", "completed": False, "priority": "low"},
                ]
            },
            {
                "id": "m3",
                "title": "Skill Development",
                "description": f"Develop practical {career.title.lower()} skills",
                "tasks": [
                    {"id": "t9", "title": f"Master {career.skills[0] if career.skills else 'fundamentals'}", "xp": 100, "time": "3 hours", "completed": False, "priority": "high"},
                    {"id": "t10", "title": f"Complete a {career.title} project", "xp": 120, "time": "4 hours", "completed": False, "priority": "high"},
                    {"id": "t11", "title": "Get peer feedback", "xp": 50, "time": "1 hour", "completed": False, "priority": "medium"},
                    {"id": "t12", "title": "Earn a certification", "xp": 150, "time": "5 hours", "completed": False, "priority": "low"},
                ]
            },
            {
                "id": "m4",
                "title": "Career Launch",
                "description": "Prepare for career entry",
                "tasks": [
                    {"id": "t13", "title": "Build professional resume", "xp": 80, "time": "2 hours", "completed": False, "priority": "high"},
                    {"id": "t14", "title": "Practice interview skills", "xp": 90, "time": "2 hours", "completed": False, "priority": "high"},
                    {"id": "t15", "title": "Apply to positions", "xp": 60, "time": "1.5 hours", "completed": False, "priority": "medium"},
                    {"id": "t16", "title": "Network with industry peers", "xp": 70, "time": "1 hour", "completed": False, "priority": "medium"},
                ]
            }
        ]
    
    def _extract_words(self, text: str) -> List[str]:
        """Extract meaningful words from text"""
        text = text.lower()
        text = re.sub(r'[^a-z\s]', '', text)
        words = text.split()
        return [w for w in words if w not in self.STOPWORDS and len(w) > 2]
    
    def _get_default_careers(self) -> List[Dict]:
        """Get default career list"""
        careers = Career.objects.all()[:10]
        return [
            {
                'career_id': c.career_id,
                'title': c.title,
                'category': c.category,
                'match_percentage': 50,
                'match_reason': 'Explore this career path',
                'education': c.education,
                'salary': c.salary,
                'work_style': c.work_style,
                'skills': c.skills,
                'color': c.color
            }
            for c in careers
        ]
