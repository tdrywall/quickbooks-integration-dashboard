# PowerShell deployment script for Windows
param(
    [Parameter(Mandatory=$true)]
    [string]$ServerIP,
    
    [Parameter(Mandatory=$true)]
    [string]$Username,
    
    [string]$DeployPath = "/var/www/quickbooks-integration-dashboard"
)

Write-Host "🚀 Building and deploying QuickBooks Dashboard..." -ForegroundColor Green

# Build the React app
Write-Host "📦 Building React app..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Use SCP to copy files (requires OpenSSH or pscp)
Write-Host "📤 Uploading to server..." -ForegroundColor Yellow

# Copy build files
scp -r .\build\* "${Username}@${ServerIP}:${DeployPath}/build/"
scp .\server.js "${Username}@${ServerIP}:${DeployPath}/"
scp .\package*.json "${Username}@${ServerIP}:${DeployPath}/"
scp .\ecosystem.config.json "${Username}@${ServerIP}:${DeployPath}/"

# Restart application
Write-Host "🔄 Restarting application..." -ForegroundColor Yellow
ssh "${Username}@${ServerIP}" "cd ${DeployPath} && npm ci --only=production && pm2 restart quickbooks-dashboard"

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "🌐 Access at: http://${ServerIP}:3001" -ForegroundColor Cyan

# Usage example:
# .\deploy.ps1 -ServerIP "192.168.1.100" -Username "ubuntu"