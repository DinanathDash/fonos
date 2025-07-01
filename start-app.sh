#!/bin/bash

echo "Starting Fonos Music App with YouTube Music API integration"
echo "========================================================"
echo "Starting backend server..."
node server.js &
SERVER_PID=$!

echo "Starting frontend development server..."
npm run dev

# When npm run dev exits, kill the server process
echo "Shutting down backend server..."
kill $SERVER_PID

echo "All services stopped."
