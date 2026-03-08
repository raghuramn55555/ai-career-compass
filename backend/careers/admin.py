from django.contrib import admin
from .models import Career, CareerAnalysis, SavedCareer, Roadmap

@admin.register(Career)
class CareerAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'education', 'salary']
    list_filter = ['category']
    search_fields = ['title', 'category']

@admin.register(CareerAnalysis)
class CareerAnalysisAdmin(admin.ModelAdmin):
    list_display = ['user', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__email', 'input_text']

@admin.register(SavedCareer)
class SavedCareerAdmin(admin.ModelAdmin):
    list_display = ['user', 'career', 'saved_at']
    list_filter = ['saved_at']

@admin.register(Roadmap)
class RoadmapAdmin(admin.ModelAdmin):
    list_display = ['user', 'career', 'updated_at']
    list_filter = ['updated_at']
