/**
 * 🔄 Get Fresh Auth Code
 */

import React, { useState } from 'react';

function GetFreshAuth() {
  const [authCode, setAuthCode] = useState('');
  const [copying, setCopying] = useState(false);

  const clientId = 'ABU6ALF7ZeebZ0JhhkPyp5H98xls1qLQIlp2GqtFE6F1dIx8zc';
  const redirectUri = 'https://eoge0jr9es1s20s.m.pipedream.net';
  const realmId = '9341455227664304';

  const authUrl = `https://appcenter.intuit.com/connect/oauth2?client_id=${clientId}&scope=com.intuit.quickbooks.accounting&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=random123`;

  const handleUpdateAuthCode = async () => {
    if (!authCode || authCode.length < 20) {
      alert('Please paste a valid authorization code from Pipedream!');
      return;
    }

    try {
      setCopying(true);
      
      // Save to localStorage
      localStorage.setItem('qbo_authorization_code', authCode);
      localStorage.setItem('qbo_authorization_code_timestamp', new Date().toISOString());
      
      alert(`✅ Authorization code saved to localStorage!\n\nNow go to: 🔍 Debug Auth\nAnd click: "🔄 Exchange Authorization Code for Tokens"`);
      
      // Redirect to debug auth
      window.location.href = '/debug-auth';
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setCopying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🔄 Get Fresh Authorization Code</h1>
          <p className="text-gray-600">Authorization codes expire quickly. Follow these steps to get a new one.</p>
        </div>

        {/* Step 1: Start OAuth Flow */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
              1
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800 mb-3">Start QuickBooks OAuth Flow</h2>
              <p className="text-gray-700 mb-4">
                Click this button to start the OAuth flow with QuickBooks. You'll be redirected to QuickBooks to authorize access.
              </p>
              <a
                href={authUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
              >
                🚀 Start QuickBooks OAuth
              </a>
              <p className="text-sm text-gray-500 mt-3">
                ⚠️ This will open QuickBooks in a new tab. After authorizing, you'll be redirected to Pipedream.
              </p>
            </div>
          </div>
        </div>

        {/* Step 2: Get Code from Pipedream */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
              2
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800 mb-3">Copy Authorization Code from Pipedream</h2>
              <p className="text-gray-700 mb-3">
                After authorizing, Pipedream will show you a JSON response. Look for the <code className="bg-gray-100 px-2 py-1 rounded">"code"</code> field.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Example Pipedream response:</p>
                <pre className="text-xs bg-gray-800 text-green-400 p-3 rounded overflow-x-auto">
{`{
  "trigger": {
    "event": {
      "query": {
        "code": "XAB11761583401TYdP9FNtZ1HhLQ6KtaZAeXlrhfRQ1iFrXPWX",
        "state": "random123",
        "realmId": "9341455227664304"
      }
    }
  }
}`}
                </pre>
              </div>

              <p className="text-gray-700 mb-2">
                <strong>Copy ONLY the code value</strong> (the long string starting with "XAB..."):
              </p>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Important:</strong> Authorization codes expire in about 10 minutes! Use it immediately after getting it.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Paste Code Here */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
              3
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800 mb-3">Paste Authorization Code</h2>
              <p className="text-gray-700 mb-4">
                Paste the authorization code from Pipedream here:
              </p>
              
              <div className="space-y-3">
                <textarea
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value.trim())}
                  placeholder="Paste authorization code here (e.g., XAB11761583401TYdP9FNtZ1HhLQ6KtaZAeXlrhfRQ1iFrXPWX)"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                  rows="3"
                />
                
                <button
                  onClick={handleUpdateAuthCode}
                  disabled={copying || !authCode}
                  className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {copying ? '⏳ Saving...' : '💾 Save & Exchange for Tokens'}
                </button>
              </div>

              {authCode && authCode.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>Code length:</strong> {authCode.length} characters
                    {authCode.length < 20 && <span className="text-red-600 ml-2">⚠️ Too short! Should be 40-50 characters</span>}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Reference */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">📋 Quick Reference</h2>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Client ID:</p>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded block mt-1">{clientId}</code>
              </div>
              <div>
                <p className="text-gray-600">Realm ID:</p>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded block mt-1">{realmId}</code>
              </div>
              <div className="col-span-2">
                <p className="text-gray-600">Redirect URI (Pipedream):</p>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded block mt-1">{redirectUri}</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GetFreshAuth;
