import React, { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { QuickBooksContext } from '../../contexts/QuickBooksContext';

const OAuthCallback = () => {
  const { updateAuth } = useContext(QuickBooksContext);
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
      updateAuth(prev => ({
        ...prev,
        realmId: realmId,
        authorizationCode: code
      }));

      // Redirect to authentication page with success message
      navigate('/auth?success=true&code=' + encodeURIComponent(code));
    } else {
      navigate('/auth?error=missing_parameters');
    }
  }, [searchParams, updateAuth, navigate]);

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