#!/bin/bash

echo "Setting up QuickBooks Dashboard Server..."

# Update system
apt update
apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2 globally
npm install -g pm2

# Create application directory
mkdir -p /var/www/quickbooks-dashboard
cd /var/www/quickbooks-dashboard

# Set proper permissions
chown -R root1:root1 /var/www/quickbooks-dashboard

# Generate SSH key for GitHub Actions
ssh-keygen -t rsa -b 4096 -C "github-actions@quickbooks-dashboard" -f ~/.ssh/github-actions -N ""

echo "============================================"
echo "IMPORTANT: Copy this SSH PUBLIC key to GitHub Deploy Keys:"
echo "============================================"
cat ~/.ssh/github-actions.pub
echo "============================================"
echo ""
echo "IMPORTANT: Copy this SSH PRIVATE key for GitHub Secrets:"
echo "============================================"
cat ~/.ssh/github-actions
echo "============================================"
echo ""
echo "Server setup complete!"
echo "Next steps:"
echo "1. Add the PUBLIC key above to GitHub Deploy Keys"
echo "2. Add the PRIVATE key above to GitHub Secrets as SSH_KEY"
echo "3. Your GitHub Actions will handle the rest!"