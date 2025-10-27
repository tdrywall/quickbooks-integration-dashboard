/**
 * 🏗️ Construction Progress Billing System
 * Handles draw calculations, holdback tracking, and payment history
 */

export class ProgressBillingManager {
  constructor() {
    this.STORAGE_KEY = 'construction_progress_billing';
    this.drawHistory = this.loadDrawHistory();
  }

  /**
   * Load draw history from localStorage
   */
  loadDrawHistory() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading draw history:', error);
      return {};
    }
  }

  /**
   * Save draw history to localStorage
   */
  saveDrawHistory() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.drawHistory));
    } catch (error) {
      console.error('Error saving draw history:', error);
    }
  }

  /**
   * Get project draw history
   */
  getProjectHistory(estimateId) {
    if (!this.drawHistory[estimateId]) {
      this.drawHistory[estimateId] = {
        estimateId,
        estimateName: '',
        estimateTotal: 0,
        clientName: '',
        customerRef: '',
        holdbackPercent: 10, // Default 10%
        draws: [],
        totalInvoiced: 0,
        totalHoldback: 0,
        holdbackReleased: 0,
        isComplete: false,
        createdAt: new Date().toISOString()
      };
    }
    return this.drawHistory[estimateId];
  }

  /**
   * Initialize project from QuickBooks estimate
   */
  initializeProject(estimate, holdbackPercent = 10) {
    const project = this.getProjectHistory(estimate.Id);
    
    project.estimateName = estimate.CustomerMemo?.value || estimate.DocNumber || `Estimate ${estimate.Id}`;
    project.estimateTotal = parseFloat(estimate.TotalAmt || 0);
    project.clientName = estimate.CustomerRef?.name || 'Unknown Client';
    project.customerRef = estimate.CustomField?.find(f => f.Name === 'Job #')?.StringValue || estimate.DocNumber || '';
    project.holdbackPercent = holdbackPercent;
    
    this.saveDrawHistory();
    return project;
  }

  /**
   * Calculate progress billing amounts
   */
  calculateProgressBilling(estimateId, percentComplete) {
    const project = this.getProjectHistory(estimateId);
    
    if (!project.estimateTotal) {
      throw new Error('Project not initialized. Call initializeProject first.');
    }

    // Ensure percent is between 0-100
    percentComplete = Math.max(0, Math.min(100, percentComplete));

    // Calculate amounts
    const totalToDate = (project.estimateTotal * percentComplete) / 100;
    const previouslyInvoiced = project.totalInvoiced;
    const thisInvoiceGross = totalToDate - previouslyInvoiced;
    const holdbackAmount = (thisInvoiceGross * project.holdbackPercent) / 100;
    const netPayable = thisInvoiceGross - holdbackAmount;
    const remainingToBill = project.estimateTotal - totalToDate;
    const cumulativePercent = percentComplete;

    return {
      percentComplete,
      totalToDate,
      previouslyInvoiced,
      thisInvoiceGross,
      holdbackAmount,
      netPayable,
      remainingToBill,
      cumulativePercent,
      estimateTotal: project.estimateTotal,
      totalHoldbackRetained: project.totalHoldback + holdbackAmount,
      drawNumber: project.draws.length + 1
    };
  }

  /**
   * Create a new draw/invoice
   */
  createDraw(estimateId, percentComplete, invoiceNumber = null, notes = '') {
    const project = this.getProjectHistory(estimateId);
    const calculation = this.calculateProgressBilling(estimateId, percentComplete);

    // Generate invoice number if not provided
    if (!invoiceNumber) {
      invoiceNumber = `${project.customerRef || 'INV'}-${String(calculation.drawNumber).padStart(3, '0')}`;
    }

    // Create draw record
    const draw = {
      drawNumber: calculation.drawNumber,
      invoiceNumber,
      date: new Date().toISOString(),
      percentComplete: calculation.percentComplete,
      grossAmount: calculation.thisInvoiceGross,
      holdbackAmount: calculation.holdbackAmount,
      netPayable: calculation.netPayable,
      cumulativeInvoiced: calculation.totalToDate,
      cumulativePercent: calculation.cumulativePercent,
      remainingToBill: calculation.remainingToBill,
      notes,
      isPaid: false,
      paidDate: null
    };

    // Update project totals
    project.draws.push(draw);
    project.totalInvoiced = calculation.totalToDate;
    project.totalHoldback += calculation.holdbackAmount;

    // Mark as complete if 100%
    if (calculation.percentComplete >= 100) {
      project.isComplete = true;
    }

    this.saveDrawHistory();
    return {
      draw,
      project,
      calculation
    };
  }

  /**
   * Release holdback (partial or full)
   */
  releaseHoldback(estimateId, releaseAmount, invoiceNumber = null, notes = 'Holdback Release') {
    const project = this.getProjectHistory(estimateId);
    
    const availableHoldback = project.totalHoldback - project.holdbackReleased;
    if (releaseAmount > availableHoldback) {
      throw new Error(`Cannot release $${releaseAmount.toFixed(2)}. Only $${availableHoldback.toFixed(2)} available.`);
    }

    // Generate invoice number if not provided
    if (!invoiceNumber) {
      invoiceNumber = `${project.customerRef || 'HB'}-RELEASE-${String(project.draws.length + 1).padStart(3, '0')}`;
    }

    // Create holdback release draw
    const draw = {
      drawNumber: project.draws.length + 1,
      invoiceNumber,
      date: new Date().toISOString(),
      percentComplete: null, // Not a progress draw
      grossAmount: 0,
      holdbackAmount: -releaseAmount, // Negative = release
      netPayable: releaseAmount,
      cumulativeInvoiced: project.totalInvoiced,
      cumulativePercent: (project.totalInvoiced / project.estimateTotal) * 100,
      remainingToBill: project.estimateTotal - project.totalInvoiced,
      notes,
      isPaid: false,
      paidDate: null,
      isHoldbackRelease: true
    };

    project.draws.push(draw);
    project.holdbackReleased += releaseAmount;

    this.saveDrawHistory();
    return {
      draw,
      project,
      remainingHoldback: project.totalHoldback - project.holdbackReleased
    };
  }

  /**
   * Mark draw as paid
   */
  markDrawPaid(estimateId, drawNumber, paidDate = null) {
    const project = this.getProjectHistory(estimateId);
    const draw = project.draws.find(d => d.drawNumber === drawNumber);
    
    if (!draw) {
      throw new Error(`Draw #${drawNumber} not found`);
    }

    draw.isPaid = true;
    draw.paidDate = paidDate || new Date().toISOString();

    this.saveDrawHistory();
    return draw;
  }

  /**
   * Get all projects summary
   */
  getAllProjects() {
    return Object.values(this.drawHistory).map(project => ({
      estimateId: project.estimateId,
      estimateName: project.estimateName,
      clientName: project.clientName,
      customerRef: project.customerRef,
      estimateTotal: project.estimateTotal,
      totalInvoiced: project.totalInvoiced,
      percentComplete: (project.totalInvoiced / project.estimateTotal) * 100,
      totalHoldback: project.totalHoldback,
      holdbackReleased: project.holdbackReleased,
      holdbackRetained: project.totalHoldback - project.holdbackReleased,
      remainingToBill: project.estimateTotal - project.totalInvoiced,
      drawCount: project.draws.length,
      isComplete: project.isComplete,
      lastDrawDate: project.draws.length > 0 ? project.draws[project.draws.length - 1].date : null
    }));
  }

  /**
   * Delete a project and all its draws
   */
  deleteProject(estimateId) {
    delete this.drawHistory[estimateId];
    this.saveDrawHistory();
  }

  /**
   * Export project to JSON
   */
  exportProject(estimateId) {
    const project = this.getProjectHistory(estimateId);
    return JSON.stringify(project, null, 2);
  }

  /**
   * Import project from JSON
   */
  importProject(jsonData) {
    try {
      const project = JSON.parse(jsonData);
      if (!project.estimateId) {
        throw new Error('Invalid project data: missing estimateId');
      }
      this.drawHistory[project.estimateId] = project;
      this.saveDrawHistory();
      return project;
    } catch (error) {
      throw new Error(`Import failed: ${error.message}`);
    }
  }
}

// Singleton instance
export const progressBillingManager = new ProgressBillingManager();
