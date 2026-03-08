#!/usr/bin/env python
"""
Script to list all users in the database
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def list_users():
    """List all users in the database"""
    print("=" * 80)
    print("👥 User List")
    print("=" * 80)
    print()
    
    users = User.objects.all().order_by('-date_joined')
    
    if not users.exists():
        print("📭 No users found in the database.")
        print()
        print("To create a superuser, run:")
        print("  python manage.py createsuperuser")
        print()
        return
    
    print(f"Total users: {users.count()}")
    print()
    
    # Separate superusers and regular users
    superusers = users.filter(is_superuser=True)
    regular_users = users.filter(is_superuser=False)
    
    if superusers.exists():
        print("🔑 SUPERUSERS (Admin Access):")
        print("-" * 80)
        for user in superusers:
            status = "✅ Active" if user.is_active else "❌ Inactive"
            print(f"  • {user.username}")
            print(f"    Email: {user.email}")
            print(f"    Status: {status}")
            print(f"    Created: {user.created_at.strftime('%Y-%m-%d %H:%M')}")
            print()
    
    if regular_users.exists():
        print("👤 REGULAR USERS:")
        print("-" * 80)
        for user in regular_users:
            status = "✅ Active" if user.is_active else "❌ Inactive"
            print(f"  • {user.name}")
            print(f"    Email: {user.email}")
            print(f"    Status: {status}")
            print(f"    Created: {user.created_at.strftime('%Y-%m-%d %H:%M')}")
            print()
    
    print("=" * 80)
    print()
    print("💡 Tips:")
    print("  • To delete superusers: python delete_superuser.py")
    print("  • To access admin panel: http://localhost:8000/admin/")
    print("  • To create superuser: python manage.py createsuperuser")
    print()

if __name__ == '__main__':
    list_users()
