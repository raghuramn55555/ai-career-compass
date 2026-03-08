#!/usr/bin/env python
"""Test script to verify backend setup"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from careers.models import Career
from django.contrib.auth import get_user_model

User = get_user_model()

print("=" * 50)
print("Backend Setup Test")
print("=" * 50)

# Test 1: Check careers
career_count = Career.objects.count()
print(f"\n✓ Careers in database: {career_count}")
if career_count > 0:
    print("  Sample careers:")
    for career in Career.objects.all()[:3]:
        print(f"  - {career.title} ({career.category})")

# Test 2: Check user model
print(f"\n✓ User model: {User.__name__}")
print(f"  Users in database: {User.objects.count()}")

# Test 3: Check settings
from django.conf import settings
print(f"\n✓ Debug mode: {settings.DEBUG}")
print(f"✓ LLM Provider: {settings.LLM_PROVIDER}")
print(f"✓ OpenAI Key configured: {'Yes' if settings.OPENAI_API_KEY else 'No'}")
print(f"✓ Anthropic Key configured: {'Yes' if settings.ANTHROPIC_API_KEY else 'No'}")

print("\n" + "=" * 50)
print("✅ Backend setup successful!")
print("=" * 50)
print("\nNext steps:")
print("1. Create superuser: python manage.py createsuperuser")
print("2. Run server: python manage.py runserver")
print("3. Visit: http://localhost:8000/admin")
