from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid


class User(AbstractUser):
    email = models.EmailField(unique=True)
    join_date = models.DateField(auto_now_add=True)
    points = models.IntegerField(default=0)
    level = models.IntegerField(default=1)
    streak = models.IntegerField(default=1)
    tasks_completed = models.IntegerField(default=0)
    study_hours = models.FloatField(default=0.0)
    badges = models.JSONField(default=list)
    roadmap_tasks = models.JSONField(default=list)  # stores completed task ids

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email


class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reset_tokens')
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)

    def is_valid(self):
        from django.utils import timezone
        from datetime import timedelta
        # Token expires after 1 hour
        return not self.used and (timezone.now() - self.created_at) < timedelta(hours=1)

    def __str__(self):
        return f"Reset token for {self.user.email}"
