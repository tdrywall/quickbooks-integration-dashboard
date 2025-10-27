import React, { useContext, useState } from 'react';
import { QuickBooksContext } from '../../contexts/QuickBooksContext';

const DebugAuth = () => {
  const { auth, exchangeAuthCodeForTokens, updateAuth } = useContext(QuickBooksContext);
  const [clientId, setClientId] = useState(auth.clientId || '');
  const [clientSecret, setClientSecret] = useState(auth.clientSecret || '');
  const [exchanging, setExchanging] = useState(false);
  const [result, setResult] = useState(null);

  const handleExchangeToken = async () => {
    setExchanging(true);
    setResult(null);

    // First update auth with credentials
    updateAuth({
      ...auth,
      clientId,
      clientSecret
    });

    // Then exchange the code
    const exchangeResult = await exchangeAuthCodeForTokens(auth.authorizationCode);
    setResult(exchangeResult);
    setExchanging(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">🔍 QuickBooks Authentication Debug</h1>

      {/* Current Auth Status */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Current Authentication Status</h2>
        <div className="space-y-2 font-mono text-sm">
          <div>
            <span className="font-bold">Authenticated:</span>{' '}
            <span className={auth.isAuthenticated ? 'text-green-600' : 'text-red-600'}>
              {auth.isAuthenticated ? '✅ YES' : '❌ NO'}
            </span>
          </div>
          <div>
            <span className="font-bold">Client ID:</span>{' '}
            <span className={auth.clientId ? 'text-green-600' : 'text-red-600'}>
              {auth.clientId ? `${auth.clientId.substring(0, 10)}...` : '❌ Missing'}
            </span>
          </div>
          <div>
            <span className="font-bold">Client Secret:</span>{' '}
            <span className={auth.clientSecret ? 'text-green-600' : 'text-red-600'}>
              {auth.clientSecret ? '****' : '❌ Missing'}
            </span>
          </div>
          <div>
            <span className="font-bold">Authorization Code:</span>{' '}
            <span className={auth.authorizationCode ? 'text-green-600' : 'text-red-600'}>
              {auth.authorizationCode ? `${auth.authorizationCode.substring(0, 20)}...` : '❌ Missing'}
            </span>
          </div>
          <div>
            <span className="font-bold">Access Token:</span>{' '}
            <span className={auth.accessToken ? 'text-green-600' : 'text-red-600'}>
              {auth.accessToken ? `${auth.accessToken.substring(0, 20)}...` : '❌ Missing'}
            </span>
          </div>
          <div>
            <span className="font-bold">Refresh Token:</span>{' '}
            <span className={auth.refreshToken ? 'text-green-600' : 'text-red-600'}>
              {auth.refreshToken ? `${auth.refreshToken.substring(0, 20)}...` : '❌ Missing'}
            </span>
          </div>
          <div>
            <span className="font-bold">Realm ID:</span>{' '}
            <span className="text-blue-600">{auth.realmId || '❌ Missing'}</span>
          </div>
          <div>
            <span className="font-bold">Environment:</span>{' '}
            <span className="text-blue-600">{auth.environment || 'sandbox'}</span>
          </div>
        </div>
      </div>

      {/* Exchange Authorization Code */}
      {!auth.accessToken && auth.authorizationCode && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-yellow-900">⚠️ Action Required: Exchange Authorization Code</h2>
          <p className="text-yellow-800 mb-4">
            You have an authorization code but no access token. You need to exchange your authorization code for tokens.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                QuickBooks Client ID
              </label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="e.g., AB..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                QuickBooks Client Secret
              </label>
              <input
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder="Enter your client secret"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleExchangeToken}
              disabled={exchanging || !clientId || !clientSecret}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {exchanging ? 'Exchanging...' : '🔄 Exchange Authorization Code for Tokens'}
            </button>

            {result && (
              <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {result.success ? '✅' : '❌'} {result.message}
              </div>
            )}
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>📝 Where to find your credentials:</strong>
            </p>
            <ol className="text-sm text-blue-800 mt-2 space-y-1 list-decimal list-inside">
              <li>Go to <a href="https://developer.intuit.com/app/developer/myapps" target="_blank" rel="noopener noreferrer" className="underline">developer.intuit.com</a></li>
              <li>Select your app</li>
              <li>Go to "Keys & credentials" tab</li>
              <li>Copy your Client ID and Client Secret</li>
            </ol>
          </div>
        </div>
      )}

      {/* Success State */}
      {auth.accessToken && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2 text-green-900">✅ Successfully Authenticated!</h2>
          <p className="text-green-800">
            You're connected to QuickBooks. You can now view your estimates and projects.
          </p>
        </div>
      )}

      {/* Raw Auth Data (for debugging) */}
      <details className="bg-gray-50 rounded-lg p-4">
        <summary className="cursor-pointer font-semibold text-gray-700">
          🔧 Raw Auth Data (for debugging)
        </summary>
        <pre className="mt-4 p-4 bg-white rounded border overflow-auto text-xs">
          {JSON.stringify(auth, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default DebugAuth;
