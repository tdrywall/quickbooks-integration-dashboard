# PowerShell script to set up the Ubuntu server
# Run this script after connecting to your server

$serverIP = "192.168.2.169"
$username = "root1"

Write-Host "Setting up QuickBooks Dashboard Server at $serverIP..." -ForegroundColor Green

# Create the setup script content
$setupScript = @"
#!/bin/bash
set -e

echo "Starting server setup..."

# Update system
apt update && apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Verify Node.js installation
echo "Node.js version: `$(node --version)"
echo "NPM version: `$(npm --version)"

# Install PM2 globally
npm install -g pm2

# Create application directory
mkdir -p /var/www/quickbooks-dashboard
cd /var/www/quickbooks-dashboard

# Set proper permissions
chown -R root1:root1 /var/www/quickbooks-dashboard

# Generate SSH key for GitHub Actions
ssh-keygen -t rsa -b 4096 -C "github-actions@quickbooks-dashboard" -f ~/.ssh/github-actions -N ""

echo ""
echo "============================================"
echo "SSH KEYS GENERATED!"
echo "============================================"
echo ""
echo "PUBLIC KEY (Add to GitHub Deploy Keys):"
echo "============================================"
cat ~/.ssh/github-actions.pub
echo ""
echo "============================================"
echo ""
echo "PRIVATE KEY (Add to GitHub Secrets as SSH_KEY):"
echo "============================================"
cat ~/.ssh/github-actions
echo ""
echo "============================================"
echo ""
echo "Server setup complete!"
echo "Application directory: /var/www/quickbooks-dashboard"
echo "PM2 installed and ready"
echo ""
echo "Next: Add the keys above to GitHub and push to deploy!"
"@

# Save the script to a temporary file
$setupScript | Out-File -FilePath "server-setup-script.sh" -Encoding UTF8

Write-Host "Setup script created. Now connecting to server..." -ForegroundColor Yellow
Write-Host "You'll need to enter the password for root1@$serverIP" -ForegroundColor Yellow

# Copy script to server and execute
Write-Host "Copying setup script to server..." -ForegroundColor Cyan
scp server-setup-script.sh root1@${serverIP}:/tmp/

Write-Host "Executing setup script on server..." -ForegroundColor Cyan
ssh root1@$serverIP 'chmod +x /tmp/server-setup-script.sh && /tmp/server-setup-script.sh'

Write-Host "Cleaning up local script file..." -ForegroundColor Cyan
Remove-Item "server-setup-script.sh"

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "SERVER SETUP COMPLETE!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host "The SSH keys have been displayed above." -ForegroundColor Yellow
Write-Host "Copy them to GitHub as instructed." -ForegroundColor Yellow