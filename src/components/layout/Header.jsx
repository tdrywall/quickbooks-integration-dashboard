import React, { useContext } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { QuickBooksContext } from '../../contexts/QuickBooksContext';

const Header = () => {
  const { auth } = useContext(QuickBooksContext);
  const location = useLocation();
  
  // Get the current page title based on the route
  const getPageTitle = () => {
    switch(location.pathname) {
      case '/':
        return 'Dashboard';
      case '/auth':
        return 'Authentication Setup';
      case '/operations':
        return 'Operations Center';
      case '/help':
        return 'API Help';
      default:
        return 'QuickBooks Integration';
    }
  };

  return (
    <header className="bg-white shadow-md">
      <div className="flex justify-between items-center px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h1>
        
        <div className="flex items-center space-x-4">
          {/* Auth status indicator */}
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${auth.isAuthenticated ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {auth.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
            </span>
          </div>
          
          {/* Quick auth link */}
          {!auth.isAuthenticated && (
            <Link 
              to="/auth" 
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Setup Auth
            </Link>
          )}
          
          {/* Environment indicator */}
          <div className="px-2 py-1 bg-gray-200 rounded-md text-xs">
            {auth.environment === 'sandbox' ? 'Sandbox' : 'Production'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
