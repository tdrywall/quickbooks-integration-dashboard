#!/bin/bash
# QUICKBOOKS DASHBOARD SERVER SETUP
# Copy this entire block and paste into your SSH session

echo "🚀 Setting up QuickBooks Dashboard Server..."

# Update system
sudo apt update -y && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Create application directory
sudo mkdir -p /var/www/quickbooks-dashboard
sudo chown -R $USER:$USER /var/www/quickbooks-dashboard

# Generate SSH key for GitHub Actions
ssh-keygen -t rsa -b 4096 -C "github-actions" -f ~/.ssh/github-actions -N ""

echo ""
echo "============================================"
echo "🔑 COPY THIS PUBLIC KEY TO GITHUB DEPLOY KEYS:"
echo "============================================"
cat ~/.ssh/github-actions.pub
echo ""
echo "============================================"
echo "🔐 COPY THIS PRIVATE KEY TO GITHUB SECRETS AS 'SSH_KEY':"
echo "============================================"
cat ~/.ssh/github-actions
echo ""
echo "============================================"
echo ""
echo "✅ Server setup complete!"
echo ""
echo "📋 GITHUB SECRETS TO ADD:"
echo "HOST: 192.168.2.169"
echo "USERNAME: root1"
echo "SSH_KEY: [paste private key above]"
echo "PORT: 22"
echo ""
echo "🌐 After GitHub setup, your app will be at: http://192.168.2.169:3000"