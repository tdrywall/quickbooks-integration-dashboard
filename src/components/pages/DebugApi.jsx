/**
 * 🐛 Debug API - View All Raw API Responses
 */

import React, { useState, useContext } from 'react';
import { QuickBooksContext } from '../../contexts/QuickBooksContext';

function DebugApi() {
  const { auth } = useContext(QuickBooksContext);
  const [endpoint, setEndpoint] = useState('/api/estimates');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const endpoints = [
    { value: '/api/estimates', label: '📊 Estimates' },
    { value: '/api/classes', label: '📁 Classes/Projects' },
    { value: '/api/company-info', label: '🏢 Company Info' },
    { value: '/api/health', label: '❤️ Health Check', method: 'GET' }
  ];

  const testEndpoint = async () => {
    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const selectedEndpoint = endpoints.find(e => e.value === endpoint);
      const method = selectedEndpoint?.method || 'POST';

      console.log(`🔍 Testing ${method} ${endpoint}...`);

      const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
      };

      if (method === 'POST') {
        options.body = JSON.stringify({
          accessToken: auth.accessToken,
          realmId: auth.realmId,
          environment: auth.environment || 'sandbox'
        });
      }

      const startTime = performance.now();
      const res = await fetch(endpoint, options);
      const endTime = performance.now();
      const duration = (endTime - startTime).toFixed(2);

      let data;
      const contentType = res.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = { _rawText: text, _note: 'Response was not JSON' };
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        headers: Object.fromEntries(res.headers.entries()),
        data: data,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });

      console.log('✅ Response:', data);
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message);
      setResponse({
        error: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('✅ Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🐛 Debug API</h1>
          <p className="text-gray-600">Test API endpoints and view raw responses</p>
        </div>

        {/* Auth Status */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🔐 Authentication Status</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Access Token:</p>
              <p className="font-mono text-sm break-all">
                {auth.accessToken ? `${auth.accessToken.substring(0, 40)}...` : '❌ Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Realm ID:</p>
              <p className="font-mono text-sm">{auth.realmId || '❌ Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Environment:</p>
              <p className="font-mono text-sm">{auth.environment || 'sandbox'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Authenticated:</p>
              <p className={`font-mono text-sm ${auth.isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                {auth.isAuthenticated ? '✅ YES' : '❌ NO'}
              </p>
            </div>
          </div>
        </div>

        {/* Test Endpoint */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🧪 Test Endpoint</h2>
          
          <div className="flex gap-4 mb-4">
            <select
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {endpoints.map((ep) => (
                <option key={ep.value} value={ep.value}>
                  {ep.label} - {ep.value}
                </option>
              ))}
            </select>
            
            <button
              onClick={testEndpoint}
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? '⏳ Testing...' : '🚀 Test API'}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        {/* Response Display */}
        {response && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">📦 Response</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(JSON.stringify(response, null, 2))}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                >
                  📋 Copy JSON
                </button>
                <button
                  onClick={() => setResponse(null)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600"
                >
                  ✖️ Clear
                </button>
              </div>
            </div>

            {/* Response Metadata */}
            <div className="grid grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-600">Status</p>
                <p className={`text-lg font-bold ${response.ok ? 'text-green-600' : 'text-red-600'}`}>
                  {response.status} {response.statusText}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Duration</p>
                <p className="text-lg font-bold text-blue-600">{response.duration}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Timestamp</p>
                <p className="text-sm font-mono">{new Date(response.timestamp).toLocaleTimeString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Size</p>
                <p className="text-lg font-bold text-purple-600">
                  {(JSON.stringify(response.data).length / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>

            {/* Response Headers */}
            {response.headers && (
              <details className="mb-4">
                <summary className="cursor-pointer font-semibold text-gray-700 mb-2 hover:text-purple-600">
                  📝 Response Headers
                </summary>
                <pre className="bg-gray-800 text-green-400 p-4 rounded-lg overflow-auto text-xs">
                  {JSON.stringify(response.headers, null, 2)}
                </pre>
              </details>
            )}

            {/* Response Data */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-700 mb-2">💾 Response Data</h3>
              
              {/* Data Summary */}
              {response.data && typeof response.data === 'object' && (
                <div className="bg-blue-50 p-3 rounded-lg mb-3 text-sm">
                  <strong>Summary:</strong>
                  {response.data.success !== undefined && (
                    <span className="ml-2">
                      Success: <strong className={response.data.success ? 'text-green-600' : 'text-red-600'}>
                        {response.data.success ? '✅ YES' : '❌ NO'}
                      </strong>
                    </span>
                  )}
                  {response.data.data && Array.isArray(response.data.data) && (
                    <span className="ml-3">
                      Array Length: <strong className="text-blue-600">{response.data.data.length}</strong>
                    </span>
                  )}
                  {response.data.error && (
                    <div className="mt-2 text-red-600">
                      <strong>Error:</strong> {JSON.stringify(response.data.error)}
                    </div>
                  )}
                </div>
              )}

              {/* Full JSON */}
              <pre className="bg-gray-800 text-green-400 p-4 rounded-lg overflow-auto max-h-96 text-xs">
                {JSON.stringify(response.data, null, 2)}
              </pre>
            </div>

            {/* Quick Actions */}
            {response.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">🔍 Quick Inspection</h4>
                <p className="text-sm text-gray-700 mb-2">
                  Found <strong>{response.data.data.length}</strong> items. First item structure:
                </p>
                <pre className="bg-gray-800 text-green-400 p-3 rounded overflow-auto max-h-48 text-xs">
                  {JSON.stringify(response.data.data[0], null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Server Status Check */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🖥️ Server Status</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Frontend:</strong> http://localhost:3000 (React)</p>
            <p><strong>Backend:</strong> http://localhost:3001 (Express)</p>
            <p className="text-gray-600 text-xs mt-3">
              ⚠️ If you see "Proxy error" or "ERR_CONNECTION_REFUSED", the backend server is not running.
              <br />
              Start it with: <code className="bg-gray-100 px-2 py-1 rounded">node server.js</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DebugApi;
