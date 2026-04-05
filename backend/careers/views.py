from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from .models import Career, CareerAnalysis, SavedCareer, Roadmap, StudyPlan
from .serializers import (CareerSerializer, CareerAnalysisSerializer, 
                          SavedCareerSerializer, RoadmapSerializer, StudyPlanSerializer)
from .llm_service import LLMService
from .career_matcher import CareerMatcher

class CareerListView(generics.ListAPIView):
    """List all available careers"""
    queryset = Career.objects.all()
    serializer_class = CareerSerializer
    permission_classes = [AllowAny]

class AnalyzeInterestsView(views.APIView):
    """Analyze user interests and match careers using LLM"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user_text = request.data.get('text', '')
        quiz_answers = request.data.get('quiz_answers', {})
        use_llm = request.data.get('use_llm', False)
        
        if not user_text:
            return Response({'error': 'Text is required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        if use_llm:
            # Use LLM for advanced analysis
            llm_service = LLMService()
            analysis_result = llm_service.analyze_career_interests(user_text, quiz_answers)
        else:
            # Use rule-based matcher (faster, no API costs)
            matcher = CareerMatcher()
            analysis_result = matcher.analyze_interests(user_text, quiz_answers)
        
        # Save analysis
        analysis = CareerAnalysis.objects.create(
            user=request.user,
            input_text=user_text,
            keywords_detected=analysis_result.get('keywords_detected', []),
            categories=analysis_result.get('top_career_categories', []),
            personality=analysis_result.get('personality_traits', []),
            matched_careers=analysis_result.get('recommended_careers', [])
        )
        
        return Response({
            'analysis_id': analysis.id,
            'careers': analysis_result.get('recommended_careers', []),
            'keywords_detected': analysis_result.get('keywords_detected', []),
            'categories': analysis_result.get('top_career_categories', []),
            'personality': analysis_result.get('personality_traits', []),
            'input_text': user_text
        })


class SavedCareersView(generics.ListCreateAPIView):
    """List and save careers"""
    serializer_class = SavedCareerSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return SavedCareer.objects.filter(user=self.request.user)
    
    def post(self, request):
        career_id = request.data.get('career_id')
        career = get_object_or_404(Career, career_id=career_id)
        
        saved, created = SavedCareer.objects.get_or_create(
            user=request.user,
            career=career
        )
        
        if not created:
            saved.delete()
            return Response({'message': 'Career unsaved'}, status=status.HTTP_200_OK)
        
        return Response(SavedCareerSerializer(saved).data, status=status.HTTP_201_CREATED)

class GenerateRoadmapView(views.APIView):
    """Generate personalized learning roadmap"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        career_id = request.data.get('career_id')
        use_llm = request.data.get('use_llm', False)
        
        career = get_object_or_404(Career, career_id=career_id)
        
        if use_llm:
            llm_service = LLMService()
            milestones = llm_service.generate_roadmap(career.title)
        else:
            from .career_matcher import CareerMatcher
            matcher = CareerMatcher()
            milestones = matcher.generate_roadmap(career)
        
        roadmap, created = Roadmap.objects.update_or_create(
            user=request.user,
            career=career,
            defaults={'milestones': milestones}
        )
        
        return Response(RoadmapSerializer(roadmap).data)

class UserAnalysisHistoryView(generics.ListAPIView):
    """Get user's analysis history"""
    serializer_class = CareerAnalysisSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return CareerAnalysis.objects.filter(user=self.request.user)[:10]


class GenerateStudyPlanView(views.APIView):
    """Generate AI-powered study plan for a career"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        career = request.data.get('career')
        skill_level = request.data.get('skill_level', 'beginner')
        
        if not career:
            return Response({'error': 'Career is required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        if skill_level not in ['beginner', 'intermediate', 'advanced']:
            return Response({'error': 'Invalid skill level'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Check if study plan already exists and has content
        existing_plan = StudyPlan.objects.filter(
            user=request.user,
            career=career,
            skill_level=skill_level
        ).first()

        if existing_plan and existing_plan.study_plan:
            return Response(StudyPlanSerializer(existing_plan).data)

        # Delete empty/broken cached plan if exists
        if existing_plan:
            existing_plan.delete()
        
        # Generate study plan using LLM
        llm_service = LLMService()
        study_plan_data = llm_service.generate_study_plan(career, skill_level)
        
        # Save to database
        study_plan = StudyPlan.objects.create(
            user=request.user,
            career=career,
            skill_level=skill_level,
            study_plan=study_plan_data.get('study_plan', []),
            total_estimated_hours=study_plan_data.get('total_estimated_hours')
        )
        
        return Response(StudyPlanSerializer(study_plan).data, status=status.HTTP_201_CREATED)
    
    def get(self, request):
        """Get user's study plans"""
        plans = StudyPlan.objects.filter(user=request.user)
        serializer = StudyPlanSerializer(plans, many=True)
        return Response(serializer.data)


class StudyPlanDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a specific study plan"""
    serializer_class = StudyPlanSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return StudyPlan.objects.filter(user=self.request.user)


class GenerateRoadmapByTitleView(views.APIView):
    """Generate winding-road roadmap by career title and level"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        career_title = request.data.get('career_title', '').strip()
        level = request.data.get('level', 'beginner')

        if not career_title:
            return Response({'error': 'career_title is required'}, status=status.HTTP_400_BAD_REQUEST)

        if level not in ['beginner', 'intermediate', 'advanced']:
            level = 'beginner'

        llm_service = LLMService()
        result = llm_service.generate_roadmap_by_title(career_title, level)
        return Response(result)


class MatchCareersFromQuizView(views.APIView):
    """Match careers based on quiz answers using LLM"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        quiz_answers = request.data.get('quiz_answers', {})
        
        if not quiz_answers:
            return Response({'error': 'Quiz answers are required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Use LLM service to match careers
        llm_service = LLMService()
        result = llm_service.match_careers_from_quiz(quiz_answers)
        
        if not result.get('success'):
            return Response({'error': result.get('error', 'Failed to match careers')}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'success': True,
            'careers': result.get('careers', []),
            'summary': result.get('summary', '')
        })
