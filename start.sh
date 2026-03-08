#!/bin/bash

echo "========================================"
echo "  AI Career Compass - Quick Start"
echo "========================================"
echo ""

# Check if backend is set up
if [ ! -d "backend/venv" ]; then
    echo "Backend not set up. Running setup..."
    cd backend
    bash setup.sh
    cd ..
fi

# Check if frontend is set up
if [ ! -d "ai-career-compass/node_modules" ]; then
    echo "Frontend not set up. Installing dependencies..."
    cd ai-career-compass
    npm install
    cd ..
fi

echo ""
echo "Starting servers..."
echo ""

# Start backend in background
cd backend
source venv/bin/activate
python manage.py runserver &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend in background
cd ai-career-compass
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================"
echo "  Servers Running!"
echo "========================================"
echo ""
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo "Admin:    http://localhost:8000/admin"
echo ""
echo "Press Ctrl+C to stop all servers..."

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
