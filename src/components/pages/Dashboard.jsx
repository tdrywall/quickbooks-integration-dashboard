import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { QuickBooksContext } from '../../contexts/QuickBooksContext';

const Dashboard = () => {
  const { auth, apiUsage, operationsHistory, resetApiUsage } = useContext(QuickBooksContext);

  // Calculate success rate
  const successRate = apiUsage.totalCalls > 0 
    ? ((apiUsage.totalCalls - apiUsage.errors) / apiUsage.totalCalls * 100).toFixed(1) 
    : 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Authentication Status Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Authentication Status</h2>
        
        <div className={`p-4 rounded-lg ${auth.isAuthenticated ? 'bg-green-100' : 'bg-red-100'}`}>
          <div className="flex items-center mb-2">
            <div className={`w-4 h-4 rounded-full mr-2 ${auth.isAuthenticated ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="font-semibold">
              {auth.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
            </span>
          </div>
          
          {auth.isAuthenticated ? (
            <div className="text-sm space-y-1">
              <div><span className="font-medium">Environment:</span> {auth.environment === 'sandbox' ? 'Sandbox' : 'Production'}</div>
              <div><span className="font-medium">Company ID:</span> {auth.realmId || 'Not set'}</div>
              <div><span className="font-medium">Token Expires:</span> {auth.tokenExpiryDate ? new Date(auth.tokenExpiryDate).toLocaleString() : 'N/A'}</div>
            </div>
          ) : (
            <div className="mt-2">
              <Link to="/auth" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm">
                Setup Authentication
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* API Usage Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">API Usage</h2>
          <button 
            onClick={resetApiUsage}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Reset
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-100 p-3 rounded">
            <div className="text-3xl font-bold mb-1">{apiUsage.totalCalls}</div>
            <div className="text-sm text-gray-600">Total API Calls</div>
          </div>
          
          <div className="bg-gray-100 p-3 rounded">
            <div className="text-3xl font-bold mb-1">{successRate}%</div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </div>
        </div>
        
        <div className="mt-4">
          <h3 className="font-medium mb-2">Operation Breakdown</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Create:</span>
              <span>{apiUsage.createOperations}</span>
            </div>
            <div className="flex justify-between">
              <span>Read:</span>
              <span>{apiUsage.readOperations}</span>
            </div>
            <div className="flex justify-between">
              <span>Update:</span>
              <span>{apiUsage.updateOperations}</span>
            </div>
            <div className="flex justify-between">
              <span>Delete:</span>
              <span>{apiUsage.deleteOperations}</span>
            </div>
            <div className="flex justify-between">
              <span>Query:</span>
              <span>{apiUsage.queryOperations}</span>
            </div>
            <div className="flex justify-between">
              <span>Report:</span>
              <span>{apiUsage.reportOperations}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        
        <div className="space-y-3">
          <Link 
            to="/operations"
            className="block w-full p-3 bg-blue-600 hover:bg-blue-700 text-white text-center rounded"
          >
            Execute Operation
          </Link>
          
          <Link 
            to="/operations?operation=query"
            className="block w-full p-3 bg-blue-100 hover:bg-blue-200 text-blue-800 text-center rounded"
          >
            Run Query
          </Link>
          
          <Link 
            to="/operations?operation=report&reportType=ProfitAndLoss"
            className="block w-full p-3 bg-green-100 hover:bg-green-200 text-green-800 text-center rounded"
          >
            Generate Profit & Loss Report
          </Link>
          
          <Link 
            to="/auth"
            className="block w-full p-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-center rounded"
          >
            Manage Authentication
          </Link>
        </div>
      </div>

      {/* Recent Operations Card */}
      <div className="col-span-1 lg:col-span-3 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Recent Operations</h2>
        
        {operationsHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operation</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {operationsHistory.slice(0, 10).map((operation) => (
                  <tr key={operation.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">{new Date(operation.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 capitalize">{operation.operation}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 capitalize">{operation.entityType}</td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${operation.successful ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {operation.successful ? 'Success' : 'Failed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            No operations have been executed yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
