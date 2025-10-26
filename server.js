const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'build')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server running', timestamp: new Date().toISOString() });
});

// Token exchange endpoint
app.post('/api/exchange-token', async (req, res) => {
  try {
    const { code, redirectUri, clientId, clientSecret } = req.body;
    
    console.log('Token exchange request:', { code, redirectUri, clientId });
    
    const tokenData = {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri
    };

    const response = await axios.post(
      'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
      new URLSearchParams(tokenData),
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log('Token exchange successful');
    res.json(response.data);
  } catch (error) {
    console.error('Token exchange error:', error.response?.data || error.message);
    res.status(400).json({ 
      error: error.response?.data || { error: 'Token exchange failed', details: error.message }
    });
  }
});

// Token refresh endpoint
app.post('/api/refresh-token', async (req, res) => {
  try {
    const { refreshToken, clientId, clientSecret } = req.body;
    
    console.log('Token refresh request');
    
    const tokenData = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    };

    const response = await axios.post(
      'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
      new URLSearchParams(tokenData),
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log('Token refresh successful');
    res.json(response.data);
  } catch (error) {
    console.error('Token refresh error:', error.response?.data || error.message);
    res.status(400).json({ 
      error: error.response?.data || { error: 'Token refresh failed', details: error.message }
    });
  }
});

// QuickBooks API proxy for GET requests
app.post('/api/quickbooks/get', async (req, res) => {
  try {
    const { accessToken, realmId, endpoint, environment = 'sandbox' } = req.body;
    
    console.log('QuickBooks GET request:', { endpoint, realmId, environment });
    
    const baseUrl = environment === 'production' 
      ? 'https://quickbooks.api.intuit.com'
      : 'https://sandbox-quickbooks.api.intuit.com';

    const response = await axios.get(
      `${baseUrl}/v3/company/${realmId}/${endpoint}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      }
    );

    console.log('QuickBooks API response received');
    res.json(response.data);
  } catch (error) {
    console.error('QuickBooks API error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      error: error.response?.data || { error: 'QuickBooks API request failed', details: error.message }
    });
  }
});

// QuickBooks API proxy for POST requests
app.post('/api/quickbooks/post', async (req, res) => {
  try {
    const { accessToken, realmId, endpoint, data, environment = 'sandbox' } = req.body;
    
    console.log('QuickBooks POST request:', { endpoint, realmId, environment });
    
    const baseUrl = environment === 'production' 
      ? 'https://quickbooks.api.intuit.com'
      : 'https://sandbox-quickbooks.api.intuit.com';

    const response = await axios.post(
      `${baseUrl}/v3/company/${realmId}/${endpoint}`,
      data,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('QuickBooks API POST response received');
    res.json(response.data);
  } catch (error) {
    console.error('QuickBooks API POST error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      error: error.response?.data || { error: 'QuickBooks API POST request failed', details: error.message }
    });
  }
});

// Fetch estimates endpoint
app.post('/api/estimates', async (req, res) => {
  try {
    const { accessToken, realmId, environment = 'sandbox' } = req.body;
    
    console.log('Fetching estimates for realm:', realmId);
    
    const baseUrl = environment === 'production' 
      ? 'https://quickbooks.api.intuit.com'
      : 'https://sandbox-quickbooks.api.intuit.com';

    const response = await axios.get(
      `${baseUrl}/v3/company/${realmId}/query?query=SELECT * FROM Estimate`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      }
    );

    const estimates = response.data.QueryResponse?.Estimate || [];
    console.log(`Found ${estimates.length} estimates`);
    
    res.json({
      success: true,
      data: estimates,
      count: estimates.length
    });
  } catch (error) {
    console.error('Estimates fetch error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      success: false,
      error: error.response?.data || { error: 'Failed to fetch estimates', details: error.message }
    });
  }
});

// Test company info endpoint
app.post('/api/company-info', async (req, res) => {
  try {
    const { accessToken, realmId, environment = 'sandbox' } = req.body;
    
    console.log('Fetching company info for realm:', realmId);
    
    const baseUrl = environment === 'production' 
      ? 'https://quickbooks.api.intuit.com'
      : 'https://sandbox-quickbooks.api.intuit.com';

    const response = await axios.get(
      `${baseUrl}/v3/company/${realmId}/companyinfo/${realmId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      }
    );

    console.log('Company info retrieved successfully');
    res.json(response.data);
  } catch (error) {
    console.error('Company info error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      error: error.response?.data || { error: 'Failed to fetch company info', details: error.message }
    });
  }
});

// Create invoice endpoint
app.post('/api/create-invoice', async (req, res) => {
  try {
    const { accessToken, realmId, invoiceData, environment = 'sandbox' } = req.body;
    
    console.log('Creating invoice for realm:', realmId);
    
    const baseUrl = environment === 'production' 
      ? 'https://quickbooks.api.intuit.com'
      : 'https://sandbox-quickbooks.api.intuit.com';

    const response = await axios.post(
      `${baseUrl}/v3/company/${realmId}/invoice`,
      invoiceData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Invoice created successfully');
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Invoice creation error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      success: false,
      error: error.response?.data || { error: 'Failed to create invoice', details: error.message }
    });
  }
});

// Serve React app for all other routes
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 QuickBooks API Server running on http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET  /api/health - Health check`);
  console.log(`   POST /api/exchange-token - Exchange authorization code`);
  console.log(`   POST /api/refresh-token - Refresh access token`);
  console.log(`   POST /api/estimates - Fetch estimates`);
  console.log(`   POST /api/company-info - Test API connection`);
  console.log(`   POST /api/create-invoice - Create invoice`);
  console.log(`   POST /api/quickbooks/get - Generic GET proxy`);
  console.log(`   POST /api/quickbooks/post - Generic POST proxy`);
});