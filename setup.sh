#!/bin/bash

# ============================================================
# Awaaz - Complete Setup Script for macOS/Linux
# ============================================================
# This script automates the entire setup process for Awaaz

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}============================================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}============================================================${NC}"
    echo
}

print_ok() {
    echo -e "${GREEN}[OK]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_action() {
    echo -e "${YELLOW}[ACTION REQUIRED]${NC} $1"
}

# Main Setup
clear

echo
print_header "Awaaz - Development Environment Setup"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed!"
    echo "Please download and install Node.js from https://nodejs.org/"
    exit 1
fi

print_ok "Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed!"
    echo "Please install npm along with Node.js"
    exit 1
fi

print_ok "npm version: $(npm --version)"

# Check if Git is installed
if command -v git &> /dev/null; then
    print_ok "Git version: $(git --version)"
else
    print_warning "Git is not installed (optional)"
fi

echo
print_header "Step 1: Installing Frontend Dependencies"
echo

if [ -d "node_modules" ]; then
    print_info "node_modules already exists, skipping..."
else
    echo "Installing root dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        print_error "Failed to install frontend dependencies!"
        exit 1
    fi
fi

print_ok "Frontend dependencies installed"

echo
print_header "Step 2: Installing Backend Dependencies"
echo

cd backend

if [ -d "node_modules" ]; then
    print_info "node_modules already exists in backend, skipping..."
else
    echo "Installing backend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        print_error "Failed to install backend dependencies!"
        cd ..
        exit 1
    fi
fi

print_ok "Backend dependencies installed"

cd ..

echo
print_header "Step 3: Creating Environment Variables Files"
echo

# Create .env file in root if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    print_ok ".env created in root directory"
    print_action "Edit .env with your configuration:"
    echo "  - REACT_APP_API_URL"
    echo "  - REACT_APP_CLOUDINARY_CLOUD_NAME"
else
    print_info ".env already exists"
fi

# Create .env file in backend if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env file from backend/.env.example..."
    cp backend/.env.example backend/.env
    print_ok "backend/.env created"
    print_action "Edit backend/.env with your configuration:"
    echo "  - MONGODB_URI or database credentials"
    echo "  - JWT_SECRET"
    echo "  - CLOUDINARY credentials"
    echo "  - EMAIL configuration (optional)"
else
    print_info "backend/.env already exists"
fi

echo
print_header "Step 4: Database Setup Check"
echo

# Check if MongoDB is installed
if command -v mongosh &> /dev/null; then
    print_ok "MongoDB shell found"
    mongosh --version
elif command -v mongo &> /dev/null; then
    print_ok "MongoDB (legacy) found"
    mongo --version
else
    print_warning "MongoDB is not in system PATH"
    echo "MongoDB setup options:"
    echo "  1. Download: https://www.mongodb.com/try/download/community"
    echo "  2. Use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas"
    echo
    print_action "Make sure MongoDB is configured in backend/.env"
fi

# Check if PostgreSQL is installed (optional)
if command -v psql &> /dev/null; then
    print_ok "PostgreSQL found"
    psql --version
else
    print_info "PostgreSQL not found (optional for development)"
fi

echo
print_header "Step 5: Verifying Installation"
echo

# Check frontend package.json
if [ -f "package.json" ]; then
    print_ok "Frontend package.json found"
else
    print_error "Frontend package.json not found!"
    exit 1
fi

# Check backend package.json
if [ -f "backend/package.json" ]; then
    print_ok "Backend package.json found"
else
    print_error "Backend package.json not found!"
    exit 1
fi

# Check node_modules
if [ -d "node_modules" ]; then
    print_ok "Frontend node_modules exists"
else
    print_warning "Frontend node_modules not found"
fi

if [ -d "backend/node_modules" ]; then
    print_ok "Backend node_modules exists"
else
    print_warning "Backend node_modules not found"
fi

echo
print_header "Setup Complete!"
echo

echo "Next Steps:"
echo
echo "1. CONFIGURE ENVIRONMENT VARIABLES:"
echo "   - Edit: .env (frontend)"
echo "   - Edit: backend/.env (backend)"
echo
echo "2. ENSURE DATABASE IS RUNNING:"
echo "   - MongoDB: Start mongod or use MongoDB Atlas connection"
echo
echo "3. START DEVELOPMENT SERVERS (Open 3 separate terminals):"
echo
echo "   ${YELLOW}Terminal 1${NC} - Backend:"
echo "   cd backend"
echo "   npm run dev"
echo
echo "   ${YELLOW}Terminal 2${NC} - Frontend:"
echo "   npm start"
echo
echo "   ${YELLOW}Terminal 3${NC} - Tests (optional):"
echo "   npm test"
echo
echo "4. ACCESS THE APPLICATION:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API Docs: http://localhost:5000/api-docs"
echo

print_header "Additional Commands"
echo
echo "npm run build              - Build for production"
echo "npm test                   - Run frontend tests"
echo "cd backend && npm test     - Run backend tests"
echo "npm run cypress:open       - Run E2E tests"
echo

print_header "Documentation"
echo
echo "- Setup Guide: SETUP_GUIDE.md"
echo "- Readme: README.md"
echo "- Backend API: BACKEND_README.md"
echo "- Contributing: contributing.md"
echo

echo
