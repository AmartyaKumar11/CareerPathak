# PowerShell script to kill all development server processes
Write-Host "Killing all development server processes..." -ForegroundColor Yellow

# Kill all Node.js processes
Write-Host "Killing Node.js processes..." -ForegroundColor Cyan
try {
    taskkill /F /IM node.exe 2>$null
    Write-Host "✓ Node.js processes terminated" -ForegroundColor Green
} catch {
    Write-Host "No Node.js processes found" -ForegroundColor Gray
}

# Kill all npm processes
Write-Host "Killing npm processes..." -ForegroundColor Cyan
try {
    Get-Process -Name *npm* -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "✓ npm processes terminated" -ForegroundColor Green
} catch {
    Write-Host "No npm processes found" -ForegroundColor Gray
}

# Kill processes using specific ports
$ports = @(3001, 5173, 8080, 3000, 8000)
Write-Host "Checking ports: $($ports -join ', ')..." -ForegroundColor Cyan

foreach ($port in $ports) {
    try {
        $connections = netstat -ano | Select-String ":$port\s"
        if ($connections) {
            $connections | ForEach-Object {
                $line = $_.Line
                $pid = ($line -split '\s+')[-1]
                if ($pid -and $pid -match '^\d+$') {
                    Write-Host "Killing process $pid using port $port..." -ForegroundColor Yellow
                    taskkill /F /PID $pid 2>$null
                }
            }
            Write-Host "✓ Processes using port $port terminated" -ForegroundColor Green
        }
    } catch {
        Write-Host "No processes found on port $port" -ForegroundColor Gray
    }
}

Write-Host "All processes cleaned up! You can now start your development server." -ForegroundColor Green
Write-Host "Run: npm run dev" -ForegroundColor Cyan