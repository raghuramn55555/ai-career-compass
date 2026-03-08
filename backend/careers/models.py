from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Career(models.Model):
    career_id = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=100)
    keywords = models.JSONField(default=list)
    education = models.CharField(max_length=200)
    salary = models.CharField(max_length=100)
    work_style = models.CharField(max_length=200)
    skills = models.JSONField(default=list)
    color = models.CharField(max_length=50)
    
    def __str__(self):
        return self.title

class CareerAnalysis(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='analyses')
    input_text = models.TextField()
    keywords_detected = models.JSONField(default=list)
    categories = models.JSONField(default=list)
    personality = models.JSONField(default=list)
    matched_careers = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Analysis for {self.user.email} - {self.created_at}"

class SavedCareer(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    career = models.ForeignKey(Career, on_delete=models.CASCADE)
    saved_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'career']
        ordering = ['-saved_at']

class Roadmap(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    career = models.ForeignKey(Career, on_delete=models.CASCADE)
    milestones = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
