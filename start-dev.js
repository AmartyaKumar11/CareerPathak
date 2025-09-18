#!/usr/bin/env node
/**
 * Development startup script for CareerPathak
 * Ensures all services (Frontend, Backend, AI Backend) start correctly
 */

import { spawn } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkPrerequisites() {
  log('🔍 Checking prerequisites...', 'cyan');
  
  // Check if Node.js backend exists
  const backendPath = join(__dirname, 'backend', 'package.json');
  if (!existsSync(backendPath)) {
    log('❌ Backend not found at backend/package.json', 'red');
    return false;
  }
  
  // Check if AI backend exists
  const aiBackendPath = join(__dirname, 'ai-backend', 'main.py');
  if (!existsSync(aiBackendPath)) {
    log('❌ AI Backend not found at ai-backend/main.py', 'red');
    return false;
  }
  
  // Check if AI backend .env exists
  const aiEnvPath = join(__dirname, 'ai-backend', '.env');
  if (!existsSync(aiEnvPath)) {
    log('⚠️  AI Backend .env not found, creating from template...', 'yellow');
    
    const envTemplate = `# AI Backend Environment Configuration

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
`;
    
    try {
      require('fs').writeFileSync(aiEnvPath, envTemplate);
      log('✅ Created ai-backend/.env with Gemini API key', 'green');
    } catch (error) {
      log(`❌ Failed to create .env file: ${error.message}`, 'red');
      return false;
    }
  }
  
  log('✅ All prerequisites checked', 'green');
  return true;
}

function checkPythonDependencies() {
  log('🐍 Checking Python dependencies...', 'cyan');
  
  return new Promise((resolve) => {
    const pythonCheck = spawn('python', ['-c', 'import fastapi, google.generativeai, uvicorn; print("OK")'], {
      stdio: 'pipe'
    });
    
    pythonCheck.on('close', (code) => {
      if (code === 0) {
        log('✅ Python dependencies are installed', 'green');
        resolve(true);
      } else {
        log('⚠️  Installing Python dependencies...', 'yellow');
        
        const pipInstall = spawn('pip', ['install', '-r', 'ai-backend/requirements.txt'], {
          stdio: 'inherit'
        });
        
        pipInstall.on('close', (installCode) => {
          if (installCode === 0) {
            log('✅ Python dependencies installed successfully', 'green');
            resolve(true);
          } else {
            log('❌ Failed to install Python dependencies', 'red');
            log('💡 Try running: pip install -r ai-backend/requirements.txt', 'yellow');
            resolve(false);
          }
        });
      }
    });
    
    pythonCheck.on('error', () => {
      log('❌ Python not found. Please install Python 3.8+', 'red');
      resolve(false);
    });
  });
}

async function startServices() {
  log('🚀 Starting CareerPathak Development Environment...', 'bright');
  log('=' .repeat(60), 'cyan');
  
  // Check prerequisites
  if (!checkPrerequisites()) {
    process.exit(1);
  }
  
  // Check Python dependencies
  const pythonReady = await checkPythonDependencies();
  if (!pythonReady) {
    log('❌ Python environment not ready', 'red');
    process.exit(1);
  }
  
  log('\n🎯 Starting all services...', 'bright');
  log('📱 Frontend: http://localhost:8080', 'blue');
  log('🔧 Backend API: http://localhost:3001', 'green');
  log('🧠 AI Backend: http://localhost:8000', 'yellow');
  log('📚 AI Docs: http://localhost:8000/docs', 'yellow');
  log('\n⏹️  Press Ctrl+C to stop all services\n', 'magenta');
  
  // Start services using concurrently
  const concurrently = spawn('npx', [
    'concurrently',
    '"npm run dev --prefix backend"',
    '"python ai-backend/main.py"',
    '"vite"',
    '--names', 'Backend,AI-Backend,Frontend',
    '--prefix-colors', 'green,yellow,blue',
    '--kill-others-on-fail'
  ], {
    stdio: 'inherit',
    shell: true
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    log('\n👋 Shutting down all services...', 'yellow');
    concurrently.kill('SIGINT');
    process.exit(0);
  });
  
  concurrently.on('close', (code) => {
    if (code !== 0) {
      log(`\n❌ Services exited with code ${code}`, 'red');
    }
    process.exit(code);
  });
}

// Run the startup script
startServices().catch((error) => {
  log(`❌ Startup failed: ${error.message}`, 'red');
  process.exit(1);
});