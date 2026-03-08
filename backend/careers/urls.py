from django.urls import path
from .views import (CareerListView, AnalyzeInterestsView, SavedCareersView,
                    GenerateRoadmapView, UserAnalysisHistoryView)

urlpatterns = [
    path('list/', CareerListView.as_view(), name='career-list'),
    path('analyze/', AnalyzeInterestsView.as_view(), name='analyze-interests'),
    path('saved/', SavedCareersView.as_view(), name='saved-careers'),
    path('roadmap/generate/', GenerateRoadmapView.as_view(), name='generate-roadmap'),
    path('history/', UserAnalysisHistoryView.as_view(), name='analysis-history'),
]
