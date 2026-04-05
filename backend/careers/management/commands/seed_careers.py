from django.core.management.base import BaseCommand
from careers.models import Career


CAREERS = [
    {'career_id': 'doctor', 'title': 'Medical Doctor', 'category': 'Healthcare', 'keywords': ['health', 'medicine', 'help', 'people', 'science', 'biology', 'care', 'hospital', 'patient', 'anatomy', 'diagnosis'], 'education': 'Medical Degree (MD)', 'salary': '$200K–$400K', 'work_style': 'Clinical / Hospital', 'skills': ['Anatomy', 'Diagnosis', 'Patient Care', 'Research', 'Communication'], 'color': 'hsl(0, 80%, 60%)'},
    {'career_id': 'nurse', 'title': 'Registered Nurse', 'category': 'Healthcare', 'keywords': ['care', 'health', 'people', 'help', 'hospital', 'patient', 'compassion', 'medicine'], 'education': 'Nursing Degree (BSN)', 'salary': '$60K–$120K', 'work_style': 'Clinical / Hospital', 'skills': ['Patient Care', 'Medical Knowledge', 'Empathy', 'Critical Thinking'], 'color': 'hsl(340, 70%, 55%)'},
    {'career_id': 'software-engineer', 'title': 'Software Engineer', 'category': 'Tech', 'keywords': ['code', 'programming', 'technology', 'computer', 'build', 'create', 'software', 'data', 'logic', 'math', 'problem', 'solving', 'web', 'app', 'develop'], 'education': 'CS Degree / Self-taught', 'salary': '$90K–$250K', 'work_style': 'Remote / Office', 'skills': ['Programming', 'Problem Solving', 'System Design', 'Algorithms', 'Teamwork'], 'color': 'hsl(190, 90%, 50%)'},
    {'career_id': 'data-scientist', 'title': 'Data Scientist', 'category': 'Tech', 'keywords': ['data', 'numbers', 'statistics', 'math', 'analysis', 'patterns', 'machine', 'learning', 'ai', 'research', 'predict'], 'education': 'MS in Data Science / Stats', 'salary': '$100K–$200K', 'work_style': 'Remote / Office', 'skills': ['Statistics', 'Python', 'Machine Learning', 'Data Visualization', 'SQL'], 'color': 'hsl(210, 80%, 55%)'},
    {'career_id': 'graphic-designer', 'title': 'Graphic Designer', 'category': 'Creative', 'keywords': ['art', 'design', 'creative', 'visual', 'draw', 'color', 'aesthetic', 'illustration', 'brand', 'digital'], 'education': 'Design Degree / Portfolio', 'salary': '$45K–$90K', 'work_style': 'Studio / Remote', 'skills': ['Adobe Suite', 'Typography', 'Color Theory', 'Branding', 'UI Design'], 'color': 'hsl(280, 70%, 55%)'},
    {'career_id': 'lawyer', 'title': 'Attorney / Lawyer', 'category': 'Legal', 'keywords': ['law', 'justice', 'argue', 'debate', 'rights', 'legal', 'court', 'advocate', 'policy', 'write', 'research'], 'education': 'Law Degree (JD)', 'salary': '$80K–$300K', 'work_style': 'Office / Court', 'skills': ['Legal Research', 'Argumentation', 'Writing', 'Critical Analysis', 'Negotiation'], 'color': 'hsl(30, 70%, 50%)'},
    {'career_id': 'teacher', 'title': 'Teacher / Educator', 'category': 'Education', 'keywords': ['teach', 'education', 'children', 'learn', 'help', 'explain', 'mentor', 'school', 'knowledge', 'inspire'], 'education': 'Education Degree', 'salary': '$40K–$80K', 'work_style': 'School / Classroom', 'skills': ['Communication', 'Patience', 'Curriculum Design', 'Mentoring', 'Adaptability'], 'color': 'hsl(150, 60%, 45%)'},
    {'career_id': 'psychologist', 'title': 'Psychologist', 'category': 'Healthcare', 'keywords': ['mind', 'behavior', 'people', 'help', 'mental', 'psychology', 'therapy', 'emotion', 'counsel', 'listen'], 'education': 'PhD / PsyD in Psychology', 'salary': '$70K–$150K', 'work_style': 'Office / Clinical', 'skills': ['Active Listening', 'Empathy', 'Research', 'Assessment', 'Therapy Techniques'], 'color': 'hsl(260, 60%, 55%)'},
    {'career_id': 'entrepreneur', 'title': 'Entrepreneur', 'category': 'Business', 'keywords': ['business', 'start', 'create', 'lead', 'money', 'market', 'sell', 'innovate', 'risk', 'opportunity', 'manage'], 'education': 'Business Degree / Self-taught', 'salary': 'Variable', 'work_style': 'Flexible', 'skills': ['Leadership', 'Marketing', 'Financial Planning', 'Networking', 'Innovation'], 'color': 'hsl(38, 90%, 55%)'},
    {'career_id': 'architect', 'title': 'Architect', 'category': 'Creative', 'keywords': ['design', 'build', 'structure', 'space', 'art', 'math', 'draw', 'plan', 'construct', 'environment'], 'education': 'Architecture Degree', 'salary': '$60K–$130K', 'work_style': 'Studio / On-site', 'skills': ['CAD', 'Spatial Design', 'Math', 'Creativity', 'Project Management'], 'color': 'hsl(15, 70%, 50%)'},
    {'career_id': 'environmental-scientist', 'title': 'Environmental Scientist', 'category': 'Science', 'keywords': ['nature', 'environment', 'science', 'earth', 'climate', 'ecology', 'research', 'conservation', 'outdoor', 'sustain'], 'education': 'Environmental Science Degree', 'salary': '$55K–$100K', 'work_style': 'Field / Lab', 'skills': ['Research', 'Data Analysis', 'Ecology', 'GIS', 'Report Writing'], 'color': 'hsl(120, 50%, 40%)'},
    {'career_id': 'journalist', 'title': 'Journalist / Writer', 'category': 'Creative', 'keywords': ['write', 'story', 'news', 'communicate', 'investigate', 'report', 'media', 'creative', 'truth', 'express'], 'education': 'Journalism / English Degree', 'salary': '$40K–$90K', 'work_style': 'Remote / Field', 'skills': ['Writing', 'Research', 'Interviewing', 'Editing', 'Storytelling'], 'color': 'hsl(200, 60%, 50%)'},
    {'career_id': 'electrician', 'title': 'Electrician', 'category': 'Trades', 'keywords': ['build', 'hands', 'fix', 'wire', 'electrical', 'install', 'technical', 'practical', 'tools'], 'education': 'Trade School / Apprenticeship', 'salary': '$45K–$100K', 'work_style': 'On-site / Field', 'skills': ['Electrical Systems', 'Blueprint Reading', 'Safety', 'Problem Solving', 'Math'], 'color': 'hsl(50, 70%, 50%)'},
    {'career_id': 'chef', 'title': 'Chef / Culinary Artist', 'category': 'Creative', 'keywords': ['cook', 'food', 'create', 'taste', 'kitchen', 'recipe', 'art', 'nutrition', 'restaurant'], 'education': 'Culinary School / Experience', 'salary': '$35K–$90K', 'work_style': 'Kitchen / Restaurant', 'skills': ['Cooking Techniques', 'Menu Planning', 'Food Safety', 'Creativity', 'Team Management'], 'color': 'hsl(10, 80%, 55%)'},
    {'career_id': 'financial-analyst', 'title': 'Financial Analyst', 'category': 'Business', 'keywords': ['money', 'finance', 'numbers', 'invest', 'market', 'analysis', 'economics', 'business', 'data', 'math'], 'education': 'Finance / Economics Degree', 'salary': '$65K–$150K', 'work_style': 'Office / Remote', 'skills': ['Financial Modeling', 'Excel', 'Analytics', 'Research', 'Forecasting'], 'color': 'hsl(170, 60%, 45%)'},
    {'career_id': 'ux-designer', 'title': 'UX/UI Designer', 'category': 'Tech', 'keywords': ['design', 'user', 'experience', 'interface', 'creative', 'technology', 'app', 'web', 'research', 'visual', 'prototype'], 'education': 'Design / HCI Degree', 'salary': '$70K–$150K', 'work_style': 'Remote / Studio', 'skills': ['Figma', 'User Research', 'Prototyping', 'Wireframing', 'Visual Design'], 'color': 'hsl(300, 60%, 50%)'},
    {'career_id': 'mechanical-engineer', 'title': 'Mechanical Engineer', 'category': 'Science', 'keywords': ['build', 'machine', 'engineering', 'design', 'math', 'physics', 'create', 'technical', 'problem', 'solve'], 'education': 'ME Degree', 'salary': '$70K–$130K', 'work_style': 'Office / Factory', 'skills': ['CAD', 'Thermodynamics', 'Materials Science', 'Project Management', 'Math'], 'color': 'hsl(220, 70%, 50%)'},
    {'career_id': 'social-worker', 'title': 'Social Worker', 'category': 'Healthcare', 'keywords': ['help', 'people', 'community', 'support', 'advocate', 'social', 'care', 'children', 'family', 'counsel'], 'education': 'Social Work Degree (MSW)', 'salary': '$40K–$70K', 'work_style': 'Office / Community', 'skills': ['Empathy', 'Case Management', 'Advocacy', 'Communication', 'Crisis Intervention'], 'color': 'hsl(330, 60%, 50%)'},
    {'career_id': 'cybersecurity', 'title': 'Cybersecurity Analyst', 'category': 'Tech', 'keywords': ['security', 'computer', 'protect', 'hack', 'technology', 'data', 'network', 'digital', 'code', 'solve'], 'education': 'CS / Cybersecurity Degree', 'salary': '$80K–$160K', 'work_style': 'Remote / Office', 'skills': ['Network Security', 'Ethical Hacking', 'Risk Assessment', 'Encryption', 'Incident Response'], 'color': 'hsl(0, 70%, 50%)'},
    {'career_id': 'veterinarian', 'title': 'Veterinarian', 'category': 'Healthcare', 'keywords': ['animal', 'pet', 'care', 'science', 'biology', 'health', 'nature', 'help', 'medicine'], 'education': 'Veterinary Degree (DVM)', 'salary': '$80K–$160K', 'work_style': 'Clinical / Field', 'skills': ['Animal Medicine', 'Surgery', 'Diagnosis', 'Compassion', 'Communication'], 'color': 'hsl(90, 50%, 45%)'},
]


class Command(BaseCommand):
    help = 'Seed the database with career data'

    def handle(self, *args, **kwargs):
        created = 0
        updated = 0
        for career_data in CAREERS:
            obj, was_created = Career.objects.update_or_create(
                career_id=career_data['career_id'],
                defaults=career_data
            )
            if was_created:
                created += 1
            else:
                updated += 1

        self.stdout.write(self.style.SUCCESS(
            f'Done! Created: {created}, Updated: {updated}, Total: {len(CAREERS)} careers'
        ))
