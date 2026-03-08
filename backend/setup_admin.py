#!/usr/bin/env python
"""
Quick setup script to create superuser and initialize database
Run this after setting up the backend for the first time
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.core.management import call_command

User = get_user_model()

def setup_database():
    """Run migrations to create database tables"""
    print("🔄 Running database migrations...")
    call_command('migrate', '--noinput')
    print("✅ Database migrations completed!\n")

def create_superuser():
    """Create a superuser if one doesn't exist"""
    print("👤 Checking for superuser...")
    
    if User.objects.filter(is_superuser=True).exists():
        print("✅ Superuser already exists!")
        superuser = User.objects.filter(is_superuser=True).first()
        print(f"   Email: {superuser.email}")
        print(f"   Name: {superuser.name}\n")
        return
    
    print("📝 Creating superuser...")
    print("\nPlease enter superuser details:")
    
    email = input("Email address: ").strip()
    name = input("Name: ").strip()
    password = input("Password: ").strip()
    
    if not email or not name or not password:
        print("❌ All fields are required!")
        return
    
    try:
        superuser = User.objects.create_superuser(
            email=email,
            name=name,
            password=password
        )
        print(f"\n✅ Superuser created successfully!")
        print(f"   Email: {superuser.email}")
        print(f"   Name: {superuser.name}")
        print(f"\n🌐 Access admin panel at: http://localhost:8000/admin/\n")
    except Exception as e:
        print(f"❌ Error creating superuser: {e}")

def create_test_users():
    """Create some test users for development"""
    print("👥 Creating test users...")
    
    test_users = [
        {'email': 'test@example.com', 'name': 'Test User', 'password': 'test123456'},
        {'email': 'demo@example.com', 'name': 'Demo User', 'password': 'demo123456'},
    ]
    
    for user_data in test_users:
        if not User.objects.filter(email=user_data['email']).exists():
            User.objects.create_user(**user_data)
            print(f"   ✅ Created: {user_data['name']} ({user_data['email']})")
        else:
            print(f"   ⏭️  Skipped: {user_data['email']} (already exists)")
    
    print()

def main():
    print("=" * 60)
    print("🚀 AI Career Compass - Backend Setup")
    print("=" * 60)
    print()
    
    # Step 1: Setup database
    setup_database()
    
    # Step 2: Create superuser
    create_superuser()
    
    # Step 3: Ask about test users
    create_test = input("Create test users? (y/n): ").strip().lower()
    if create_test == 'y':
        create_test_users()
    
    print("=" * 60)
    print("✅ Setup completed!")
    print("=" * 60)
    print()
    print("Next steps:")
    print("1. Start the server: python manage.py runserver")
    print("2. Access admin panel: http://localhost:8000/admin/")
    print("3. Test API: http://localhost:8000/api/")
    print()

if __name__ == '__main__':
    main()
