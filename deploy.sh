#!/bin/bash
# Deployment script for Ubuntu server

echo "🚀 Deploying QuickBooks Integration Dashboard..."

# Update system
sudo apt update

# Install Node.js if not installed
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 for process management
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    sudo npm install -g pm2
fi

# Create project directory
sudo mkdir -p /var/www/quickbooks-dashboard
sudo chown $USER:$USER /var/www/quickbooks-dashboard

# Copy project files (you'll need to upload them first)
echo "📁 Upload your project files to /var/www/quickbooks-dashboard"
echo "Then run: npm install && npm run build"

echo "✅ Setup complete! Next steps:"
echo "1. Upload project files to server"
echo "2. Run: cd /var/www/quickbooks-dashboard"
echo "3. Run: npm install"
echo "4. Run: npm run build"
echo "5. Run: pm2 start server.js --name quickbooks-dashboard"
echo "6. Access at: http://your-server-ip:3001"