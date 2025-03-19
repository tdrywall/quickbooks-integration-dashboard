import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ApiHelp = () => {
  const [activeSection, setActiveSection] = useState('authentication');

  // Sample data for examples
  const codeExamples = {
    customer: `{
  "DisplayName": "Example Company",
  "PrimaryPhone": {
    "FreeFormNumber": "(555) 555-5555"
  },
  "PrimaryEmailAddr": {
    "Address": "contact@example.com"
  }
}`,
    invoice: `{
  "CustomerRef": {
    "value": "123"
  },
  "Line": [
    {
      "Amount": 100.0,
      "DetailType": "SalesItemLineDetail",
      "SalesItemLineDetail": {
        "ItemRef": {
          "value": "1",
          "name": "Services"
        }
      }
    }
  ]
}`,
    queries: `SELECT * FROM Customer WHERE DisplayName LIKE '%Example%'

SELECT * FROM Invoice WHERE TotalAmt > 100

SELECT * FROM Bill WHERE TxnDate >= '2023-01-01'`,
    reportOptions: `{
  "startDate": "2023-01-01",
  "endDate": "2023-12-31",
  "accrual": true,
  "accountingMethod": "Accrual",
  "columns": ["account", "amount"],
  "summarizeColumnsBy": "Total"
}`
  };

  return (
    <div className="bg-white rounded-lg shadow-md max-w-5xl mx-auto">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          <button
            className={`px-4 py-3 font-medium text-sm ${activeSection === 'authentication' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveSection('authentication')}
          >
            Authentication Setup
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm ${activeSection === 'operations' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveSection('operations')}
          >
            Operations Guide
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm ${activeSection === 'queries' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveSection('queries')}
          >
            Query Examples
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm ${activeSection === 'reports' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveSection('reports')}
          >
            Report Options
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm ${activeSection === 'resources' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveSection('resources')}
          >
            Resources
          </button>
        </nav>
      </div>
      
      <div className="p-6">
        {/* Authentication Setup Section */}
        {activeSection === 'authentication' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Authentication Setup</h2>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <ol className="list-decimal pl-6 space-y-3">
                <li>Register an app on the <a href="https://developer.intuit.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Intuit Developer Portal</a></li>
                <li>Obtain your Client ID and Client Secret from the app's keys tab</li>
                <li>Configure a valid Redirect URI (must match what you set in the Intuit Developer Portal)</li>
                <li>Enter these details in the Authentication tab</li>
                <li>Click "Start OAuth Flow" to get authorization code</li>
                <li>After authorization, you'll be redirected to your Redirect URI with a code parameter</li>
                <li>Use this code to obtain your access and refresh tokens</li>
                <li>Enter the tokens in the Authentication tab</li>
                <li>Save your authentication information</li>
              </ol>
            </div>
            
            <div className="mb-4">
              <h3 className="font-bold mb-2">OAuth 2.0 Flow</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <img src="/api/placeholder/800/200" alt="OAuth 2.0 Flow Diagram" className="w-full h-auto" />
              </div>
            </div>
            
            <Link 
              to="/auth" 
              className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
              Go to Authentication Setup
            </Link>
          </div>
        )}
        
        {/* Operations Guide Section */}
        {activeSection === 'operations' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Operations Guide</h2>
            
            <div className="mb-6">
              <h3 className="font-bold mb-2">Create Operations</h3>
              <p className="mb-2">Use create operations to add new entities to your QuickBooks company.</p>
              
              <div className="mt-4">
                <h4 className="font-medium mb-1">Create Customer Example:</h4>
                <pre className="bg-gray-50 p-3 rounded overflow-auto text-sm">
                  {codeExamples.customer}
                </pre>
              </div>
              
              <div className="mt-4">
                <h4 className="font-medium mb-1">Create Invoice Example:</h4>
                <pre className="bg-gray-50 p-3 rounded overflow-auto text-sm">
                  {codeExamples.invoice}
                </pre>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-bold mb-2">Read Operations</h3>
              <p className="mb-2">Use read operations to retrieve entity details by ID.</p>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <p>Simply provide the entity type and a valid entity ID.</p>
                <p className="mt-2">Example: Reading customer with ID 123</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-bold mb-2">Update Operations</h3>
              <p className="mb-2">Use update operations to modify existing entities. You must include both the entity ID and SyncToken.</p>
              <div className="mt-2 bg-gray-50 p-3 rounded text-sm">
                <p>Important: Always include the entity ID and the latest SyncToken when updating entities.</p>
                <pre className="mt-2">
{`{
  "Id": "123",
  "SyncToken": "0",
  "DisplayName": "Updated Company Name"
}`}
                </pre>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-bold mb-2">Delete Operations</h3>
              <p className="mb-2">Use delete operations to remove entities. Most entities in QuickBooks are not actually deleted but rather marked as inactive.</p>
              <div className="mt-2 bg-gray-50 p-3 rounded text-sm">
                <p>You must provide both the ID and SyncToken of the entity you wish to delete.</p>
                <pre className="mt-2">
{`{
  "Id": "123",
  "SyncToken": "0"
}`}
                </pre>
              </div>
            </div>
            
            <Link 
              to="/operations" 
              className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
              Go to Operations Center
            </Link>
          </div>
        )}
        
        {/* Query Examples Section */}
        {activeSection === 'queries' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Query Examples</h2>
            
            <div className="mb-4">
              <p className="mb-4">QuickBooks Online uses a SQL-like query language for retrieving data. Here are some examples:</p>
              
              <pre className="bg-gray-50 p-4 rounded overflow-auto text-sm">
                {codeExamples.queries}
              </pre>
            </div>
            
            <div className="mb-6">
              <h3 className="font-bold mb-2">Query Parameters</h3>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left font-medium p-2">Parameter</th>
                      <th className="text-left font-medium p-2">Description</th>
                      <th className="text-left font-medium p-2">Example</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border-t border-gray-200">MAXRESULTS</td>
                      <td className="p-2 border-t border-gray-200">Limits the number of results returned</td>
                      <td className="p-2 border-t border-gray-200">SELECT * FROM Invoice MAXRESULTS 10</td>
                    </tr>
                    <tr>
                      <td className="p-2 border-t border-gray-200">STARTPOSITION</td>
                      <td className="p-2 border-t border-gray-200">Sets the starting position for results</td>
                      <td className="p-2 border-t border-gray-200">SELECT * FROM Invoice STARTPOSITION 5</td>
                    </tr>
                    <tr>
                      <td className="p-2 border-t border-gray-200">ORDER BY</td>
                      <td className="p-2 border-t border-gray-200">Sorts the results</td>
                      <td className="p-2 border-t border-gray-200">SELECT * FROM Invoice ORDER BY TxnDate</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <Link 
              to="/operations?operation=query" 
              className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
              Try Running a Query
            </Link>
          </div>
        )}
        
        {/* Report Options Section */}
        {activeSection === 'reports' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Report Options</h2>
            
            <div className="mb-4">
              <h3 className="font-bold mb-2">Available Reports</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="font-medium">Financial Reports</div>
                  <ul className="list-disc ml-4 mt-1 text-sm">
                    <li>ProfitAndLoss</li>
                    <li>BalanceSheet</li>
                    <li>CashFlow</li>
                    <li>TrialBalance</li>
                    <li>GeneralLedger</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-3 rounded">
                  <div className="font-medium">Business Reports</div>
                  <ul className="list-disc ml-4 mt-1 text-sm">
                    <li>VendorBalance</li>
                    <li>CustomerBalance</li>
                    <li>AgedReceivables</li>
                    <li>AgedPayables</li>
                    <li>ItemSales</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-bold mb-2">Common Report Options</h3>
              <pre className="bg-gray-50 p-4 rounded overflow-auto text-sm">
                {codeExamples.reportOptions}
              </pre>
              
              <div className="mt-4">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left font-medium p-2">Option</th>
                      <th className="text-left font-medium p-2">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border-t border-gray-200">startDate, endDate</td>
                      <td className="p-2 border-t border-gray-200">The date range for the report (YYYY-MM-DD format)</td>
                    </tr>
                    <tr>
                      <td className="p-2 border-t border-gray-200">accountingMethod</td>
                      <td className="p-2 border-t border-gray-200">"Accrual" or "Cash"</td>
                    </tr>
                    <tr>
                      <td className="p-2 border-t border-gray-200">columns</td>
                      <td className="p-2 border-t border-gray-200">Array of columns to include in the report</td>
                    </tr>
                    <tr>
                      <td className="p-2 border-t border-gray-200">summarizeColumnsBy</td>
                      <td className="p-2 border-t border-gray-200">How to group the report data</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <Link 
              to="/operations?operation=report" 
              className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
              Generate a Report
            </Link>
          </div>
        )}
        
        {/* Resources Section */}
        {activeSection === 'resources' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Additional Resources</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold mb-3">Official Documentation</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                      <span>QuickBooks API Documentation</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </li>
                  <li>
                    <a href="https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                      <span>OAuth 2.0 Authentication Guide</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </li>
                  <li>
                    <a href="https://developer.intuit.com/app/developer/qbo/docs/learn/explore-the-quickbooks-online-api/data-queries" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                      <span>Data Queries Documentation</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </li>
                </ul>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold mb-3">Developer Tools</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="https://developer.intuit.com/app/developer/playground" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                      <span>API Explorer & Playground</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </li>
                  <li>
                    <a href="https://developer.intuit.com/app/developer/qbo/docs/develop/sdks-and-samples" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                      <span>SDKs & Sample Apps</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </li>
                  <li>
                    <a href="https://developer.intuit.com/app/developer/qbo/docs/learn/learn-payments" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                      <span>QuickBooks Payments API</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Note: This is a simulated application for demonstration purposes. In a real implementation, you would need to handle OAuth token management securely, implement proper error handling, and use production endpoints.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiHelp;
