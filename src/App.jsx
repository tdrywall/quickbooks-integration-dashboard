import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QuickBooksProvider } from './contexts/QuickBooksContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/pages/Dashboard';
import AuthenticationSetup from './components/pages/AuthenticationSetup';
import OperationsCenter from './components/pages/OperationsCenter';
import ApiHelp from './components/pages/ApiHelp';
import OAuthCallback from './components/pages/OAuthCallback';
import EstimateViewer from './components/pages/EstimateViewer';

function App() {
  return (
    <QuickBooksProvider>
      <Router>
        <div className="flex h-screen bg-gray-100">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-4">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/auth" element={<AuthenticationSetup />} />
                <Route path="/operations" element={<OperationsCenter />} />
                <Route path="/estimates" element={<EstimateViewer />} />
                <Route path="/help" element={<ApiHelp />} />
                <Route path="/callback" element={<OAuthCallback />} />
                <Route path="/oauth/callback" element={<OAuthCallback />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </QuickBooksProvider>
  );
}

export default App;
