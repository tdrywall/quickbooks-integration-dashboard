/**
 * 🏗️ Construction Progress Billing Dashboard
 * Main interface for managing progress billings, draws, and holdbacks
 */

import React, { useState, useEffect, useContext } from 'react';
import { QuickBooksContext } from '../../contexts/QuickBooksContext';
import { progressBillingManager } from '../../utils/progressBilling';
import { downloadProgressInvoicePdf, downloadHoldbackReleasePdf } from '../../utils/progressInvoicePdf';

function ProgressBilling() {
  const { auth } = useContext(QuickBooksContext);
  const [estimates, setEstimates] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showCreateDraw, setShowCreateDraw] = useState(false);
  const [showHoldbackRelease, setShowHoldbackRelease] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state for new draw
  const [drawForm, setDrawForm] = useState({
    percentComplete: '',
    invoiceNumber: '',
    notes: ''
  });

  // Form state for holdback release
  const [holdbackForm, setHoldbackForm] = useState({
    releaseAmount: '',
    invoiceNumber: '',
    notes: 'Holdback Release - Substantial Completion'
  });

  // Load estimates and projects on mount
  useEffect(() => {
    loadProjects();
    if (auth.accessToken) {
      loadEstimates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.accessToken]);

  const loadEstimates = async () => {
    if (!auth.accessToken) return;

    try {
      setLoading(true);
      const response = await fetch('/api/estimates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: auth.accessToken,
          realmId: auth.realmId,
          environment: auth.environment
        })
      });

      const data = await response.json();
      if (data.success) {
        setEstimates(data.estimates || []);
        setError('');
      } else {
        const errorMsg = typeof data.error === 'object' ? JSON.stringify(data.error) : data.error;
        setError('Failed to load estimates: ' + errorMsg);
        console.error('Estimate load error:', data.error);
      }
    } catch (err) {
      setError('Error loading estimates: ' + err.message);
      console.error('Estimate load exception:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = () => {
    const allProjects = progressBillingManager.getAllProjects();
    setProjects(allProjects);
  };

  const handleInitializeProject = (estimate) => {
    const holdback = parseFloat(prompt('Enter holdback percentage (default 10%):', '10') || '10');
    progressBillingManager.initializeProject(estimate, holdback);
    loadProjects();
    alert(`Project initialized: ${estimate.CustomerMemo?.value || estimate.DocNumber}`);
  };

  const handleSelectProject = (estimateId) => {
    const project = progressBillingManager.getProjectHistory(estimateId);
    setSelectedProject(project);
    setShowCreateDraw(false);
    setShowHoldbackRelease(false);
  };

  const handleCreateDraw = async () => {
    if (!selectedProject) return;

    try {
      const percentComplete = parseFloat(drawForm.percentComplete);
      if (isNaN(percentComplete) || percentComplete < 0 || percentComplete > 100) {
        alert('Please enter a valid percentage between 0 and 100');
        return;
      }

      const result = progressBillingManager.createDraw(
        selectedProject.estimateId,
        percentComplete,
        drawForm.invoiceNumber || null,
        drawForm.notes
      );

      // Generate and download PDF
      const invoiceData = {
        project: result.project,
        draw: result.draw,
        calculation: result.calculation,
        companyInfo: {
          name: 'TAYLOR CONSTRUCTION',
          address: 'Your Address Here',
          phone: 'Your Phone Here',
          email: 'Your Email Here'
        }
      };

      downloadProgressInvoicePdf(invoiceData);

      // Refresh and reset
      loadProjects();
      setSelectedProject(progressBillingManager.getProjectHistory(selectedProject.estimateId));
      setShowCreateDraw(false);
      setDrawForm({ percentComplete: '', invoiceNumber: '', notes: '' });

      alert(`✅ Draw #${result.draw.drawNumber} created and PDF downloaded!`);
    } catch (err) {
      alert('Error creating draw: ' + err.message);
    }
  };

  const handleReleaseHoldback = async () => {
    if (!selectedProject) return;

    try {
      const releaseAmount = parseFloat(holdbackForm.releaseAmount);
      if (isNaN(releaseAmount) || releaseAmount <= 0) {
        alert('Please enter a valid release amount');
        return;
      }

      const result = progressBillingManager.releaseHoldback(
        selectedProject.estimateId,
        releaseAmount,
        holdbackForm.invoiceNumber || null,
        holdbackForm.notes
      );

      // Generate and download PDF
      const invoiceData = {
        project: result.project,
        draw: result.draw,
        remainingHoldback: result.remainingHoldback
      };

      downloadHoldbackReleasePdf(invoiceData);

      // Refresh and reset
      loadProjects();
      setSelectedProject(progressBillingManager.getProjectHistory(selectedProject.estimateId));
      setShowHoldbackRelease(false);
      setHoldbackForm({ releaseAmount: '', invoiceNumber: '', notes: 'Holdback Release - Substantial Completion' });

      alert(`✅ Holdback release created and PDF downloaded!\nRemaining holdback: $${result.remainingHoldback.toFixed(2)}`);
    } catch (err) {
      alert('Error releasing holdback: ' + err.message);
    }
  };

  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🏗️ Construction Progress Billing</h1>
          <p className="text-gray-600">Manage draws, holdbacks, and progress invoicing</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-semibold mb-2">{error}</p>
            {!auth.accessToken && (
              <div className="mt-3 text-sm">
                <p className="mb-2">🔐 <strong>Authentication Required:</strong></p>
                <p className="mb-2">If you're viewing this in VS Code's preview, <strong>open in external browser instead:</strong></p>
                <a 
                  href="http://localhost:3000/progress-billing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  🌐 Open in Browser
                </a>
                <p className="mt-3 text-xs text-gray-600">
                  Or navigate to: <strong>🔍 Debug Auth</strong> in the sidebar to authenticate
                </p>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Projects List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Active Projects</h2>
              
              {projects.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-2">No projects initialized yet</p>
                  <p className="text-sm">Select an estimate below to start</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {projects.map((project) => (
                    <div
                      key={project.estimateId}
                      onClick={() => handleSelectProject(project.estimateId)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedProject?.estimateId === project.estimateId
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <h3 className="font-bold text-gray-800 mb-1">{project.clientName}</h3>
                      <p className="text-sm text-gray-600 mb-2">{project.estimateName}</p>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress:</span>
                        <span className="font-bold text-blue-600">{project.percentComplete.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Invoiced:</span>
                        <span className="font-bold">{formatCurrency(project.totalInvoiced)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Holdback:</span>
                        <span className="font-bold text-red-600">{formatCurrency(project.holdbackRetained)}</span>
                      </div>
                      {project.isComplete && (
                        <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          ✅ Complete
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Available Estimates */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Initialize New Project</h3>
                {loading ? (
                  <p className="text-gray-500 text-center py-4">Loading estimates...</p>
                ) : estimates.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No estimates found</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {estimates
                      .filter(est => !projects.find(p => p.estimateId === est.Id))
                      .map((estimate) => (
                        <div
                          key={estimate.Id}
                          onClick={() => handleInitializeProject(estimate)}
                          className="p-3 rounded-lg border border-gray-200 hover:border-green-400 hover:bg-green-50 cursor-pointer transition-all"
                        >
                          <p className="font-semibold text-gray-800">{estimate.CustomerRef?.name}</p>
                          <p className="text-sm text-gray-600">{estimate.CustomerMemo?.value || estimate.DocNumber}</p>
                          <p className="text-sm font-bold text-green-600">{formatCurrency(estimate.TotalAmt)}</p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Project Details */}
          <div className="lg:col-span-2">
            {selectedProject ? (
              <div className="space-y-6">
                {/* Project Summary */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">{selectedProject.clientName}</h2>
                      <p className="text-gray-600">{selectedProject.estimateName}</p>
                      <p className="text-sm text-gray-500">Job #: {selectedProject.customerRef}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Estimate Total</p>
                      <p className="text-2xl font-bold text-gray-800">{formatCurrency(selectedProject.estimateTotal)}</p>
                    </div>
                  </div>

                  {/* Progress Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Total Invoiced</p>
                      <p className="text-xl font-bold text-blue-600">{formatCurrency(selectedProject.totalInvoiced)}</p>
                      <p className="text-xs text-gray-500">
                        {((selectedProject.totalInvoiced / selectedProject.estimateTotal) * 100).toFixed(1)}% complete
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Holdback Retained</p>
                      <p className="text-xl font-bold text-red-600">
                        {formatCurrency(selectedProject.totalHoldback - selectedProject.holdbackReleased)}
                      </p>
                      <p className="text-xs text-gray-500">{selectedProject.holdbackPercent}% holdback</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Remaining to Bill</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(selectedProject.estimateTotal - selectedProject.totalInvoiced)}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowCreateDraw(true);
                        setShowHoldbackRelease(false);
                      }}
                      className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                      disabled={selectedProject.isComplete}
                    >
                      📝 Create New Draw
                    </button>
                    <button
                      onClick={() => {
                        setShowHoldbackRelease(true);
                        setShowCreateDraw(false);
                        setHoldbackForm({
                          ...holdbackForm,
                          releaseAmount: (selectedProject.totalHoldback - selectedProject.holdbackReleased).toFixed(2)
                        });
                      }}
                      className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                      disabled={selectedProject.totalHoldback <= selectedProject.holdbackReleased}
                    >
                      💰 Release Holdback
                    </button>
                  </div>
                </div>

                {/* Create Draw Form */}
                {showCreateDraw && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Create New Progress Draw</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Percent Complete (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={drawForm.percentComplete}
                          onChange={(e) => setDrawForm({ ...drawForm, percentComplete: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter percentage (e.g., 75)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Invoice Number (optional)
                        </label>
                        <input
                          type="text"
                          value={drawForm.invoiceNumber}
                          onChange={(e) => setDrawForm({ ...drawForm, invoiceNumber: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Auto-generated if left blank"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Notes (optional)
                        </label>
                        <textarea
                          value={drawForm.notes}
                          onChange={(e) => setDrawForm({ ...drawForm, notes: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows="3"
                          placeholder="Add any notes or details..."
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleCreateDraw}
                          className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                        >
                          Generate Invoice PDF
                        </button>
                        <button
                          onClick={() => setShowCreateDraw(false)}
                          className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Holdback Release Form */}
                {showHoldbackRelease && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Release Holdback</h3>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-700">
                        <strong>Available Holdback:</strong> {formatCurrency(selectedProject.totalHoldback - selectedProject.holdbackReleased)}
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Release Amount ($)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={holdbackForm.releaseAmount}
                          onChange={(e) => setHoldbackForm({ ...holdbackForm, releaseAmount: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter amount to release"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Invoice Number (optional)
                        </label>
                        <input
                          type="text"
                          value={holdbackForm.invoiceNumber}
                          onChange={(e) => setHoldbackForm({ ...holdbackForm, invoiceNumber: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Auto-generated if left blank"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Notes
                        </label>
                        <textarea
                          value={holdbackForm.notes}
                          onChange={(e) => setHoldbackForm({ ...holdbackForm, notes: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          rows="3"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleReleaseHoldback}
                          className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                        >
                          Generate Release Invoice
                        </button>
                        <button
                          onClick={() => setShowHoldbackRelease(false)}
                          className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Draw History */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Draw History</h3>
                  {selectedProject.draws.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No draws yet</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Draw #</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Invoice #</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">% Complete</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Gross</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Holdback</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Net Payable</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedProject.draws.map((draw) => (
                            <tr key={draw.drawNumber} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-gray-800">
                                {draw.isHoldbackRelease ? '🔓' : draw.drawNumber}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">{formatDate(draw.date)}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{draw.invoiceNumber}</td>
                              <td className="px-4 py-3 text-sm text-right font-medium text-gray-800">
                                {draw.percentComplete !== null ? `${draw.percentComplete}%` : '-'}
                              </td>
                              <td className="px-4 py-3 text-sm text-right font-medium text-gray-800">
                                {formatCurrency(draw.grossAmount)}
                              </td>
                              <td className={`px-4 py-3 text-sm text-right font-medium ${draw.holdbackAmount < 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(Math.abs(draw.holdbackAmount))}
                              </td>
                              <td className="px-4 py-3 text-sm text-right font-bold text-gray-800">
                                {formatCurrency(draw.netPayable)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">🏗️</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Select a Project</h2>
                <p className="text-gray-600">Choose a project from the left to manage progress billing</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProgressBilling;
