#!/usr/bin/env python
"""
Quick setup script for Sokoni Kiganjani database.
Run this after installing dependencies to set up the database.

Usage:
    python setup_database.py
"""
import os
import sys
import subprocess


def run_command(command, description):
    """Run a command and print status."""
    print(f"\n{'='*50}")
    print(f">>> {description}")
    print(f"{'='*50}")
    result = subprocess.run(command, shell=True)
    if result.returncode != 0:
        print(f"ERROR: {description} failed!")
        return False
    print(f"SUCCESS: {description}")
    return True


def main():
    print("\n" + "="*60)
    print("   SOKONI KIGANJANI - DATABASE SETUP")
    print("="*60)
    
    # Check if we're in the right directory
    if not os.path.exists('manage.py'):
        print("ERROR: Please run this script from the django-backend directory!")
        print("       cd django-backend && python setup_database.py")
        sys.exit(1)
    
    # Create .env file if it doesn't exist
    if not os.path.exists('.env'):
        print("\nCreating .env file with default settings...")
        env_content = """# Django Settings
DJANGO_SECRET_KEY=dev-secret-key-change-in-production-12345
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (SQLite by default)
USE_SQLITE=True

# CORS (Frontend URL)
CORS_ALLOWED_ORIGINS=http://localhost:3000
"""
        with open('.env', 'w') as f:
            f.write(env_content)
        print("SUCCESS: Created .env file")
    
    # Run migrations
    if not run_command('python manage.py migrate', 'Running database migrations'):
        sys.exit(1)
    
    # Create superuser
    print("\n" + "="*50)
    print(">>> Creating admin superuser")
    print("="*50)
    print("\nYou'll be asked to create an admin account.")
    print("Use this account to access the Django admin panel at /admin/")
    print("-"*50)
    
    try:
        subprocess.run('python manage.py createsuperuser', shell=True)
    except KeyboardInterrupt:
        print("\nSkipped superuser creation.")
    
    # Seed test data
    print("\n" + "="*50)
    seed_data = input("Do you want to seed test data? (y/n): ").lower().strip()
    if seed_data == 'y':
        run_command('python manage.py seed_data', 'Seeding test data')
    
    print("\n" + "="*60)
    print("   SETUP COMPLETE!")
    print("="*60)
    print("""
Next steps:
-----------
1. Start the server:
   python manage.py runserver

2. Access the admin panel:
   http://localhost:8000/admin/

3. API endpoints available at:
   http://localhost:8000/api/

Test Login Credentials (if seeded):
-----------------------------------
Customer: customer@sokoni.com / customer123
Seller:   seller@sokoni.com / seller123  
Boda:     boda@sokoni.com / boda123
Admin:    admin@sokoni.com / admin123
""")


if __name__ == '__main__':
    main()
