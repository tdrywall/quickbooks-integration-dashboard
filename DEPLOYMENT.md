# Server Deployment Instructions

## Step 1: Connect to your server
```bash
ssh root1@192.168.2.169
```

## Step 2: Run the setup script
Copy and paste these commands one by one:

```bash
# Update system
apt update && apt upgrade -y

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

# Show the public key (copy this for GitHub Deploy Keys)
echo "=== PUBLIC KEY FOR GITHUB DEPLOY KEYS ==="
cat ~/.ssh/github-actions.pub

# Show the private key (copy this for GitHub Secrets)
echo "=== PRIVATE KEY FOR GITHUB SECRETS ==="
cat ~/.ssh/github-actions
```

## Step 3: Configure GitHub Repository

### Add Deploy Key:
1. Go to https://github.com/tdrywall/quickbooks-integration-dashboard/settings/keys
2. Click "Add deploy key"
3. Title: "Production Server"
4. Key: Paste the PUBLIC key from above
5. Check "Allow write access"
6. Click "Add key"

### Add Repository Secrets:
1. Go to https://github.com/tdrywall/quickbooks-integration-dashboard/settings/secrets/actions
2. Add these secrets:

- **HOST**: `192.168.2.169`
- **USERNAME**: `root1`
- **SSH_KEY**: Paste the PRIVATE key from above
- **PORT**: `22`

## Step 4: Test Deployment
Once you've added the keys and secrets, push any change to trigger the deployment:

```bash
# On your local machine
echo "# Deployment test" >> README.md
git add README.md
git commit -m "Test deployment"
git push origin main
```

Your GitHub Actions will automatically:
1. Build the React app
2. Deploy to your server
3. Start the app with PM2

The dashboard will be available at: http://192.168.2.169:3000