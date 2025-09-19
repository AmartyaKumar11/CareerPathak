@echo off
echo Killing all development server processes...

REM Kill all Node.js processes
echo Killing Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel%==0 (
    echo ✓ Node.js processes terminated
) else (
    echo No Node.js processes found
)

REM Kill all npm processes  
echo Killing npm processes...
for /f "tokens=2" %%i in ('tasklist /fi "imagename eq npm.exe" ^| find "npm.exe"') do (
    taskkill /F /PID %%i >nul 2>&1
)

REM Check and kill processes on common development ports
echo Checking development ports...
for %%p in (3001 5173 8080 3000 8000) do (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%%p "') do (
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo.
echo ✓ All processes cleaned up! You can now start your development server.
echo Run: npm run dev
pause