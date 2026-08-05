@echo off
REM Awaaz AI-Powered Civic Platform - Startup Script

color 0A
cls

echo ============================================
echo   AWAAZ - AI-Powered Civic Intelligence
echo   Startup Script
echo ============================================
echo.

REM Check if .env file exists
if not exist ".env" (
    echo ERROR: .env file not found!
    echo Please create a .env file with required variables
    echo.
    echo Example:
    echo   PORT=5000
    echo   MONGO_URI=mongodb://localhost:27017/awaaz
    echo   AI_SERVICE_URL=http://localhost:8001/api/v1
    pause
    exit /b 1
)

echo [1/4] Checking if Docker Desktop is running...
tasklist | find /i "docker" >nul
if errorlevel 1 (
    echo Please start Docker Desktop and try again
    pause
    exit /b 1
)

echo [2/4] Building Docker images...
docker-compose build

echo.
echo [3/4] Starting services...
docker-compose up -d

echo.
echo [4/4] Waiting for services to start...
timeout /t 5

echo.
echo ============================================
echo   ✓ All services are starting up!
echo ============================================
echo.
echo Frontend:   http://localhost:3000
echo Backend:    http://localhost:5000
echo AI Service: http://localhost:8001
echo MongoDB:    mongodb://localhost:27017
echo Docs:       http://localhost:5000/api-docs
echo.
echo Open another terminal and run:
echo   docker-compose logs -f
echo.
echo To stop services:
echo   docker-compose down
echo.
pause
