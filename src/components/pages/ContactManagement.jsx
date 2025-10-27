import React, { useState } from 'react';

const ContactManagement = () => {
  const [activeTab, setActiveTab] = useState('customers');
  const [showForm, setShowForm] = useState(false);
  const [contacts, setContacts] = useState({
    customers: [],
    suppliers: [],
    employees: []
  });

  const tabs = [
    { id: 'customers', name: 'Customers', icon: '👥' },
    { id: 'suppliers', name: 'Suppliers', icon: '🏢' },
    { id: 'employees', name: 'Employees', icon: '👷' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contact Management</h1>
          <p className="text-gray-600 mt-1">
            Manage your customers, suppliers, and employees with AI-powered data validation
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Contact
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
              {contacts[tab.id].length > 0 && (
                <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                  {contacts[tab.id].length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Contact List */}
      <div className="bg-white rounded-lg shadow">
        {contacts[activeTab].length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">
              {activeTab === 'customers' && '👥'}
              {activeTab === 'suppliers' && '🏢'}
              {activeTab === 'employees' && '👷'}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeTab} found
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by adding your first {activeTab.slice(0, -1)}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add {activeTab.slice(0, -1)}
            </button>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts[activeTab].map((contact) => (
                  <tr key={contact.naturalKey} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {contact.data.DisplayName}
                          </div>
                          {contact.data.CompanyName && contact.data.CompanyName !== contact.data.DisplayName && (
                            <div className="text-sm text-gray-500">
                              {contact.data.CompanyName}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {contact.data.PrimaryEmailAddr?.Address}
                      </div>
                      <div className="text-sm text-gray-500">
                        {contact.data.PrimaryPhone?.FreeFormNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        contact.status === 'valid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {contact.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Contact Form Modal - Coming next */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Add {activeTab.slice(0, -1)}
            </h3>
            <p className="text-gray-600 mb-4">
              Coming next: AI-powered contact form with natural language input and automatic validation.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactManagement;