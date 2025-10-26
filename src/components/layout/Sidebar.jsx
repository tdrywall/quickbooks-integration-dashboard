import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { QuickBooksContext } from '../../contexts/QuickBooksContext';

const Sidebar = () => {
  const { auth } = useContext(QuickBooksContext);
  const location = useLocation();

  // Navigation items
  const navItems = [
    { path: '/', label: 'Dashboard', icon: 'chart-pie' },
    { path: '/auth', label: 'Authentication', icon: 'key' },
    { path: '/estimates', label: 'Estimates', icon: 'document-text' },
    { path: '/operations', label: 'Operations', icon: 'cog' },
    { path: '/help', label: 'API Help', icon: 'question-circle' }
  ];

  return (
    <div className="bg-gray-800 text-white w-64 flex-shrink-0 hidden md:block">
      <div className="p-4 flex items-center">
        <span className="text-xl font-bold">QuickBooks Integration</span>
      </div>
      
      <nav className="mt-8">
        <ul>
          {navItems.map((item) => (
            <li key={item.path} className="mb-2">
              <Link
                to={item.path}
                className={`flex items-center px-6 py-3 hover:bg-gray-700 ${location.pathname === item.path ? 'bg-gray-700' : ''}`}
              >
                <i className={`fas fa-${item.icon} w-5`}></i>
                <span>{item.label}</span>
                
                {/* For Authentication, show status indicator */}
                {item.path === '/auth' && (
                  <div className="ml-auto">
                    <div className={`w-2 h-2 rounded-full ${auth.isAuthenticated ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="absolute bottom-0 w-64 p-4 bg-gray-900">
        <div className="text-sm text-gray-400 mb-2">
          {auth.isAuthenticated ? (
            <>
              <div className="mb-1">Company ID: {auth.realmId || 'Not set'}</div>
              <div className="text-xs overflow-hidden text-ellipsis">Token expires: {auth.tokenExpiryDate ? new Date(auth.tokenExpiryDate).toLocaleString() : 'N/A'}</div>
            </>
          ) : (
            "Not authenticated"
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
