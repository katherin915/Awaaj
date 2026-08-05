@echo off
REM ============================================================
REM Awaaz - Complete Setup Script for Windows
REM ============================================================
REM This script automates the entire setup process for Awaaz

setlocal enabledelayedexpansion
color 0A
cls

echo.
echo ============================================================
echo   Awaaz - Development Environment Setup
echo ============================================================
echo.

REM Check if Node.js is installed
node -v >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed!
    echo Please download and install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js version:
node --version

REM Check if npm is installed
npm -v >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not installed!
    echo Please install npm along with Node.js
    pause
    exit /b 1
)

echo [OK] npm version:
npm --version

REM Check if Git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Git is not installed (optional)
    echo You can download it from https://git-scm.com/
) else (
    echo [OK] Git version:
    git --version
)

echo.
echo ============================================================
echo   Step 1: Installing Frontend Dependencies
echo ============================================================
echo.

if exist "node_modules" (
    echo [INFO] node_modules already exists, skipping...
) else (
    echo Installing root dependencies...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install frontend dependencies!
        pause
        exit /b 1
    )
)

echo [OK] Frontend dependencies installed

echo.
echo ============================================================
echo   Step 2: Installing Backend Dependencies
echo ============================================================
echo.

cd backend

if exist "node_modules" (
    echo [INFO] node_modules already exists in backend, skipping...
) else (
    echo Installing backend dependencies...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install backend dependencies!
        cd ..
        pause
        exit /b 1
    )
)

echo [OK] Backend dependencies installed

cd ..

echo.
echo ============================================================
echo   Step 3: Creating Environment Variables Files
echo ============================================================
echo.

REM Create .env file in root if it doesn't exist
if not exist ".env" (
    echo Creating .env file from .env.example...
    copy .env.example .env >nul
    echo [OK] .env created in root directory
    echo [ACTION REQUIRED] Edit .env with your configuration:
    echo   - REACT_APP_API_URL
    echo   - REACT_APP_CLOUDINARY_CLOUD_NAME
) else (
    echo [INFO] .env already exists
)

REM Create .env file in backend if it doesn't exist
if not exist "backend\.env" (
    echo Creating backend/.env file from backend/.env.example...
    copy backend\.env.example backend\.env >nul
    echo [OK] backend/.env created
    echo [ACTION REQUIRED] Edit backend/.env with your configuration:
    echo   - MONGODB_URI or database credentials
    echo   - JWT_SECRET
    echo   - CLOUDINARY credentials
    echo   - EMAIL configuration (optional)
) else (
    echo [INFO] backend/.env already exists
)

echo.
echo ============================================================
echo   Step 4: Database Setup Check
echo ============================================================
echo.

REM Check if MongoDB is installed
where mongosh >nul 2>&1
if errorlevel 1 (
    echo [WARNING] MongoDB is not in system PATH
    echo MongoDB setup options:
    echo   1. Download: https://www.mongodb.com/try/download/community
    echo   2. Use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas
    echo.
    echo [ACTION REQUIRED] Make sure MongoDB is configured in backend/.env
) else (
    echo [OK] MongoDB shell found
    mongosh --version
)

REM Check if PostgreSQL is installed (optional)
where psql >nul 2>&1
if errorlevel 1 (
    echo [INFO] PostgreSQL not found (optional for development)
) else (
    echo [OK] PostgreSQL found
    psql --version
)

echo.
echo ============================================================
echo   Step 5: Verifying Installation
echo ============================================================
echo.

REM Check frontend package.json
if exist "package.json" (
    echo [OK] Frontend package.json found
) else (
    echo [ERROR] Frontend package.json not found!
    pause
    exit /b 1
)

REM Check backend package.json
if exist "backend\package.json" (
    echo [OK] Backend package.json found
) else (
    echo [ERROR] Backend package.json not found!
    pause
    exit /b 1
)

REM Check node_modules
if exist "node_modules" (
    echo [OK] Frontend node_modules exists
) else (
    echo [WARNING] Frontend node_modules not found
)

if exist "backend\node_modules" (
    echo [OK] Backend node_modules exists
) else (
    echo [WARNING] Backend node_modules not found
)

echo.
echo ============================================================
echo   Setup Complete!
echo ============================================================
echo.

echo Next Steps:
echo.
echo 1. CONFIGURE ENVIRONMENT VARIABLES:
echo    - Edit: .env (frontend)
echo    - Edit: backend\.env (backend)
echo.
echo 2. ENSURE DATABASE IS RUNNING:
echo    - MongoDB: Start mongod or use MongoDB Atlas connection
echo.
echo 3. START DEVELOPMENT SERVERS (Open 3 separate terminals):
echo.
echo    Terminal 1 - Backend:
echo    cd backend
echo    npm run dev
echo.
echo    Terminal 2 - Frontend:
echo    npm start
echo.
echo    Terminal 3 - Tests (optional):
echo    npm test
echo.
echo 4. ACCESS THE APPLICATION:
echo    - Frontend: http://localhost:3000
echo    - Backend API Docs: http://localhost:5000/api-docs
echo.

echo ============================================================
echo Additional Commands:
echo ============================================================
echo.
echo npm run build          - Build for production
echo npm test               - Run frontend tests
echo cd backend && npm test - Run backend tests
echo npm run cypress:open   - Run E2E tests
echo.

echo ============================================================
echo Documentation:
echo ============================================================
echo.
echo - Setup Guide: SETUP_GUIDE.md
echo - Readme: README.md
echo - Backend API: BACKEND_README.md
echo - Contributing: contributing.md
echo.

pause
