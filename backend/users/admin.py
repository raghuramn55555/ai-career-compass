from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'username', 'level', 'points', 'tasks_completed']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Career Progress', {'fields': ('points', 'level', 'streak', 'tasks_completed', 'study_hours')}),
    )
