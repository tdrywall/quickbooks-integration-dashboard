import React, { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { QuickBooksContext } from '../../contexts/QuickBooksContext';

const OAuthCallback = () => {
  const { updateAuth, exchangeAuthCodeForTokens } = useContext(QuickBooksContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');
    const realmId = searchParams.get('realmId');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      navigate('/auth?error=' + encodeURIComponent(error));
      return;
    }

    if (code && realmId) {
      // Update the auth context with the authorization code and realm ID
      updateAuth({
        realmId: realmId,
        authorizationCode: code
      });

      // Automatically exchange the authorization code for tokens
      console.log('🔄 Automatically exchanging authorization code for access tokens...');
      
      exchangeAuthCodeForTokens(code).then(result => {
        if (result.success) {
          console.log('✅ Successfully obtained access tokens!');
          navigate('/estimates?success=authenticated');
        } else {
          console.error('❌ Token exchange failed:', result.message);
          // Still save the code so user can manually exchange on debug page
          navigate('/debug-auth?error=' + encodeURIComponent(result.message));
        }
      }).catch(err => {
        console.error('❌ Token exchange error:', err);
        navigate('/debug-auth?error=' + encodeURIComponent(err.message));
      });
    } else {
      navigate('/auth?error=missing_parameters');
    }
  }, [searchParams, updateAuth, exchangeAuthCodeForTokens, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Processing Authorization...</h2>
          <p className="text-gray-600">Please wait while we complete the authentication process.</p>
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;