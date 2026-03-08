from rest_framework import serializers
from .models import Career, CareerAnalysis, SavedCareer, Roadmap

class CareerSerializer(serializers.ModelSerializer):
    match_percentage = serializers.IntegerField(required=False)
    match_reason = serializers.CharField(required=False)
    
    class Meta:
        model = Career
        fields = ['id', 'career_id', 'title', 'category', 'keywords', 
                  'education', 'salary', 'work_style', 'skills', 'color',
                  'match_percentage', 'match_reason']

class CareerAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = CareerAnalysis
        fields = ['id', 'input_text', 'keywords_detected', 'categories', 
                  'personality', 'matched_careers', 'created_at']
        read_only_fields = ['id', 'created_at']

class SavedCareerSerializer(serializers.ModelSerializer):
    career = CareerSerializer(read_only=True)
    
    class Meta:
        model = SavedCareer
        fields = ['id', 'career', 'saved_at']

class RoadmapSerializer(serializers.ModelSerializer):
    career = CareerSerializer(read_only=True)
    
    class Meta:
        model = Roadmap
        fields = ['id', 'career', 'milestones', 'created_at', 'updated_at']
