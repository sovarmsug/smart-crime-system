@echo off
echo Starting Smart Crime System...
echo.

echo Step 1: Starting Backend Server...
cd backend
start "Backend Server" cmd /k "npm run dev"

echo Step 2: Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo Step 3: Starting Frontend...
cd ../frontend
start "Frontend Server" cmd /k "npm start"

echo.
echo Smart Crime System is starting up!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul
