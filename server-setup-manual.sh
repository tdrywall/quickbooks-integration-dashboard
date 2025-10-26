#!/bin/bash
# QuickBooks Dashboard Server Setup Script
# Copy and paste this entire script into your SSH session

echo "Starting QuickBooks Dashboard server setup..."

# Update system (run as root user)
sudo apt update -y
sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
echo "Node.js version installed:"
node --version
npm --version

# Install PM2 globally
sudo npm install -g pm2

# Create application directory
sudo mkdir -p /var/www/quickbooks-dashboard
sudo chown -R root1:root1 /var/www/quickbooks-dashboard
cd /var/www/quickbooks-dashboard

# Generate SSH key for GitHub Actions (no passphrase)
ssh-keygen -t rsa -b 4096 -C "github-actions@quickbooks-dashboard" -f ~/.ssh/github-actions -N ""

echo ""
echo "============================================"
echo "          SETUP COMPLETE!"
echo "============================================"
echo ""
echo "🔑 PUBLIC KEY (for GitHub Deploy Keys):"
echo "============================================"
cat ~/.ssh/github-actions.pub
echo ""
echo "============================================"
echo ""
echo "🔐 PRIVATE KEY (for GitHub Secrets SSH_KEY):"
echo "============================================"
cat ~/.ssh/github-actions
echo ""
echo "============================================"
echo ""
echo "✅ Server is ready for deployment!"
echo "📁 App directory: /var/www/quickbooks-dashboard"
echo "🚀 PM2 process manager installed"
echo ""
echo "Next steps:"
echo "1. Copy the PUBLIC key above to GitHub Deploy Keys"
echo "2. Copy the PRIVATE key above to GitHub Secrets as SSH_KEY"
echo "3. Add other secrets: HOST=192.168.2.169, USERNAME=root1, PORT=22"
echo "4. Push any change to GitHub to trigger deployment"