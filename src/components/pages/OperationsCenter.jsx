import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { QuickBooksContext } from '../../contexts/QuickBooksContext';

const OperationsCenter = () => {
  const { auth, executeOperation } = useContext(QuickBooksContext);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  // State for operations
  const [selectedOperation, setSelectedOperation] = useState(queryParams.get('operation') || 'create');
  const [selectedEntityType, setSelectedEntityType] = useState(queryParams.get('entityType') || 'customer');
  const [entityId, setEntityId] = useState('');
  const [inputData, setInputData] = useState('{\n  \n}');
  const [queryInput, setQueryInput] = useState('SELECT * FROM Customer MAXRESULTS 5');
  const [reportType, setReportType] = useState(queryParams.get('reportType') || 'ProfitAndLoss');
  const [reportOptions, setReportOptions] = useState('{\n  "startDate": "2023-01-01",\n  "endDate": "2023-12-31"\n}');
  
  // Results state
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Update example input data based on entity type changes
  useEffect(() => {
    if (selectedEntityType === 'customer') {
      setInputData(JSON.stringify({
        DisplayName: "Example Customer",
        PrimaryPhone: { FreeFormNumber: "(555) 555-5555" },
        PrimaryEmailAddr: { Address: "customer@example.com" }
      }, null, 2));
    } else if (selectedEntityType === 'invoice') {
      setInputData(JSON.stringify({
        CustomerRef: { value: "123" },
        Line: [
          {
            Amount: 100.0,
            DetailType: "SalesItemLineDetail",
            SalesItemLineDetail: {
              ItemRef: { value: "1", name: "Services" }
            }
          }
        ]
      }, null, 2));
    } else {
      setInputData('{\n  \n}');
    }
  }, [selectedEntityType]);

  // If not authenticated, redirect to auth page
  useEffect(() => {
    if (!auth.isAuthenticated && !auth.accessToken) {
      navigate('/auth', { state: { returnTo: '/operations' } });
    }
  }, [auth.isAuthenticated, auth.accessToken, navigate]);

  // Handle executing an operation
  const handleExecuteOperation = async () => {
    setIsLoading(true);
    setError(null);
    setResults(null);
    setSuccessMessage(null);
    
    try {
      let operationParams = {};
      
      switch(selectedOperation) {
        case 'create':
        case 'update':
          operationParams = {
            operation: selectedOperation,
            entityType: selectedEntityType,
            data: JSON.parse(inputData)
          };
          break;
        
        case 'read':
          if (!entityId) {
            throw new Error('Entity ID is required for read operations');
          }
          operationParams = {
            operation: 'read',
            entityType: selectedEntityType,
            entityId: entityId
          };
          break;
          
        case 'delete':
          operationParams = {
            operation: 'delete',
            entityType: selectedEntityType,
            data: JSON.parse(inputData)
          };
          break;
          
        case 'query':
          operationParams = {
            operation: 'query',
            query: queryInput
          };
          break;
          
        case 'report':
          operationParams = {
            operation: 'report',
            reportType: reportType,
            reportOptions: JSON.parse(reportOptions)
          };
          break;
          
        default:
          throw new Error(`Unsupported operation: ${selectedOperation}`);
      }
      
      const response = await executeOperation(operationParams);
      
      if (response.success) {
        setResults(response.data);
        setSuccessMessage(response.message);
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(`Error executing operation: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Define entity types and report types for dropdowns
  const entityTypes = [
    "account", "bill", "billpayment", "customer", "employee", "estimate", 
    "invoice", "item", "payment", "purchaseorder", "salesreceipt", "vendor"
  ];
  
  const reportTypes = [
    "ProfitAndLoss", "BalanceSheet", "CashFlow", "TrialBalance", 
    "GeneralLedger", "VendorBalance", "CustomerBalance", 
    "AgedReceivables", "AgedPayables", "ItemSales"
  ];

  return (
    <div className="bg-white rounded-lg shadow-md max-w-5xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-6">Execute QuickBooks API Operations</h2>
      
      {!auth.isAuthenticated && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Authentication is required to execute operations. Please 
                <button 
                  className="font-medium underline text-yellow-700 hover:text-yellow-600 ml-1"
                  onClick={() => navigate('/auth', { state: { returnTo: '/operations' } })}
                >
                  complete authentication
                </button> first.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Operation</label>
          <select
            value={selectedOperation}
            onChange={(e) => {
              setSelectedOperation(e.target.value);
              setResults(null);
            }}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="create">Create</option>
            <option value="read">Read</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="query">Query</option>
            <option value="report">Report</option>
          </select>
        </div>
        
        {selectedOperation !== 'query' && selectedOperation !== 'report' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
            <select
              value={selectedEntityType}
              onChange={(e) => setSelectedEntityType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {entityTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {selectedOperation === 'read' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Entity ID</label>
            <input
              type="text"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter the ID of the entity to retrieve"
            />
          </div>
        )}
        
        {(selectedOperation === 'create' || selectedOperation === 'update' || selectedOperation === 'delete') && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Input Data (JSON)</label>
              {selectedOperation === 'update' && (
                <div className="text-xs text-gray-500">Include Id and SyncToken for updates</div>
              )}
            </div>
            <textarea
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              rows="10"
              className="w-full p-2 border border-gray-300 rounded-md font-mono text-sm"
            />
          </div>
        )}
        
        {selectedOperation === 'query' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Query</label>
            <textarea
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              rows="3"
              className="w-full p-2 border border-gray-300 rounded-md font-mono text-sm"
              placeholder="SELECT * FROM Customer MAXRESULTS 5"
            />
            <div className="mt-1 text-xs text-gray-500">Example: SELECT * FROM Invoice WHERE TotalAmt > 100</div>
          </div>
        )}
        
        {selectedOperation === 'report' && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {reportTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/([A-Z])/g, ' $1').trim()}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Options (JSON)</label>
              <textarea
                value={reportOptions}
                onChange={(e) => setReportOptions(e.target.value)}
                rows="6"
                className="w-full p-2 border border-gray-300 rounded-md font-mono text-sm"
              />
              <div className="mt-1 text-xs text-gray-500">Common options: startDate, endDate, accountingMethod, columns</div>
            </div>
          </>
        )}
        
        <button 
          onClick={handleExecuteOperation}
          disabled={isLoading || !auth.isAuthenticated}
          className={`mt-4 py-2 px-4 rounded ${auth.isAuthenticated ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
        >
          {isLoading ? 'Executing...' : 'Execute Operation'}
        </button>
      </div>
      
      {isLoading && (
        <div className="flex justify-center items-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-2">Processing...</p>
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 bg-green-50 text-green-800 p-4 rounded">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="mb-4 bg-red-50 text-red-800 p-4 rounded">
          {error}
        </div>
      )}
      
      {results && (
        <div className="mt-6">
          <div className="bg-gray-100 p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-bold">Results</h3>
            <button 
              onClick={() => navigator.clipboard.writeText(JSON.stringify(results, null, 2))}
              className="text-xs bg-gray-200 hover:bg-gray-300 py-1 px-2 rounded"
            >
              Copy JSON
            </button>
          </div>
          <div className="bg-gray-50 rounded-b-lg">
            <pre className="p-4 overflow-auto max-h-96 text-sm">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperationsCenter;
