import React, { useState, useEffect, useContext } from 'react';
import { QuickBooksContext } from '../../contexts/QuickBooksContext';

const EstimateViewer = () => {
  const { auth } = useContext(QuickBooksContext);
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEstimate, setSelectedEstimate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Mock data for development - replace with real API calls
  const mockEstimates = [
    {
      Id: "1",
      DocNumber: "EST-2024-001",
      TxnDate: "2024-10-20",
      CustomerRef: { value: "1", name: "Taylor Construction" },
      TotalAmt: 15750.00,
      PrivateNote: "Kitchen renovation estimate",
      TxnStatus: "Pending",
      Line: [
        {
          Id: "1",
          LineNum: 1,
          Amount: 8500.00,
          DetailType: "SalesItemLineDetail",
          SalesItemLineDetail: {
            ItemRef: { value: "1", name: "Kitchen Cabinets" },
            Qty: 1,
            UnitPrice: 8500.00
          }
        },
        {
          Id: "2", 
          LineNum: 2,
          Amount: 4250.00,
          DetailType: "SalesItemLineDetail",
          SalesItemLineDetail: {
            ItemRef: { value: "2", name: "Countertop Installation" },
            Qty: 25,
            UnitPrice: 170.00
          }
        },
        {
          Id: "3",
          LineNum: 3, 
          Amount: 3000.00,
          DetailType: "SalesItemLineDetail",
          SalesItemLineDetail: {
            ItemRef: { value: "3", name: "Labor - Kitchen Renovation" },
            Qty: 40,
            UnitPrice: 75.00
          }
        }
      ]
    },
    {
      Id: "2",
      DocNumber: "EST-2024-002", 
      TxnDate: "2024-10-18",
      CustomerRef: { value: "2", name: "Johnson Builders" },
      TotalAmt: 25600.00,
      PrivateNote: "Bathroom addition estimate",
      TxnStatus: "Accepted",
      Line: [
        {
          Id: "1",
          LineNum: 1,
          Amount: 12000.00,
          DetailType: "SalesItemLineDetail",
          SalesItemLineDetail: {
            ItemRef: { value: "4", name: "Bathroom Fixtures" },
            Qty: 1,
            UnitPrice: 12000.00
          }
        },
        {
          Id: "2",
          LineNum: 2,
          Amount: 13600.00,
          DetailType: "SalesItemLineDetail", 
          SalesItemLineDetail: {
            ItemRef: { value: "5", name: "Construction Labor" },
            Qty: 80,
            UnitPrice: 170.00
          }
        }
      ]
    },
    {
      Id: "3",
      DocNumber: "EST-2024-003",
      TxnDate: "2024-10-15", 
      CustomerRef: { value: "3", name: "Smith Residential" },
      TotalAmt: 8750.00,
      PrivateNote: "Deck construction estimate",
      TxnStatus: "Draft",
      Line: [
        {
          Id: "1",
          LineNum: 1,
          Amount: 4500.00,
          DetailType: "SalesItemLineDetail",
          SalesItemLineDetail: {
            ItemRef: { value: "6", name: "Deck Materials" },
            Qty: 1,
            UnitPrice: 4500.00
          }
        },
        {
          Id: "2", 
          LineNum: 2,
          Amount: 4250.00,
          DetailType: "SalesItemLineDetail",
          SalesItemLineDetail: {
            ItemRef: { value: "7", name: "Deck Installation Labor" },
            Qty: 25,
            UnitPrice: 170.00
          }
        }
      ]
    }
  ];

  const loadEstimates = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to fetch real QuickBooks estimates if authenticated
      if (auth.accessToken && auth.realmId) {
        console.log('Fetching real QuickBooks estimates...');
        const response = await fetch('/api/estimates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            accessToken: auth.accessToken,
            realmId: auth.realmId,
            environment: auth.environment || 'sandbox'
          }),
        });

        const result = await response.json();
        
        if (result.success) {
          console.log('Real estimates fetched:', result.data);
          setEstimates(result.data);
          setLoading(false);
          return;
        } else {
          console.error('Error fetching estimates:', result.error);
          setError(`QuickBooks API Error: ${result.error?.Fault?.[0]?.Error?.[0]?.Detail || 'Unknown error'}`);
        }
      }
      
      // Fall back to mock data if not authenticated or API fails
      console.log('Using mock data...');
      setTimeout(() => {
        setEstimates(mockEstimates);
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      console.error('Load estimates error:', err);
      setError(`Connection Error: ${err.message}`);
      // Fall back to mock data on error
      setEstimates(mockEstimates);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEstimates();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredEstimates = estimates.filter(estimate => {
    const matchesSearch = estimate.CustomerRef.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         estimate.DocNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         estimate.PrivateNote?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || estimate.TxnStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Accepted': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCreateProgressInvoice = async (estimate) => {
    try {
      setLoading(true);
      
      // For now, show progress invoicing options
      alert(`🚀 Creating Progress Invoice for ${estimate.DocNumber}

📊 Estimate Total: ${formatCurrency(estimate.TotalAmt)}
� Customer: ${estimate.CustomerRef.name}

⚡ Next: Progress invoicing workflow with:
• 25%, 50%, 75%, 100% billing options
• Milestone tracking
• Payment terms
• Remaining balance calculations

This will be implemented in the next phase!`);
      
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const EstimateDetailModal = ({ estimate, onClose }) => {
    if (!estimate) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto m-4">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Estimate {estimate.DocNumber}</h2>
                <p className="text-gray-600">Customer: {estimate.CustomerRef.name}</p>
                <p className="text-gray-600">Date: {formatDate(estimate.TxnDate)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(estimate.TxnStatus)}`}>
                  {estimate.TxnStatus}
                </span>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Line Items */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Line Items</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {estimate.Line.map((line) => (
                      <tr key={line.Id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {line.SalesItemLineDetail?.ItemRef?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {line.SalesItemLineDetail?.Qty || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(line.SalesItemLineDetail?.UnitPrice || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {formatCurrency(line.Amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="3" className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                        Total Amount:
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {formatCurrency(estimate.TotalAmt)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Notes */}
            {estimate.PrivateNote && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Notes</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded">{estimate.PrivateNote}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => handleCreateProgressInvoice(estimate)}
                disabled={estimate.TxnStatus !== 'Accepted'}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Create Progress Invoice
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Estimates</h1>
        <button
          onClick={loadEstimates}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search estimates by customer, number, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Status</option>
          <option value="Draft">Draft</option>
          <option value="Pending">Pending</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      )}

      {/* Estimates List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading estimates...</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estimate #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
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
              {filteredEstimates.map((estimate) => (
                <tr key={estimate.Id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {estimate.DocNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {estimate.CustomerRef.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(estimate.TxnDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {formatCurrency(estimate.TotalAmt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(estimate.TxnStatus)}`}>
                      {estimate.TxnStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setSelectedEstimate(estimate)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </button>
                    {estimate.TxnStatus === 'Accepted' && (
                      <button
                        onClick={() => handleCreateProgressInvoice(estimate)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Invoice
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredEstimates.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              No estimates found matching your criteria.
            </div>
          )}
        </div>
      )}

      {/* Estimate Detail Modal */}
      {selectedEstimate && (
        <EstimateDetailModal 
          estimate={selectedEstimate}
          onClose={() => setSelectedEstimate(null)}
        />
      )}
    </div>
  );
};

export default EstimateViewer;