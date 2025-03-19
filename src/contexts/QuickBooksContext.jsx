import React, { createContext, useState, useEffect, useCallback } from 'react';

// Create the context
export const QuickBooksContext = createContext();

export const QuickBooksProvider = ({ children }) => {
  // State for authentication
  const [auth, setAuth] = useState({
    clientId: '',
    clientSecret: '',
    redirectUri: '',
    environment: 'sandbox',
    realmId: '',
    accessToken: '',
    refreshToken: '',
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
        setAuth(JSON.parse(savedAuth));
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

  // Simulate token refresh
  const refreshToken = useCallback(() => {
    return new Promise((resolve) => {
      // Simulate token refresh - in a real implementation this would
      // call the Intuit refresh token endpoint
      setTimeout(() => {
        const newAccessToken = 'refreshed_' + Math.random().toString(36).substring(2, 15);
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1);
        
        setAuth(prevAuth => ({
          ...prevAuth,
          accessToken: newAccessToken,
          tokenExpiryDate: expiryDate.toISOString(),
          isAuthenticated: true
        }));
        
        resolve({ 
          success: true, 
          message: 'Token refreshed successfully!' 
        });
      }, 1500);
    });
  }, []);

  // Update authentication state
  const updateAuth = useCallback((newAuthData) => {
    setAuth(prevAuth => ({
      ...prevAuth,
      ...newAuthData,
      isAuthenticated: newAuthData.accessToken ? true : prevAuth.isAuthenticated
    }));
  }, []);

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
        refreshToken,
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
