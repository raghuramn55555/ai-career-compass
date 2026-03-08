@echo off
echo ========================================
echo   AI Career Compass - Quick Start
echo ========================================
echo.

REM Check if backend is set up
if not exist "backend\venv" (
    echo Backend not set up. Running setup...
    cd backend
    call setup.bat
    cd ..
)

REM Check if frontend is set up
if not exist "ai-career-compass\node_modules" (
    echo Frontend not set up. Installing dependencies...
    cd ai-career-compass
    call npm install
    cd ..
)

echo.
echo Starting servers...
echo.

REM Start backend in new window
start "Backend Server" cmd /k "cd backend && venv\Scripts\activate && python manage.py runserver"

REM Wait a bit for backend to start
timeout /t 3 /nobreak > nul

REM Start frontend in new window
start "Frontend Server" cmd /k "cd ai-career-compass && npm run dev"

echo.
echo ========================================
echo   Servers Starting!
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo Admin:    http://localhost:8000/admin
echo.
echo Press any key to stop all servers...
pause > nul

REM Kill the servers
taskkill /FI "WindowTitle eq Backend Server*" /T /F
taskkill /FI "WindowTitle eq Frontend Server*" /T /F

echo.
echo Servers stopped.
pause
