#!/usr/bin/env node
/**
 * Sequential startup script - starts services one by one
 * More reliable than concurrent startup
 */

import { spawn } from 'child_process';
import { existsSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

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

function createEnvFiles() {
    // Create AI backend .env from .env.example
    const aiEnvPath = join(process.cwd(), 'ai-backend', '.env');
    const aiEnvExamplePath = join(process.cwd(), 'ai-backend', '.env.example');
    
    if (!existsSync(aiEnvPath) && existsSync(aiEnvExamplePath)) {
        const envContent = readFileSync(aiEnvExamplePath, 'utf8');
        writeFileSync(aiEnvPath, envContent);
        log('✅ Created ai-backend/.env from .env.example', 'green');
    }
    
    // Create backend .env from .env.example
    const backendEnvPath = join(process.cwd(), 'backend', '.env');
    const backendEnvExamplePath = join(process.cwd(), 'backend', '.env.example');
    
    if (!existsSync(backendEnvPath) && existsSync(backendEnvExamplePath)) {
        const envContent = readFileSync(backendEnvExamplePath, 'utf8');
        writeFileSync(backendEnvPath, envContent);
        log('✅ Created backend/.env from .env.example', 'green');
    }
    
    // Create root .env from .env.example
    const rootEnvPath = join(process.cwd(), '.env');
    const rootEnvExamplePath = join(process.cwd(), '.env.example');
    
    if (!existsSync(rootEnvPath) && existsSync(rootEnvExamplePath)) {
        const envContent = readFileSync(rootEnvExamplePath, 'utf8');
        writeFileSync(rootEnvPath, envContent);
        log('✅ Created .env from .env.example', 'green');
    }
}

function startService(name, command, args, options = {}) {
    return new Promise((resolve, reject) => {
        log(`🚀 Starting ${name}...`, 'cyan');

        const childProcess = spawn(command, args, {
            stdio: 'pipe',
            shell: true,
            env: { ...process.env, PYTHONUNBUFFERED: '1' },
            ...options
        });

        let hasStarted = false;
        let output = '';

        // Handle stdout
        childProcess.stdout.on('data', (data) => {
            const text = data.toString();
            output += text;

            // Log with service prefix
            text.split('\n').forEach(line => {
                if (line.trim()) {
                    console.log(`${colors.cyan}[${name}]${colors.reset} ${line}`);
                }
            });

            // Check for startup indicators
            if (
                text.includes('Application startup complete') ||
                text.includes('ready in') ||
                text.includes('server running') ||
                text.includes('Connected to MongoDB') ||
                text.includes('Uvicorn running on')
            ) {
                if (!hasStarted) {
                    hasStarted = true;
                    log(`✅ ${name} started successfully`, 'green');
                    resolve(childProcess);
                }
            }
        });

        // Handle stderr
        childProcess.stderr.on('data', (data) => {
            const text = data.toString();

            // Log errors with service prefix
            text.split('\n').forEach(line => {
                if (line.trim()) {
                    console.log(`${colors.red}[${name} ERROR]${colors.reset} ${line}`);
                }
            });

            // Check for critical errors
            if (
                text.includes('ModuleNotFoundError') ||
                text.includes('ImportError') ||
                text.includes('EADDRINUSE') ||
                text.includes('Port') && text.includes('already in use')
            ) {
                if (!hasStarted) {
                    reject(new Error(`${name} failed to start: ${text}`));
                }
            }
        });

        // Handle process exit
        childProcess.on('close', (code) => {
            if (!hasStarted && code !== 0) {
                reject(new Error(`${name} exited with code ${code}`));
            }
        });

        childProcess.on('error', (error) => {
            reject(new Error(`${name} process error: ${error.message}`));
        });

        // Timeout for startup
        setTimeout(() => {
            if (!hasStarted) {
                log(`⏰ ${name} startup timeout, but continuing...`, 'yellow');
                resolve(childProcess);
            }
        }, 15000); // 15 second timeout
    });
}

async function main() {
    log('🚀 CareerPathak - Sequential Service Startup', 'bright');
    log('='.repeat(60), 'cyan');

    const runningProcesses = [];

    try {
        // Create environment files from examples
        createEnvFiles();

        // Start Backend API first (other services depend on it)
        log('\n1️⃣ Starting Backend API...', 'bright');
        const backendProcess = await startService(
            'Backend-API',
            'npm',
            ['run', 'dev', '--prefix', 'backend']
        );
        runningProcesses.push(backendProcess);

        // Wait a moment for backend to fully initialize
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Start AI Backend
        log('\n2️⃣ Starting AI Backend...', 'bright');
        const aiProcess = await startService(
            'AI-Backend',
            'python',
            ['ai-backend/main.py']
        );
        runningProcesses.push(aiProcess);

        // Wait for AI backend to initialize
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Start Frontend last
        log('\n3️⃣ Starting Frontend...', 'bright');
        const frontendProcess = await startService(
            'Frontend',
            'npx',
            ['vite', '--host', '0.0.0.0', '--port', '8080']
        );
        runningProcesses.push(frontendProcess);

        // All services started successfully
        log('\n🎉 ALL SERVICES STARTED SUCCESSFULLY!', 'bright');
        log('='.repeat(60), 'green');
        log('📱 Frontend: http://localhost:8080', 'blue');
        log('🔧 Backend API: http://localhost:3001', 'green');
        log('🧠 AI Backend: http://localhost:8000', 'yellow');
        log('📚 AI Docs: http://localhost:8000/docs', 'yellow');
        log('🧪 Test AI: http://localhost:8000/test-gemini', 'yellow');
        log('\n⏹️  Press Ctrl+C to stop all services', 'magenta');

        // Handle graceful shutdown
        const shutdown = async () => {
            log('\n👋 Shutting down all services...', 'yellow');

            for (const childProc of runningProcesses) {
                try {
                    childProc.kill('SIGTERM');
                } catch (error) {
                    // Process might already be dead
                }
            }

            // Force kill after 5 seconds
            setTimeout(() => {
                for (const childProc of runningProcesses) {
                    try {
                        childProc.kill('SIGKILL');
                    } catch (error) {
                        // Ignore
                    }
                }
                process.exit(0);
            }, 5000);
        };

        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);

        // Keep the main process alive
        process.stdin.resume();

    } catch (error) {
        log(`❌ Failed to start services: ${error.message}`, 'red');

        // Kill any processes that did start
        for (const childProc of runningProcesses) {
            try {
                childProc.kill('SIGKILL');
            } catch (error) {
                // Ignore
            }
        }

        process.exit(1);
    }
}

main();