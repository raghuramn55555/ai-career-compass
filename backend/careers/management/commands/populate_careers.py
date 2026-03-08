from django.core.management.base import BaseCommand
from careers.models import Career

class Command(BaseCommand):
    help = 'Populate database with career data'
    
    def handle(self, *args, **kwargs):
        careers_data = [
            {'career_id': 'doctor', 'title': 'Medical Doctor', 'category': 'Healthcare', 
             'keywords': ['health', 'medicine', 'help', 'people', 'science', 'biology', 'care', 'hospital', 'patient'], 
             'education': 'Medical Degree (MD)', 'salary': '$200K–$400K', 'work_style': 'Clinical / Hospital', 
             'skills': ['Anatomy', 'Diagnosis', 'Patient Care', 'Research'], 'color': 'hsl(0, 80%, 60%)'},
            
            {'career_id': 'software-engineer', 'title': 'Software Engineer', 'category': 'Tech', 
             'keywords': ['code', 'programming', 'technology', 'computer', 'build', 'software', 'data', 'web', 'app'], 
             'education': 'CS Degree / Self-taught', 'salary': '$90K–$250K', 'work_style': 'Remote / Office', 
             'skills': ['Programming', 'Problem Solving', 'System Design', 'Algorithms'], 'color': 'hsl(190, 90%, 50%)'},
            
            {'career_id': 'data-scientist', 'title': 'Data Scientist', 'category': 'Tech', 
             'keywords': ['data', 'numbers', 'statistics', 'math', 'analysis', 'machine', 'learning', 'ai'], 
             'education': 'MS in Data Science', 'salary': '$100K–$200K', 'work_style': 'Remote / Office', 
             'skills': ['Statistics', 'Python', 'Machine Learning', 'SQL'], 'color': 'hsl(210, 80%, 55%)'},
            
            {'career_id': 'graphic-designer', 'title': 'Graphic Designer', 'category': 'Creative', 
             'keywords': ['art', 'design', 'creative', 'visual', 'draw', 'color', 'aesthetic'], 
             'education': 'Design Degree', 'salary': '$45K–$90K', 'work_style': 'Studio / Remote', 
             'skills': ['Adobe Suite', 'Typography', 'Color Theory', 'Branding'], 'color': 'hsl(280, 70%, 55%)'},
            
            {'career_id': 'teacher', 'title': 'Teacher / Educator', 'category': 'Education', 
             'keywords': ['teach', 'education', 'children', 'learn', 'help', 'mentor', 'school'], 
             'education': 'Education Degree', 'salary': '$40K–$80K', 'work_style': 'School / Classroom', 
             'skills': ['Communication', 'Patience', 'Curriculum Design'], 'color': 'hsl(150, 60%, 45%)'},
        ]
        
        for data in careers_data:
            Career.objects.get_or_create(career_id=data['career_id'], defaults=data)
        
        self.stdout.write(self.style.SUCCESS(f'Successfully populated {len(careers_data)} careers'))
