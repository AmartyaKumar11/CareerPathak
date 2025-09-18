# 🚀 CareerPathak Development Setup

## Quick Start

### Option 1: One Command (Recommended)
```bash
npm run dev
```

### Option 2: Platform-Specific Scripts

**Windows:**
```cmd
start-dev.bat
```

**Linux/Mac:**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

## What Happens When You Run `npm run dev`

The command automatically starts **all three services**:

1. **🔧 Backend API** (Node.js + Express) - `http://localhost:3001`
2. **🧠 AI Backend** (Python + FastAPI) - `http://localhost:8000`
3. **📱 Frontend** (React + Vite) - `http://localhost:8080`

## Services Overview

### 📱 Frontend (React + TypeScript)
- **URL**: http://localhost:8080
- **Technology**: React 18, TypeScript, Vite, Tailwind CSS
- **Features**: Psychometric test UI, dashboard, career recommendations

### 🔧 Backend API (Node.js)
- **URL**: http://localhost:3001
- **Technology**: Express.js, MongoDB, REST API
- **Features**: User management, data storage, authentication

### 🧠 AI Backend (Python)
- **URL**: http://localhost:8000
- **Technology**: FastAPI, Google Gemini AI, MongoDB
- **Features**: AI question generation, psychometric analysis
- **API Docs**: http://localhost:8000/docs

## Prerequisites

### Required Software
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Python 3.8+** - [Download](https://python.org/)
- **Git** - [Download](https://git-scm.com/)

### API Keys (Already Configured)
- ✅ **Gemini API Key**: Already set in ai-backend/.env
- ✅ **MongoDB URI**: Already configured for development

## Installation

### 1. Clone Repository
```bash
git clone https://github.com/AmartyaKumar11/CareerPathak.git
cd CareerPathak
```

### 2. Install All Dependencies
```bash
npm run install:all
```

Or manually:
```bash
# Frontend dependencies
npm install

# Backend dependencies
npm install --prefix backend

# AI Backend dependencies
pip install -r ai-backend/requirements.txt
```

### 3. Start Development Environment
```bash
npm run dev
```

## Available Scripts

### Development
- `npm run dev` - Start all services (Frontend + Backend + AI)
- `npm run dev:frontend` - Start only frontend
- `npm run dev:backend` - Start only Node.js backend
- `npm run dev:ai` - Start only AI backend

### Setup & Testing
- `npm run install:all` - Install all dependencies
- `npm run setup:ai` - Setup AI backend environment
- `npm run test:ai` - Test Gemini AI integration

### Build & Deploy
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build

## Environment Configuration

### Frontend (.env)
```bash
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

### Backend (backend/.env)
```bash
MONGODB_URI=mongodb+srv://...
PORT=3001
```

### AI Backend (ai-backend/.env) - Auto-created
```bash
GOOGLE_API_KEY=AIzaSyAzYv5Kn-OORcNq3himP_SRMKDoJISwrJ4
GEMINI_MODEL=gemini-1.5-flash
MONGODB_URI=mongodb+srv://...
PORT=8000
```

## Development Workflow

### 1. Start Development
```bash
npm run dev
```

### 2. Access Services
- **Main App**: http://localhost:8080
- **API Docs**: http://localhost:8000/docs
- **Backend Health**: http://localhost:3001/api/health

### 3. Test AI Integration
- **Gemini Test**: http://localhost:8000/test-gemini
- **AI Status**: http://localhost:8000/ai-status

### 4. Take Psychometric Test
- Navigate to: http://localhost:8080/quiz
- Or: http://localhost:8080/ai-assessment

## Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# Kill processes on ports
npx kill-port 8080 3001 8000

# Or change ports in configuration files
```

**2. Python Dependencies Failed**
```bash
# Try with pip3
pip3 install -r ai-backend/requirements.txt

# Or use virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
pip install -r ai-backend/requirements.txt
```

**3. Gemini API Issues**
```bash
# Test API key directly
python test_gemini_integration.py

# Check API status
curl http://localhost:8000/ai-status
```

**4. MongoDB Connection Issues**
- Check internet connection
- Verify MongoDB URI in .env files
- Check MongoDB Atlas dashboard

### Debug Commands

```bash
# Check service status
curl http://localhost:8080        # Frontend
curl http://localhost:3001/api/health  # Backend
curl http://localhost:8000/health      # AI Backend

# View logs
npm run dev  # Shows all service logs with colors

# Test individual services
npm run dev:frontend
npm run dev:backend  
npm run dev:ai
```

## File Structure

```
CareerPathak/
├── src/                          # Frontend React app
├── backend/                      # Node.js API server
├── ai-backend/                   # Python AI services
│   ├── main.py                   # FastAPI app
│   ├── psychometric_ai.py        # AI logic
│   ├── .env                      # AI configuration (auto-created)
│   └── requirements.txt          # Python dependencies
├── start-dev.js                  # Node.js startup script
├── start-dev.bat                 # Windows batch script
├── start-dev.sh                  # Linux/Mac shell script
└── package.json                  # Main project configuration
```

## Performance Tips

### Development
- Use `npm run dev` for full development experience
- Individual services for debugging specific issues
- Hot reload enabled for all services

### Production
- Frontend: `npm run build` → Deploy to Vercel/Netlify
- Backend: Deploy to Railway/Heroku
- AI Backend: Deploy to Railway/Google Cloud Run

## Security Notes

### Environment Files (.env)
- ✅ Added to .gitignore
- ✅ Never commit API keys
- ✅ Use different keys for production

### API Keys
- Gemini API key included for development
- Replace with your own for production
- Monitor usage in Google Cloud Console

## Next Steps

1. **Start Development**: `npm run dev`
2. **Test Psychometric Assessment**: http://localhost:8080/quiz
3. **Check AI Generation**: http://localhost:8000/test-gemini
4. **Explore API**: http://localhost:8000/docs
5. **Build Features**: Modify code and see live updates

---

**🎯 Happy coding! Your AI-powered career guidance platform is ready for development.**