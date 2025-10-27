/**
 * 🧾 Construction Progress Invoice PDF Generator
 * Creates professional PDF invoices with holdback tracking
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Generate a progress billing invoice PDF
 */
export function generateProgressInvoicePdf(invoiceData) {
  const {
    project,
    draw,
    calculation,
    companyInfo = {}
  } = invoiceData;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;

  // Company logo/header area
  let yPos = margin;

  // Company Name
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(companyInfo.name || 'TAYLOR CONSTRUCTION', margin, yPos);
  yPos += 10;

  // Company details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (companyInfo.address) {
    doc.text(companyInfo.address, margin, yPos);
    yPos += 5;
  }
  if (companyInfo.phone) {
    doc.text(`Phone: ${companyInfo.phone}`, margin, yPos);
    yPos += 5;
  }
  if (companyInfo.email) {
    doc.text(`Email: ${companyInfo.email}`, margin, yPos);
    yPos += 5;
  }

  // Invoice title
  yPos = margin;
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('PROGRESS INVOICE', pageWidth - margin, yPos, { align: 'right' });
  yPos += 10;

  // Invoice details (right side)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice #: ${draw.invoiceNumber}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 5;
  doc.text(`Date: ${new Date(draw.date).toLocaleDateString()}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 5;
  doc.text(`Draw #: ${draw.drawNumber}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 5;
  doc.text(`% Complete: ${draw.percentComplete}%`, pageWidth - margin, yPos, { align: 'right' });
  
  // Horizontal line
  yPos += 10;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 15;

  // Bill To section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO:', margin, yPos);
  yPos += 7;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(project.clientName, margin, yPos);
  yPos += 6;
  
  if (project.customerRef) {
    doc.setFontSize(10);
    doc.text(`Job #: ${project.customerRef}`, margin, yPos);
    yPos += 6;
  }

  // Project details (right side)
  let projectYPos = yPos - 13;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PROJECT:', pageWidth - margin - 60, projectYPos);
  projectYPos += 7;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(project.estimateName, pageWidth - margin - 60, projectYPos);
  projectYPos += 6;

  doc.setFontSize(10);
  doc.text(`Original Estimate: $${project.estimateTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
    pageWidth - margin - 60, projectYPos);

  yPos += 15;

  // Progress Summary Table
  doc.autoTable({
    startY: yPos,
    head: [['PROGRESS SUMMARY', 'AMOUNT']],
    body: [
      ['Original Contract Amount', `$${project.estimateTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
      ['Previously Invoiced', `$${calculation.previouslyInvoiced.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
      ['Current Progress (' + draw.percentComplete + '%)', `$${calculation.totalToDate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
      ['This Invoice (Gross)', `$${draw.grossAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185], fontSize: 11, fontStyle: 'bold' },
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { cellWidth: 'auto', halign: 'right', fontStyle: 'bold' }
    }
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // Holdback Calculation Table
  doc.autoTable({
    startY: yPos,
    head: [['HOLDBACK CALCULATION', 'AMOUNT']],
    body: [
      [`Holdback (${project.holdbackPercent}%)`, `$${draw.holdbackAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
      ['Total Holdback Retained to Date', `$${calculation.totalHoldbackRetained.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ],
    theme: 'plain',
    headStyles: { fillColor: [231, 76, 60], fontSize: 11, fontStyle: 'bold', textColor: 255 },
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { cellWidth: 'auto', halign: 'right', fontStyle: 'bold' }
    }
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // Amount Due
  doc.setFillColor(46, 204, 113);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 20, 'F');
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('AMOUNT DUE THIS INVOICE:', margin + 5, yPos + 13);
  doc.text(
    `$${draw.netPayable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    pageWidth - margin - 5,
    yPos + 13,
    { align: 'right' }
  );
  doc.setTextColor(0, 0, 0);

  yPos += 30;

  // Remaining Balance
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Remaining to Bill: $${calculation.remainingToBill.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
    margin, yPos);

  // Notes section (if any)
  if (draw.notes) {
    yPos += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('NOTES:', margin, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    
    const splitNotes = doc.splitTextToSize(draw.notes, pageWidth - 2 * margin);
    doc.text(splitNotes, margin, yPos);
    yPos += splitNotes.length * 5;
  }

  // Footer
  yPos = pageHeight - 40;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text('Payment Terms: Net 30 days from invoice date', margin, yPos);
  yPos += 5;
  doc.text('Holdback to be released upon substantial completion per contract terms', margin, yPos);
  yPos += 5;
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPos);

  return doc;
}

/**
 * Generate and download progress invoice PDF
 */
export function downloadProgressInvoicePdf(invoiceData, customFilename = null) {
  const doc = generateProgressInvoicePdf(invoiceData);
  const { project, draw } = invoiceData;

  // Generate filename using your custom format
  // Format: {{% Inv}}_Invoice_{{Invoice Number}}_{{Bill To}}_{{Amt Invoiced}}_{{Cust Ref}}.pdf
  const filename = customFilename || 
    `${draw.percentComplete}%_Invoice_${draw.invoiceNumber}_${project.clientName.replace(/[^a-z0-9]/gi, '_')}_$${draw.netPayable.toFixed(2)}_${project.customerRef}.pdf`;

  doc.save(filename);
  
  return {
    filename,
    success: true,
    message: `Invoice ${draw.invoiceNumber} downloaded successfully`
  };
}

/**
 * Generate holdback release invoice PDF
 */
export function generateHoldbackReleasePdf(invoiceData) {
  const {
    project,
    draw,
    remainingHoldback
  } = invoiceData;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;

  let yPos = margin;

  // Company Name
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('TAYLOR CONSTRUCTION', margin, yPos);
  yPos += 15;

  // Invoice title
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('HOLDBACK RELEASE', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Invoice details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice #: ${draw.invoiceNumber}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 5;
  doc.text(`Date: ${new Date(draw.date).toLocaleDateString()}`, pageWidth - margin, yPos, { align: 'right' });
  
  yPos += 10;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 15;

  // Bill To section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO:', margin, yPos);
  yPos += 7;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(project.clientName, margin, yPos);
  yPos += 6;
  
  if (project.customerRef) {
    doc.setFontSize(10);
    doc.text(`Job #: ${project.customerRef}`, margin, yPos);
    yPos += 6;
  }

  doc.text(`Project: ${project.estimateName}`, margin, yPos);
  yPos += 15;

  // Holdback Summary Table
  doc.autoTable({
    startY: yPos,
    head: [['HOLDBACK SUMMARY', 'AMOUNT']],
    body: [
      ['Total Holdback Retained', `$${project.totalHoldback.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
      ['Previously Released', `$${(project.holdbackReleased - draw.netPayable).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
      ['This Release', `$${draw.netPayable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
      ['Remaining Holdback', `$${remainingHoldback.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [46, 204, 113], fontSize: 11, fontStyle: 'bold' },
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { cellWidth: 'auto', halign: 'right', fontStyle: 'bold' }
    }
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // Amount Due
  doc.setFillColor(46, 204, 113);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 20, 'F');
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('AMOUNT DUE:', margin + 5, yPos + 13);
  doc.text(
    `$${draw.netPayable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    pageWidth - margin - 5,
    yPos + 13,
    { align: 'right' }
  );
  doc.setTextColor(0, 0, 0);

  yPos += 30;

  // Notes
  if (draw.notes) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('NOTES:', margin, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    
    const splitNotes = doc.splitTextToSize(draw.notes, pageWidth - 2 * margin);
    doc.text(splitNotes, margin, yPos);
  }

  return doc;
}

/**
 * Download holdback release PDF
 */
export function downloadHoldbackReleasePdf(invoiceData, customFilename = null) {
  const doc = generateHoldbackReleasePdf(invoiceData);
  const { project, draw } = invoiceData;

  const filename = customFilename || 
    `Holdback_Release_${draw.invoiceNumber}_${project.clientName.replace(/[^a-z0-9]/gi, '_')}_$${draw.netPayable.toFixed(2)}.pdf`;

  doc.save(filename);
  
  return {
    filename,
    success: true,
    message: `Holdback release invoice downloaded successfully`
  };
}
