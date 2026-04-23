#!/bin/bash

echo "Starting GiveGuard..."

# Start backend
cd backend
source venv/bin/activate
uvicorn main:app --reload &
BACKEND_PID=$!
echo "Backend running on http://localhost:8000 (PID $BACKEND_PID)"

# Wait for backend to be ready
sleep 2

# Start frontend
cd ../frontend
npm run dev &
FRONTEND_PID=$!
echo "Frontend running on http://localhost:5173 (PID $FRONTEND_PID)"

echo ""
echo "GiveGuard is running!"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"

# Stop both servers on exit
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait