#!/bin/bash

# Start Pipecat React Frontend with Custom Camera Controls
echo "🚀 Starting Pipecat React Frontend Development Environment"
echo ""

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start backend in background
echo "📡 Starting Pipecat backend on port 7860..."
python server.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "⚛️  Starting React frontend on port 3000..."
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ Both services are starting up!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:7860"
echo ""
echo "Press Ctrl+C to stop both services"

# Wait for both processes
wait
