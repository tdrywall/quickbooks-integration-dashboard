import React, { createContext, useState, useEffect, useCallback } from 'react';

// Create the context
export const QuickBooksContext = createContext();

export const QuickBooksProvider = ({ children }) => {
  // State for authentication
  const [auth, setAuth] = useState({
    clientId: localStorage.getItem('qbo_client_id') || 'ABU6ALF7ZeebZ0JhhkPyp5H98xls1qLQIlp2GqtFE6F1dIx8zc',
    clientSecret: localStorage.getItem('qbo_client_secret') || 'kJagTCOHDXCr6illNndWqqkNtxV6AEHroy2vOpw0',
    redirectUri: 'https://eoge0jr9es1s20s.m.pipedream.net',
    environment: 'sandbox',
    realmId: '9341455227664304',
    accessToken: '',
    refreshToken: '',
    authorizationCode: 'XAB11761583269rF4HJBBxewojOORmR1sltWhKdyNhREtOLGl5', // NEW CODE FROM YOUR LATEST AUTH
    tokenExpiryDate: '',
    isAuthenticated: false
  });

  // State for operations history
  const [operationsHistory, setOperationsHistory] = useState([]);
  
  // State for API usage metrics
  const [apiUsage, setApiUsage] = useState({
    totalCalls: 0,
    createOperations: 0,
    readOperations: 0,
    updateOperations: 0,
    deleteOperations: 0,
    queryOperations: 0,
    reportOperations: 0,
    errors: 0,
    lastCallTime: null
  });

  // Load saved auth on context mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('qbo_auth');
    if (savedAuth) {
      try {
        const parsedAuth = JSON.parse(savedAuth);
        setAuth(parsedAuth);
        
        // Auto-exchange token if we have credentials and auth code but no access token
        if (parsedAuth.clientId && parsedAuth.clientSecret && parsedAuth.authorizationCode && !parsedAuth.accessToken) {
          console.log('🔄 Auto-exchanging authorization code for tokens...');
          // We'll trigger this after the component mounts
          setTimeout(() => {
            const exchangeFunc = async () => {
              const result = await exchangeAuthCodeForTokens(parsedAuth.authorizationCode);
              if (result.success) {
                console.log('✅ Auto-exchange successful!');
              } else {
                console.log('❌ Auto-exchange failed:', result.message);
              }
            };
            exchangeFunc();
          }, 1000);
        }
      } catch (err) {
        console.error('Error loading saved auth:', err);
      }
    }
    
    // Load operations history
    const savedHistory = localStorage.getItem('qbo_operations_history');
    if (savedHistory) {
      try {
        setOperationsHistory(JSON.parse(savedHistory));
      } catch (err) {
        console.error('Error loading operations history:', err);
      }
    }
    
    // Load API usage metrics
    const savedMetrics = localStorage.getItem('qbo_api_usage');
    if (savedMetrics) {
      try {
        setApiUsage(JSON.parse(savedMetrics));
      } catch (err) {
        console.error('Error loading API usage metrics:', err);
      }
    }
  }, []);

  // Save auth to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('qbo_auth', JSON.stringify(auth));
    // Also save credentials separately for easy access
    if (auth.clientId) localStorage.setItem('qbo_client_id', auth.clientId);
    if (auth.clientSecret) localStorage.setItem('qbo_client_secret', auth.clientSecret);
  }, [auth]);
  
  // Save operations history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('qbo_operations_history', JSON.stringify(operationsHistory));
  }, [operationsHistory]);
  
  // Save API usage metrics to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('qbo_api_usage', JSON.stringify(apiUsage));
  }, [apiUsage]);

  // Handle saving authentication information
  const saveAuthInfo = useCallback(() => {
    // In a real implementation, this would be saved securely
    // and used for the OAuth flow
    
    setAuth(prevAuth => ({
      ...prevAuth,
      isAuthenticated: prevAuth.accessToken !== ''
    }));
    
    return { success: true, message: 'Authentication information saved!' };
  }, []);

  // Generate authorization URL
  const generateAuthUrl = useCallback(() => {
    if (!auth.clientId || !auth.redirectUri) {
      return { success: false, message: 'Client ID and Redirect URI are required' };
    }
    
    const scopes = 'com.intuit.quickbooks.accounting';
    const state = Math.random().toString(36).substring(2, 15);
    const authUrl = `https://appcenter.intuit.com/connect/oauth2?client_id=${auth.clientId}&redirect_uri=${encodeURIComponent(auth.redirectUri)}&scope=${encodeURIComponent(scopes)}&response_type=code&state=${state}`;
    
    // Open the URL in a new tab
    window.open(authUrl, '_blank');
    
    return { 
      success: true, 
      message: 'Authorization URL opened in a new tab. After authorization, enter the tokens you receive.' 
    };
  }, [auth.clientId, auth.redirectUri]);

  // Exchange authorization code for access tokens
  const exchangeAuthCodeForTokens = useCallback(async (authorizationCode) => {
    if (!auth.clientId || !auth.clientSecret || !authorizationCode || !auth.redirectUri) {
      return { 
        success: false, 
        message: 'Client ID, Client Secret, Authorization Code, and Redirect URI are required' 
      };
    }

    try {
      const tokenEndpoint = auth.environment === 'sandbox' 
        ? 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer'
        : 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';

      const requestBody = new URLSearchParams({
        grant_type: 'authorization_code',
        code: authorizationCode,
        redirect_uri: auth.redirectUri
      });

      const credentials = btoa(`${auth.clientId}:${auth.clientSecret}`);

      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`
        },
        body: requestBody
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Token exchange failed:', errorData);
        return { 
          success: false, 
          message: `Token exchange failed: ${response.status} ${response.statusText}` 
        };
      }

      const tokenData = await response.json();
      
      // Calculate token expiry date
      const expiryDate = new Date();
      expiryDate.setSeconds(expiryDate.getSeconds() + tokenData.expires_in);

      // Update auth state with tokens
      const updatedAuth = {
        ...auth,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpiryDate: expiryDate.toISOString(),
        isAuthenticated: true
      };

      setAuth(updatedAuth);
      
      // Save to localStorage
      localStorage.setItem('qbo_auth', JSON.stringify(updatedAuth));

      return { 
        success: true, 
        message: 'Successfully exchanged authorization code for access tokens!' 
      };

    } catch (error) {
      console.error('Error exchanging auth code:', error);
      return { 
        success: false, 
        message: `Error exchanging authorization code: ${error.message}` 
      };
    }
  }, [auth]);

  // Real token refresh using QuickBooks API
  const refreshToken = useCallback(async () => {
    if (!auth.refreshToken || !auth.clientId || !auth.clientSecret) {
      return { 
        success: false, 
        message: 'Refresh token, Client ID, and Client Secret are required' 
      };
    }

    try {
      const tokenEndpoint = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';

      const requestBody = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: auth.refreshToken
      });

      const credentials = btoa(`${auth.clientId}:${auth.clientSecret}`);

      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`
        },
        body: requestBody
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Token refresh failed:', errorData);
        return { 
          success: false, 
          message: `Token refresh failed: ${response.status} ${response.statusText}` 
        };
      }

      const tokenData = await response.json();
      
      // Calculate token expiry date
      const expiryDate = new Date();
      expiryDate.setSeconds(expiryDate.getSeconds() + tokenData.expires_in);

      // Update auth state with new tokens
      const updatedAuth = {
        ...auth,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || auth.refreshToken, // Some refreshes don't return new refresh token
        tokenExpiryDate: expiryDate.toISOString(),
        isAuthenticated: true
      };

      setAuth(updatedAuth);
      
      // Save to localStorage
      localStorage.setItem('qbo_auth', JSON.stringify(updatedAuth));

      return { 
        success: true, 
        message: 'Token refreshed successfully!' 
      };

    } catch (error) {
      console.error('Error refreshing token:', error);
      return { 
        success: false, 
        message: `Error refreshing token: ${error.message}` 
      };
    }
  }, [auth]);

  // Update authentication state
  const updateAuth = useCallback((newAuthData) => {
    setAuth(prevAuth => ({
      ...prevAuth,
      ...newAuthData,
      isAuthenticated: newAuthData.accessToken ? true : prevAuth.isAuthenticated
    }));
  }, []);

  // Test QuickBooks API connection by fetching company info
  const testQuickBooksAPI = useCallback(async () => {
    if (!auth.accessToken || !auth.realmId) {
      return { 
        success: false, 
        message: 'Access token and company ID are required' 
      };
    }

    try {
      const baseUrl = auth.environment === 'sandbox' 
        ? 'https://sandbox-quickbooks.api.intuit.com'
        : 'https://quickbooks.api.intuit.com';
      
      const apiUrl = `${baseUrl}/v3/company/${auth.realmId}/companyinfo/${auth.realmId}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${auth.accessToken}`
        }
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API test failed:', errorData);
        return { 
          success: false, 
          message: `API test failed: ${response.status} ${response.statusText}`,
          data: errorData
        };
      }

      const responseData = await response.json();
      
      return { 
        success: true, 
        message: 'Successfully connected to QuickBooks API!',
        data: responseData
      };

    } catch (error) {
      console.error('Error testing QuickBooks API:', error);
      return { 
        success: false, 
        message: `Error testing API: ${error.message}` 
      };
    }
  }, [auth.accessToken, auth.realmId, auth.environment]);

  // Fetch QuickBooks estimates
  const fetchEstimates = useCallback(async () => {
    if (!auth.accessToken || !auth.realmId) {
      return { 
        success: false, 
        message: 'Access token and Realm ID are required' 
      };
    }

    try {
      const baseUrl = auth.environment === 'production' 
        ? 'https://quickbooks.api.intuit.com'
        : 'https://sandbox-quickbooks.api.intuit.com';

      const response = await fetch(
        `${baseUrl}/v3/company/${auth.realmId}/query?query=SELECT * FROM Estimate`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${auth.accessToken}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      
      return {
        success: true,
        message: 'Estimates fetched successfully!',
        data: responseData.QueryResponse?.Estimate || []
      };

    } catch (error) {
      console.error('Error fetching estimates:', error);
      return { 
        success: false, 
        message: `Error fetching estimates: ${error.message}` 
      };
    }
  }, [auth.accessToken, auth.realmId, auth.environment]);

  // Fetch a specific estimate by ID
  const fetchEstimateById = useCallback(async (estimateId) => {
    if (!auth.accessToken || !auth.realmId) {
      return { 
        success: false, 
        message: 'Access token and Realm ID are required' 
      };
    }

    try {
      const baseUrl = auth.environment === 'production' 
        ? 'https://quickbooks.api.intuit.com'
        : 'https://sandbox-quickbooks.api.intuit.com';

      const response = await fetch(
        `${baseUrl}/v3/company/${auth.realmId}/estimate/${estimateId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${auth.accessToken}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      
      return {
        success: true,
        message: 'Estimate fetched successfully!',
        data: responseData.QueryResponse?.Estimate?.[0] || null
      };

    } catch (error) {
      console.error('Error fetching estimate:', error);
      return { 
        success: false, 
        message: `Error fetching estimate: ${error.message}` 
      };
    }
  }, [auth.accessToken, auth.realmId, auth.environment]);

  // Create invoice from estimate (for progress invoicing)
  const createInvoiceFromEstimate = useCallback(async (estimateData, progressOptions = {}) => {
    if (!auth.accessToken || !auth.realmId) {
      return { 
        success: false, 
        message: 'Access token and Realm ID are required' 
      };
    }

    try {
      const { percentage = 100, description = 'Progress Invoice' } = progressOptions;
      
      // Build invoice data based on estimate
      const invoiceData = {
        Line: estimateData.Line.map(line => ({
          ...line,
          Amount: (line.Amount * percentage / 100).toFixed(2),
          SalesItemLineDetail: {
            ...line.SalesItemLineDetail,
            Qty: line.SalesItemLineDetail?.Qty ? (line.SalesItemLineDetail.Qty * percentage / 100) : 1,
            UnitPrice: line.SalesItemLineDetail?.UnitPrice || line.Amount
          }
        })),
        CustomerRef: estimateData.CustomerRef,
        TxnDate: new Date().toISOString().split('T')[0],
        PrivateNote: `${description} - ${percentage}% of Estimate ${estimateData.DocNumber}`
      };

      const baseUrl = auth.environment === 'production' 
        ? 'https://quickbooks.api.intuit.com'
        : 'https://sandbox-quickbooks.api.intuit.com';

      const response = await fetch(
        `${baseUrl}/v3/company/${auth.realmId}/invoice`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${auth.accessToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(invoiceData)
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      
      return {
        success: true,
        message: 'Progress invoice created successfully!',
        data: responseData.QueryResponse?.Invoice?.[0] || responseData
      };

    } catch (error) {
      console.error('Error creating progress invoice:', error);
      return { 
        success: false, 
        message: `Error creating progress invoice: ${error.message}` 
      };
    }
  }, [auth.accessToken, auth.realmId, auth.environment]);

  // Generate mock response based on operation
  const generateMockResponse = useCallback((params) => {
    const { operation, entityType, entityId, data } = params;
    
    switch(operation) {
      case 'create':
        return {
          [entityType]: {
            ...data,
            Id: Math.floor(Math.random() * 10000).toString(),
            SyncToken: "0",
            MetaData: {
              CreateTime: new Date().toISOString(),
              LastUpdatedTime: new Date().toISOString()
            }
          },
          time: new Date().toISOString()
        };
        
      case 'read':
        let mockData = {};
        if (entityType === 'customer') {
          mockData = {
            DisplayName: "Sample Customer",
            PrimaryPhone: { FreeFormNumber: "(555) 555-5555" },
            PrimaryEmailAddr: { Address: "customer@example.com" }
          };
        } else if (entityType === 'invoice') {
          mockData = {
            DocNumber: "INV-1001",
            TotalAmt: 100.00,
            CustomerRef: { value: "123", name: "Sample Customer" }
          };
        }
        
        return {
          [entityType]: {
            Id: entityId,
            SyncToken: "0",
            ...mockData,
            MetaData: {
              CreateTime: new Date().toISOString(),
              LastUpdatedTime: new Date().toISOString()
            }
          },
          time: new Date().toISOString()
        };
        
      case 'update':
        return {
          [entityType]: {
            ...data,
            SyncToken: (parseInt(data.SyncToken || "0") + 1).toString(),
            MetaData: {
              CreateTime: new Date(Date.now() - 86400000).toISOString(),
              LastUpdatedTime: new Date().toISOString()
            }
          },
          time: new Date().toISOString()
        };
        
      case 'delete':
        return {
          [entityType]: {
            Id: data.Id,
            status: "Deleted"
          },
          time: new Date().toISOString()
        };
        
      case 'query':
        // Extract entity type from query
        const queryEntityMatch = params.query.match(/from\\s+(\\w+)/i);
        const queryEntityType = queryEntityMatch ? queryEntityMatch[1] : 'Entity';
        
        return {
          QueryResponse: {
            [queryEntityType]: [
              { Id: "101", DisplayName: "Sample Result 1" },
              { Id: "102", DisplayName: "Sample Result 2" }
            ],
            startPosition: 1,
            maxResults: 2,
            totalCount: 2
          },
          time: new Date().toISOString()
        };
        
      case 'report':
        return {
          Header: {
            ReportName: params.reportType,
            Time: new Date().toISOString(),
            ReportBasis: "Accrual",
            StartPeriod: params.reportOptions.startDate || "2023-01-01",
            EndPeriod: params.reportOptions.endDate || "2023-12-31",
            Currency: "USD"
          },
          Columns: {
            Column: [
              { ColTitle: "Name", ColType: "String" },
              { ColTitle: "Amount", ColType: "Amount" }
            ]
          },
          Rows: {
            Row: [
              {
                ColData: [
                  { value: "Revenue" },
                  { value: "15000.00" }
                ]
              },
              {
                ColData: [
                  { value: "Expenses" },
                  { value: "7500.00" }
                ]
              }
            ]
          },
          Summary: {
            TotalAmount: "7500.00"
          }
        };
        
      default:
        return { message: "Operation not supported" };
    }
  }, []);

  // Execute a QuickBooks operation
  const executeOperation = useCallback((operationParams) => {
    return new Promise((resolve, reject) => {
      if (!auth.isAuthenticated && auth.accessToken === '') {
        reject({ success: false, message: 'Authentication required. Please complete the authentication process first.' });
        return;
      }
      
      // Simulate API call delay
      setTimeout(() => {
        try {
          // Generate mock response
          const response = generateMockResponse(operationParams);
          
          // Update API usage metrics
          setApiUsage(prevUsage => {
            const newUsage = {
              ...prevUsage,
              totalCalls: prevUsage.totalCalls + 1,
              lastCallTime: new Date().toISOString()
            };
            
            // Increment specific operation counter
            switch(operationParams.operation) {
              case 'create':
                newUsage.createOperations++;
                break;
              case 'read':
                newUsage.readOperations++;
                break;
              case 'update':
                newUsage.updateOperations++;
                break;
              case 'delete':
                newUsage.deleteOperations++;
                break;
              case 'query':
                newUsage.queryOperations++;
                break;
              case 'report':
                newUsage.reportOperations++;
                break;
              default:
                break;
            }
            
            return newUsage;
          });
          
          // Add to operations history
          const historyEntry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            operation: operationParams.operation,
            entityType: operationParams.entityType || 'N/A',
            successful: true,
            details: operationParams
          };
          
          setOperationsHistory(prevHistory => [
            historyEntry,
            ...prevHistory.slice(0, 99) // Keep last 100 operations
          ]);
          
          resolve({ 
            success: true, 
            message: 'Operation executed successfully!',
            data: response 
          });
        } catch (error) {
          // Update error counter
          setApiUsage(prevUsage => ({
            ...prevUsage,
            errors: prevUsage.errors + 1
          }));
          
          // Add failed operation to history
          const historyEntry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            operation: operationParams.operation,
            entityType: operationParams.entityType || 'N/A',
            successful: false,
            error: error.message,
            details: operationParams
          };
          
          setOperationsHistory(prevHistory => [
            historyEntry,
            ...prevHistory.slice(0, 99) // Keep last 100 operations
          ]);
          
          reject({ 
            success: false, 
            message: `Error executing operation: ${error.message}` 
          });
        }
      }, 1500);
    });
  }, [auth.isAuthenticated, auth.accessToken, generateMockResponse]);

  // Clear operations history
  const clearOperationsHistory = useCallback(() => {
    setOperationsHistory([]);
  }, []);
  
  // Reset API usage metrics
  const resetApiUsage = useCallback(() => {
    setApiUsage({
      totalCalls: 0,
      createOperations: 0,
      readOperations: 0,
      updateOperations: 0,
      deleteOperations: 0,
      queryOperations: 0,
      reportOperations: 0,
      errors: 0,
      lastCallTime: null
    });
  }, []);

  return (
    <QuickBooksContext.Provider
      value={{
        auth,
        updateAuth,
        saveAuthInfo,
        generateAuthUrl,
        exchangeAuthCodeForTokens,
        refreshToken,
        testQuickBooksAPI,
        fetchEstimates,
        fetchEstimateById,
        createInvoiceFromEstimate,
        executeOperation,
        operationsHistory,
        clearOperationsHistory,
        apiUsage,
        resetApiUsage
      }}
    >
      {children}
    </QuickBooksContext.Provider>
  );
};
