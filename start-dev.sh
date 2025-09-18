#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BOLD}🚀 Starting CareerPathak Development Environment...${NC}"
echo "============================================================"

echo -e "${CYAN}🔍 Checking prerequisites...${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

# Check if Python is installed
if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python not found. Please install Python 3.8+${NC}"
    exit 1
fi

# Use python3 if available, otherwise python
PYTHON_CMD="python"
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
fi

# Check if backend exists
if [ ! -f "backend/package.json" ]; then
    echo -e "${RED}❌ Backend not found at backend/package.json${NC}"
    exit 1
fi

# Check if AI backend exists
if [ ! -f "ai-backend/main.py" ]; then
    echo -e "${RED}❌ AI Backend not found at ai-backend/main.py${NC}"
    exit 1
fi

# Create AI backend .env if it doesn't exist
if [ ! -f "ai-backend/.env" ]; then
    echo -e "${YELLOW}⚠️  Creating AI Backend .env file...${NC}"
    cat > "ai-backend/.env" << EOF
# AI Backend Environment Configuration

# Google Gemini API (Primary AI provider)
GOOGLE_API_KEY=AIzaSyAzYv5Kn-OORcNq3himP_SRMKDoJISwrJ4

# MongoDB Configuration
MONGODB_URI=mongodb+srv://Amartya:Amartya@main-cluster.qybneng.mongodb.net/

# FastAPI Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True

# Gemini Model Configuration
GEMINI_MODEL=gemini-1.5-flash
GEMINI_TEMPERATURE=0.7
GEMINI_MAX_TOKENS=300
EOF
    echo -e "${GREEN}✅ Created ai-backend/.env with Gemini API key${NC}"
fi

echo -e "${GREEN}✅ Prerequisites checked${NC}"

echo ""
echo -e "${CYAN}🐍 Installing Python dependencies...${NC}"
$PYTHON_CMD -m pip install -r ai-backend/requirements.txt
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install Python dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Python dependencies installed${NC}"

echo ""
echo -e "${BOLD}🎯 Starting all services...${NC}"
echo -e "${BLUE}📱 Frontend: http://localhost:8080${NC}"
echo -e "${GREEN}🔧 Backend API: http://localhost:3001${NC}"
echo -e "${YELLOW}🧠 AI Backend: http://localhost:8000${NC}"
echo -e "${YELLOW}📚 AI Docs: http://localhost:8000/docs${NC}"
echo ""
echo -e "${CYAN}⏹️  Press Ctrl+C to stop all services${NC}"
echo ""

# Start all services using concurrently
npx concurrently \
    "npm run dev --prefix backend" \
    "$PYTHON_CMD ai-backend/main.py" \
    "vite" \
    --names "Backend,AI-Backend,Frontend" \
    --prefix-colors "green,yellow,blue" \
    --kill-others-on-fail