#!/usr/bin/env node
/**
 * Robust startup script for CareerPathak
 * Ensures ALL services start together with proper error handling
 */

import { spawn, exec } from 'child_process';
import { existsSync, writeFileSync } from 'fs';
import { promisify } from 'util';
import { join } from 'path';

const execAsync = promisify(exec);

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

async function killPortProcesses() {
  log('🔄 Killing any existing processes on ports 8080, 3001, 8000...', 'yellow');
  
  const ports = [8080, 3001, 8000];
  
  for (const port of ports) {
    try {
      // Windows command to find and kill process on port
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
      
      if (stdout.trim()) {
        const lines = stdout.trim().split('\n');
        const pids = new Set();
        
        lines.forEach(line => {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 5 && parts[3] === 'LISTENING') {
            pids.add(parts[4]);
          }
        });
        
        for (const pid of pids) {
          try {
            await execAsync(`taskkill /F /PID ${pid}`);
            log(`  ✅ Killed process ${pid} on port ${port}`, 'green');
          } catch (error) {
            // Process might already be dead, ignore
          }
        }
      }
    } catch (error) {
      // No process on this port, which is good
    }
  }
  
  // Wait a moment for ports to be freed
  await new Promise(resolve => setTimeout(resolve, 2000));
}

function createAIBackendEnv() {
  const envPath = join(process.cwd(), 'ai-backend', '.env');
  
  if (!existsSync(envPath)) {
    log('📝 Creating AI Backend .env file...', 'yellow');
    
    const envContent = `# AI Backend Environment Configuration

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
    
    writeFileSync(envPath, envContent);
    log('✅ Created ai-backend/.env', 'green');
  }
}

async function installPythonDependencies() {
  log('🐍 Checking Python dependencies...', 'cyan');
  
  try {
    // Check if required packages are installed
    await execAsync('python -c "import fastapi, google.generativeai, uvicorn"');
    log('✅ Python dependencies are ready', 'green');
    return true;
  } catch (error) {
    log('📦 Installing Python dependencies...', 'yellow');
    
    try {
      const { stdout, stderr } = await execAsync('pip install -r ai-backend/requirements.txt');
      log('✅ Python dependencies installed', 'green');
      return true;
    } catch (installError) {
      log('❌ Failed to install Python dependencies', 'red');
      log(`Error: ${installError.message}`, 'red');
      return false;
    }
  }
}

async function testAIBackend() {
  log('🧪 Testing AI Backend startup...', 'cyan');
  
  return new Promise((resolve) => {
    const testProcess = spawn('python', ['ai-backend/main.py'], {
      stdio: 'pipe',
      env: { ...process.env, PYTHONUNBUFFERED: '1' }
    });
    
    let output = '';
    let hasStarted = false;
    
    testProcess.stdout.on('data', (data) => {
      output += data.toString();
      if (output.includes('Application startup complete')) {
        hasStarted = true;
        testProcess.kill();
        log('✅ AI Backend can start successfully', 'green');
        resolve(true);
      }
    });
    
    testProcess.stderr.on('data', (data) => {
      const error = data.toString();
      if (error.includes('ModuleNotFoundError') || error.includes('ImportError')) {
        testProcess.kill();
        log('❌ AI Backend has import errors', 'red');
        log(`Error: ${error}`, 'red');
        resolve(false);
      }
    });
    
    testProcess.on('close', (code) => {
      if (!hasStarted && code !== 0) {
        log('❌ AI Backend failed to start', 'red');
        resolve(false);
      } else if (!hasStarted) {
        log('✅ AI Backend test completed', 'green');
        resolve(true);
      }
    });
    
    // Timeout after 10 seconds
    setTimeout(() => {
      if (!hasStarted) {
        testProcess.kill();
        log('⏰ AI Backend test timeout', 'yellow');
        resolve(false);
      }
    }, 10000);
  });
}

async function startAllServices() {
  log('🚀 CareerPathak - Starting ALL Services', 'bright');
  log('=' .repeat(60), 'cyan');
  
  // Step 1: Kill existing processes
  await killPortProcesses();
  
  // Step 2: Create environment files
  createAIBackendEnv();
  
  // Step 3: Install Python dependencies
  const pythonReady = await installPythonDependencies();
  if (!pythonReady) {
    log('❌ Python setup failed. Exiting.', 'red');
    process.exit(1);
  }
  
  // Step 4: Test AI Backend
  const aiBackendReady = await testAIBackend();
  if (!aiBackendReady) {
    log('⚠️  AI Backend has issues, but continuing with fallback questions...', 'yellow');
  }
  
  // Step 5: Start all services
  log('\n🎯 Starting all services simultaneously...', 'bright');
  log('📱 Frontend: http://localhost:8080', 'blue');
  log('🔧 Backend API: http://localhost:3001', 'green');
  log('🧠 AI Backend: http://localhost:8000', 'yellow');
  log('📚 AI Docs: http://localhost:8000/docs', 'yellow');
  log('\n⏹️  Press Ctrl+C to stop all services\n', 'magenta');
  
  // Use concurrently with better error handling
  const concurrentlyProcess = spawn('npx', [
    'concurrently',
    '--kill-others-on-fail',
    '--prefix-colors', 'green,yellow,blue',
    '--names', 'Backend,AI-Backend,Frontend',
    '--restart-tries', '3',
    '--restart-after', '2000',
    '"npm run dev --prefix backend"',
    '"python ai-backend/main.py"',
    '"vite --host 0.0.0.0 --port 8080"'
  ], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      PYTHONUNBUFFERED: '1',
      NODE_ENV: 'development'
    }
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    log('\n👋 Shutting down all services...', 'yellow');
    concurrentlyProcess.kill('SIGTERM');
    
    // Give processes time to shut down gracefully
    setTimeout(() => {
      concurrentlyProcess.kill('SIGKILL');
      process.exit(0);
    }, 3000);
  });
  
  process.on('SIGTERM', () => {
    concurrentlyProcess.kill('SIGTERM');
    process.exit(0);
  });
  
  concurrentlyProcess.on('close', (code) => {
    if (code !== 0) {
      log(`\n❌ Services exited with code ${code}`, 'red');
      log('💡 Try running: npm run clean-start', 'yellow');
    }
    process.exit(code);
  });
  
  concurrentlyProcess.on('error', (error) => {
    log(`❌ Failed to start services: ${error.message}`, 'red');
    process.exit(1);
  });
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  log(`❌ Unhandled Rejection at: ${promise}, reason: ${reason}`, 'red');
});

// Start the services
startAllServices().catch((error) => {
  log(`❌ Startup failed: ${error.message}`, 'red');
  process.exit(1);
});