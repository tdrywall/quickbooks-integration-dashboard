import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuickBooksContext } from '../../contexts/QuickBooksContext';

const QuickSetup = () => {
  const { auth, updateAuth, exchangeAuthCodeForTokens } = useContext(QuickBooksContext);
  const navigate = useNavigate();
  const [clientId, setClientId] = useState(auth.clientId || '');
  const [clientSecret, setClientSecret] = useState(auth.clientSecret || '');
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState('');

  const handleQuickSetup = async () => {
    setProcessing(true);
    setStatus('💾 Saving credentials...');

    // Save credentials
    updateAuth({
      clientId,
      clientSecret
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    // Exchange the auth code we already have
    setStatus('🔄 Exchanging authorization code for access tokens...');
    
    const result = await exchangeAuthCodeForTokens(auth.authorizationCode);
    
    if (result.success) {
      setStatus('✅ Success! Redirecting to your estimates...');
      setTimeout(() => {
        navigate('/estimates');
      }, 1000);
    } else {
      setStatus(`❌ Error: ${result.message}`);
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">⚡ Quick Setup</h1>
        <p className="text-gray-600 mb-6">
          You're almost there! Just enter your QuickBooks app credentials and you're done.
        </p>

        {/* Step-by-step instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Where to find your credentials:</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Go to <a href="https://developer.intuit.com/app/developer/myapps" target="_blank" rel="noopener noreferrer" className="underline font-medium">developer.intuit.com/app/developer/myapps</a></li>
            <li>Click on your QuickBooks app</li>
            <li>Go to "Keys & credentials" tab</li>
            <li>Copy your <strong>Client ID</strong> and <strong>Client Secret</strong></li>
            <li>Paste them below and click "Complete Setup"</li>
          </ol>
        </div>

        {/* Input fields */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              QuickBooks Client ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="AB..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              disabled={processing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              QuickBooks Client Secret <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder="Enter your client secret"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              disabled={processing}
            />
          </div>
        </div>

        {/* Status message */}
        {status && (
          <div className={`mb-6 p-4 rounded-lg ${
            status.includes('✅') ? 'bg-green-50 text-green-800' :
            status.includes('❌') ? 'bg-red-50 text-red-800' :
            'bg-blue-50 text-blue-800'
          }`}>
            {status}
          </div>
        )}

        {/* Action button */}
        <button
          onClick={handleQuickSetup}
          disabled={processing || !clientId || !clientSecret}
          className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed font-semibold text-lg transition-all shadow-lg hover:shadow-xl"
        >
          {processing ? '⏳ Setting up...' : '🚀 Complete Setup & View My Estimates'}
        </button>

        {/* What this does */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>What happens when you click:</strong>
          </p>
          <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc list-inside">
            <li>Saves your QuickBooks credentials securely in your browser</li>
            <li>Exchanges your authorization code for access tokens</li>
            <li>Connects to your QuickBooks Online account</li>
            <li>Takes you straight to your estimates with real data</li>
          </ul>
        </div>

        {/* Already have auth code notice */}
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✅ <strong>Authorization Code:</strong> {auth.authorizationCode ? 'Already saved' : 'Missing'}
          </p>
          <p className="text-sm text-green-800">
            ✅ <strong>Realm ID:</strong> {auth.realmId}
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuickSetup;
