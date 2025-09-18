@echo off
echo 🚀 Starting CareerPathak Development Environment...
echo ============================================================

echo 🔍 Checking prerequisites...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js 18+
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found. Please install Python 3.8+
    pause
    exit /b 1
)

REM Check if backend exists
if not exist "backend\package.json" (
    echo ❌ Backend not found at backend\package.json
    pause
    exit /b 1
)

REM Check if AI backend exists
if not exist "ai-backend\main.py" (
    echo ❌ AI Backend not found at ai-backend\main.py
    pause
    exit /b 1
)

REM Create AI backend .env if it doesn't exist
if not exist "ai-backend\.env" (
    echo ⚠️  Creating AI Backend .env file...
    (
        echo # AI Backend Environment Configuration
        echo.
        echo # Google Gemini API ^(Primary AI provider^)
        echo GOOGLE_API_KEY=AIzaSyAzYv5Kn-OORcNq3himP_SRMKDoJISwrJ4
        echo.
        echo # MongoDB Configuration
        echo MONGODB_URI=mongodb+srv://Amartya:Amartya@main-cluster.qybneng.mongodb.net/
        echo.
        echo # FastAPI Configuration
        echo HOST=0.0.0.0
        echo PORT=8000
        echo DEBUG=True
        echo.
        echo # Gemini Model Configuration
        echo GEMINI_MODEL=gemini-1.5-flash
        echo GEMINI_TEMPERATURE=0.7
        echo GEMINI_MAX_TOKENS=300
    ) > "ai-backend\.env"
    echo ✅ Created ai-backend\.env with Gemini API key
)

echo ✅ Prerequisites checked

echo.
echo 🐍 Installing Python dependencies...
pip install -r ai-backend\requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Failed to install Python dependencies
    pause
    exit /b 1
)

echo ✅ Python dependencies installed

echo.
echo 🎯 Starting all services...
echo 📱 Frontend: http://localhost:8080
echo 🔧 Backend API: http://localhost:3001  
echo 🧠 AI Backend: http://localhost:8000
echo 📚 AI Docs: http://localhost:8000/docs
echo.
echo ⏹️  Press Ctrl+C to stop all services
echo.

REM Start all services using concurrently
npx concurrently "npm run dev --prefix backend" "python ai-backend/main.py" "vite" --names "Backend,AI-Backend,Frontend" --prefix-colors "green,yellow,blue" --kill-others-on-fail

pause