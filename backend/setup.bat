@echo off
echo Setting up AI Career Compass Backend...

REM Create virtual environment
python -m venv venv
call venv\Scripts\activate

REM Install dependencies
pip install -r requirements.txt

REM Copy environment file
if not exist .env (
    copy .env.example .env
    echo Created .env file - Please add your API keys
)

REM Run migrations
python manage.py makemigrations
python manage.py migrate

REM Populate careers
python manage.py populate_careers

echo Setup complete!
echo.
echo Next steps:
echo 1. Edit .env and add your API keys (optional)
echo 2. Create superuser: python manage.py createsuperuser
echo 3. Run server: python manage.py runserver

pause
