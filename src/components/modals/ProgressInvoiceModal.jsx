import React, { useState, useContext } from 'react';
import { QuickBooksContext } from '../../contexts/QuickBooksContext';

const ProgressInvoiceModal = ({ estimate, onClose, onSuccess }) => {
  const { createInvoiceFromEstimate } = useContext(QuickBooksContext);
  const [step, setStep] = useState(1); // 1: Options, 2: Review, 3: Processing
  const [invoiceType, setInvoiceType] = useState('percentage'); // 'percentage' or 'milestone'
  const [percentage, setPercentage] = useState(25);
  const [customPercentage, setCustomPercentage] = useState('');
  const [milestones, setMilestones] = useState([
    { id: 1, name: 'Material Purchase', percentage: 25, selected: false },
    { id: 2, name: 'Work Start', percentage: 35, selected: false },
    { id: 3, name: 'Progress Payment', percentage: 30, selected: false },
    { id: 4, name: 'Final Payment', percentage: 10, selected: false }
  ]);
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [terms, setTerms] = useState('Net 30');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  if (!estimate) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateInvoiceAmount = () => {
    if (invoiceType === 'percentage') {
      const pct = customPercentage ? parseFloat(customPercentage) : percentage;
      return estimate.TotalAmt * (pct / 100);
    } else {
      const selectedMilestones = milestones.filter(m => m.selected);
      const totalPct = selectedMilestones.reduce((sum, m) => sum + m.percentage, 0);
      return estimate.TotalAmt * (totalPct / 100);
    }
  };

  const getSelectedPercentage = () => {
    if (invoiceType === 'percentage') {
      return customPercentage ? parseFloat(customPercentage) : percentage;
    } else {
      const selectedMilestones = milestones.filter(m => m.selected);
      return selectedMilestones.reduce((sum, m) => sum + m.percentage, 0);
    }
  };

  const handleMilestoneToggle = (milestoneId) => {
    setMilestones(prev => prev.map(m => 
      m.id === milestoneId ? { ...m, selected: !m.selected } : m
    ));
  };

  const handleNext = () => {
    if (step === 1) {
      // Validate selection
      if (invoiceType === 'percentage') {
        const pct = customPercentage ? parseFloat(customPercentage) : percentage;
        if (pct <= 0 || pct > 100) {
          setError('Please enter a valid percentage between 1 and 100');
          return;
        }
      } else {
        const selectedMilestones = milestones.filter(m => m.selected);
        if (selectedMilestones.length === 0) {
          setError('Please select at least one milestone');
          return;
        }
      }
      setError(null);
      setStep(2);
    } else if (step === 2) {
      handleCreateInvoice();
    }
  };

  const handleCreateInvoice = async () => {
    setIsProcessing(true);
    setStep(3);
    
    try {
      const invoiceData = {
        estimateId: estimate.Id,
        percentage: getSelectedPercentage(),
        description: description || `Progress Invoice - ${getSelectedPercentage()}% of Estimate ${estimate.DocNumber}`,
        dueDate,
        terms,
        invoiceType,
        milestones: invoiceType === 'milestone' ? milestones.filter(m => m.selected) : null
      };

      const result = await createInvoiceFromEstimate(estimate, invoiceData);
      
      if (result.success) {
        setTimeout(() => {
          onSuccess?.(result);
          onClose();
        }, 2000);
      } else {
        setError(result.message || 'Failed to create invoice');
        setStep(2);
      }
    } catch (err) {
      setError(err.message || 'Failed to create invoice');
      setStep(2);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto m-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create Progress Invoice</h2>
              <p className="text-gray-600">Estimate #{estimate.DocNumber} - {estimate.CustomerRef.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                1
              </div>
              <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                2
              </div>
              <div className={`w-16 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                3
              </div>
            </div>
          </div>

          {/* Step Content */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Estimate Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Total Estimate:</span>
                    <span className="font-bold ml-2">{formatCurrency(estimate.TotalAmt)}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Status:</span>
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {estimate.TxnStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Invoice Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Invoice Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setInvoiceType('percentage')}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      invoiceType === 'percentage' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">Percentage Billing</div>
                    <div className="text-sm text-gray-600">Bill a percentage of the total estimate</div>
                  </button>
                  <button
                    onClick={() => setInvoiceType('milestone')}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      invoiceType === 'milestone' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">Milestone Billing</div>
                    <div className="text-sm text-gray-600">Bill based on project milestones</div>
                  </button>
                </div>
              </div>

              {/* Percentage Options */}
              {invoiceType === 'percentage' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Billing Percentage</label>
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {[25, 50, 75, 100].map((pct) => (
                      <button
                        key={pct}
                        onClick={() => {
                          setPercentage(pct);
                          setCustomPercentage('');
                        }}
                        className={`p-3 border-2 rounded-lg text-center transition-all ${
                          percentage === pct && !customPercentage
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-bold">{pct}%</div>
                        <div className="text-xs text-gray-600">{formatCurrency(estimate.TotalAmt * (pct / 100))}</div>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-700">Custom:</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={customPercentage}
                      onChange={(e) => {
                        setCustomPercentage(e.target.value);
                        setPercentage(0);
                      }}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="25"
                    />
                    <span className="text-sm text-gray-700">%</span>
                    {customPercentage && (
                      <span className="text-sm text-gray-600">
                        = {formatCurrency(estimate.TotalAmt * (parseFloat(customPercentage) / 100))}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Milestone Options */}
              {invoiceType === 'milestone' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Select Milestones</label>
                  <div className="space-y-2">
                    {milestones.map((milestone) => (
                      <label
                        key={milestone.id}
                        className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={milestone.selected}
                          onChange={() => handleMilestoneToggle(milestone.id)}
                          className="mr-3"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{milestone.name}</div>
                          <div className="text-sm text-gray-600">
                            {milestone.percentage}% - {formatCurrency(estimate.TotalAmt * (milestone.percentage / 100))}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {milestones.filter(m => m.selected).length > 0 && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-sm text-green-800">
                        Selected: {getSelectedPercentage()}% - {formatCurrency(calculateInvoiceAmount())}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-sm text-red-800">{error}</div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-4">Invoice Review</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Invoice Amount</div>
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(calculateInvoiceAmount())}</div>
                    <div className="text-sm text-gray-600">{getSelectedPercentage()}% of {formatCurrency(estimate.TotalAmt)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Remaining Balance</div>
                    <div className="text-xl font-semibold text-gray-900">
                      {formatCurrency(estimate.TotalAmt - calculateInvoiceAmount())}
                    </div>
                    <div className="text-sm text-gray-600">{100 - getSelectedPercentage()}% remaining</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder={`Progress Invoice - ${getSelectedPercentage()}% of Estimate ${estimate.DocNumber}`}
                  />
                </div>
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
                    <select
                      value={terms}
                      onChange={(e) => setTerms(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="Net 15">Net 15</option>
                      <option value="Net 30">Net 30</option>
                      <option value="Net 45">Net 45</option>
                      <option value="Due on Receipt">Due on Receipt</option>
                    </select>
                  </div>
                </div>
              </div>

              {invoiceType === 'milestone' && milestones.filter(m => m.selected).length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Selected Milestones</h4>
                  <div className="space-y-2">
                    {milestones.filter(m => m.selected).map((milestone) => (
                      <div key={milestone.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-900">{milestone.name}</span>
                        <span className="text-sm font-medium text-gray-600">
                          {milestone.percentage}% - {formatCurrency(estimate.TotalAmt * (milestone.percentage / 100))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-sm text-red-800">{error}</div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-8">
              {isProcessing ? (
                <div>
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Creating Invoice...</h3>
                  <p className="text-gray-600">Please wait while we create your progress invoice.</p>
                </div>
              ) : (
                <div>
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Invoice Created Successfully!</h3>
                  <p className="text-gray-600">
                    Progress invoice for {formatCurrency(calculateInvoiceAmount())} has been created and sent to QuickBooks.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Footer Buttons */}
          {step < 3 && (
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={step === 1 ? onClose : () => setStep(1)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                {step === 1 ? 'Cancel' : 'Back'}
              </button>
              <button
                onClick={handleNext}
                disabled={isProcessing}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {step === 1 ? 'Next' : 'Create Invoice'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressInvoiceModal;