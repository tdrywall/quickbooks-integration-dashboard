#!/bin/bash
# Simple deployment script

echo "🚀 Building and deploying QuickBooks Dashboard..."

# Configuration
SERVER_IP="YOUR_SERVER_IP"
SERVER_USER="YOUR_USERNAME"
DEPLOY_PATH="/var/www/quickbooks-integration-dashboard"

# Build locally
echo "📦 Building React app..."
npm run build

# Copy to server
echo "📤 Uploading to server..."
rsync -avz --delete ./build/ $SERVER_USER@$SERVER_IP:$DEPLOY_PATH/build/
rsync -avz ./server.js $SERVER_USER@$SERVER_IP:$DEPLOY_PATH/
rsync -avz ./package*.json $SERVER_USER@$SERVER_IP:$DEPLOY_PATH/
rsync -avz ./ecosystem.config.json $SERVER_USER@$SERVER_IP:$DEPLOY_PATH/

# Install dependencies and restart on server
echo "🔄 Restarting application..."
ssh $SERVER_USER@$SERVER_IP "cd $DEPLOY_PATH && npm ci --only=production && pm2 restart quickbooks-dashboard"

echo "✅ Deployment complete!"
echo "🌐 Access at: http://$SERVER_IP:3001"