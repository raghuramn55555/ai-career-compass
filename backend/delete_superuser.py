#!/usr/bin/env python
"""
Script to delete superuser accounts
Run this if you want to remove admin accounts
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def delete_superusers():
    """Delete all superuser accounts"""
    print("=" * 60)
    print("🗑️  Delete Superuser Accounts")
    print("=" * 60)
    print()
    
    # Find all superusers
    superusers = User.objects.filter(is_superuser=True)
    
    if not superusers.exists():
        print("✅ No superusers found. Nothing to delete.")
        print()
        return
    
    print(f"Found {superusers.count()} superuser(s):")
    print()
    for user in superusers:
        print(f"  • {user.username} ({user.email})")
    print()
    
    # Confirm deletion
    confirm = input("⚠️  Are you sure you want to delete ALL superusers? (yes/no): ").strip().lower()
    
    if confirm != 'yes':
        print("❌ Deletion cancelled.")
        print()
        return
    
    # Delete superusers
    count = superusers.count()
    superusers.delete()
    
    print()
    print(f"✅ Successfully deleted {count} superuser(s)!")
    print()
    print("Note: You can create a new superuser anytime with:")
    print("  python manage.py createsuperuser")
    print()

def delete_specific_superuser():
    """Delete a specific superuser by email"""
    print("=" * 60)
    print("🗑️  Delete Specific Superuser")
    print("=" * 60)
    print()
    
    # List all superusers
    superusers = User.objects.filter(is_superuser=True)
    
    if not superusers.exists():
        print("✅ No superusers found.")
        print()
        return
    
    print("Existing superusers:")
    for i, user in enumerate(superusers, 1):
        print(f"  {i}. {user.name} ({user.email})")
    print()
    
    email = input("Enter email of superuser to delete: ").strip()
    
    try:
        user = User.objects.get(email=email, is_superuser=True)
        print()
        print(f"Found: {user.name} ({user.email})")
        confirm = input("⚠️  Delete this superuser? (yes/no): ").strip().lower()
        
        if confirm == 'yes':
            user.delete()
            print()
            print(f"✅ Deleted superuser: {email}")
            print()
        else:
            print("❌ Deletion cancelled.")
            print()
    except User.DoesNotExist:
        print()
        print(f"❌ No superuser found with email: {email}")
        print()

def main():
    print()
    print("Choose an option:")
    print("1. Delete ALL superusers")
    print("2. Delete specific superuser")
    print("3. Cancel")
    print()
    
    choice = input("Enter choice (1-3): ").strip()
    print()
    
    if choice == '1':
        delete_superusers()
    elif choice == '2':
        delete_specific_superuser()
    else:
        print("❌ Cancelled.")
        print()

if __name__ == '__main__':
    main()
