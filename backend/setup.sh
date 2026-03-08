#!/bin/bash

echo "🚀 Setting up AI Career Compass Backend..."

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file - Please add your API keys"
fi

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Populate careers
python manage.py populate_careers

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env and add your API keys (optional)"
echo "2. Create superuser: python manage.py createsuperuser"
echo "3. Run server: python manage.py runserver"
