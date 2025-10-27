import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const hexColorToRgb = (hex) => {
  if (Array.isArray(hex) && hex.length === 3) {
    return hex;
  }

  if (typeof hex !== 'string') {
    return [23, 37, 84]; // Slate-900
  }

  const cleaned = hex.replace('#', '');
  if (cleaned.length !== 6) {
    return [23, 37, 84];
  }

  const bigint = parseInt(cleaned, 16);
  return [
    (bigint >> 16) & 255,
    (bigint >> 8) & 255,
    bigint & 255,
  ];
};

const formatCurrency = (amount, currencyCode = 'USD') => {
  const safeAmount = Number.isFinite(Number(amount)) ? Number(amount) : 0;

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode || 'USD',
    }).format(safeAmount);
  } catch (err) {
    return `$${safeAmount.toFixed(2)}`;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';

  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (err) {
    return dateString;
  }
};

const formatAddress = (address) => {
  if (!address) return [];

  const lines = [
    address.Line1,
    address.Line2,
    address.Line3,
    address.Line4,
    address.Line5,
  ].filter(Boolean);

  const cityStateZip = [
    address.City,
    address.Region || address.State,
    address.PostalCode,
  ]
    .filter(Boolean)
    .join(', ');

  if (cityStateZip) {
    lines.push(cityStateZip);
  }

  if (address.Country) {
    lines.push(address.Country);
  }

  return lines;
};

const buildSummaryRows = (estimate) => {
  const lines = Array.isArray(estimate?.Line) ? estimate.Line : [];

  const itemLines = lines.filter((line) => line.DetailType === 'SalesItemLineDetail');
  const subtotal = itemLines.reduce((sum, line) => sum + Number(line.Amount || 0), 0);

  const discountLines = lines.filter((line) => line.DetailType === 'DiscountLineDetail');
  const discounts = discountLines.reduce((sum, line) => sum + Number(line.Amount || 0), 0);

  const taxTotal = Number(estimate?.TxnTaxDetail?.TotalTax || 0);
  const total = Number(estimate?.TotalAmt || subtotal + taxTotal - discounts);

  const summaryRows = [
    { label: 'Subtotal', value: subtotal, emphasis: false, show: true },
    { label: 'Discounts', value: discounts, emphasis: false, show: discounts !== 0 },
    { label: 'Tax', value: taxTotal, emphasis: false, show: taxTotal !== 0 },
    { label: 'Total Due', value: total, emphasis: true, show: true },
  ];

  return summaryRows;
};

export const generateEstimatePdf = (estimate, options = {}) => {
  if (!estimate) {
    console.warn('generateEstimatePdf called without an estimate payload');
    return null;
  }

  const {
    branding = {},
    company = {},
    filenamePrefix = 'Estimate',
    includeSignatureBlock = true,
    openInNewTab = false,
  } = options;

  const accentColor = hexColorToRgb(branding.accentColor || '#1d4ed8');
  const lightAccent = accentColor.map((value) => Math.min(value + 140, 255));

  const defaultCompany = {
    name: company.name || process.env.REACT_APP_COMPANY_NAME || 'Custom Estimate',
    tagline: company.tagline || process.env.REACT_APP_COMPANY_TAGLINE || '',
    address:
      company.address ||
      [
        process.env.REACT_APP_COMPANY_ADDRESS_LINE1,
        process.env.REACT_APP_COMPANY_ADDRESS_LINE2,
        process.env.REACT_APP_COMPANY_ADDRESS_LINE3,
      ].filter(Boolean),
    phone: company.phone || process.env.REACT_APP_COMPANY_PHONE || '',
    email: company.email || process.env.REACT_APP_COMPANY_EMAIL || '',
    website: company.website || process.env.REACT_APP_COMPANY_WEBSITE || '',
  };

  const currencyCode = estimate.CurrencyRef?.value || 'USD';

  const doc = new jsPDF({
    unit: 'pt',
    format: 'letter',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;

  let cursorY = margin;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(...accentColor);
  doc.text('Estimate', pageWidth - margin, cursorY, { align: 'right' });

  doc.setFontSize(14);
  doc.setTextColor(33, 33, 33);
  doc.text(`Estimate #: ${estimate.DocNumber || estimate.Id || 'N/A'}`, pageWidth - margin, cursorY + 24, {
    align: 'right',
  });
  doc.text(`Date: ${formatDate(estimate.TxnDate)}`, pageWidth - margin, cursorY + 42, {
    align: 'right',
  });
  if (estimate?.TxnStatus) {
    doc.text(`Status: ${estimate.TxnStatus}`, pageWidth - margin, cursorY + 60, { align: 'right' });
  }
  if (estimate?.ClassRef?.name) {
    doc.text(`Project: ${estimate.ClassRef.name}`, pageWidth - margin, cursorY + 78, { align: 'right' });
  }

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text(defaultCompany.name, margin, cursorY);

  cursorY += 24;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  if (defaultCompany.tagline) {
    doc.text(defaultCompany.tagline, margin, cursorY);
    cursorY += 16;
  }

  const contactLines = [
    ...(Array.isArray(defaultCompany.address) ? defaultCompany.address : []),
    defaultCompany.phone ? `Phone: ${defaultCompany.phone}` : null,
    defaultCompany.email ? `Email: ${defaultCompany.email}` : null,
    defaultCompany.website ? defaultCompany.website : null,
  ].filter(Boolean);

  contactLines.forEach((line) => {
    doc.text(line, margin, cursorY);
    cursorY += 14;
  });

  cursorY += 10;

  // Customer information block
  doc.setDrawColor(...lightAccent);
  doc.roundedRect(margin, cursorY, pageWidth - margin * 2, 110, 6, 6, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...accentColor);
  doc.text('Bill To', margin + 16, cursorY + 24);
  doc.text('Ship To', pageWidth / 2 + 16, cursorY + 24);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(55, 65, 81);

  const billToLines = [
    estimate.CustomerRef?.name,
    ...formatAddress(estimate.BillAddr),
  ].filter(Boolean);

  const shipToLines = [
    estimate.CustomerRef?.name,
    ...formatAddress(estimate.ShipAddr),
  ].filter(Boolean);

  if (billToLines.length === 0) {
    billToLines.push('No billing address on file');
  }

  if (shipToLines.length === 0) {
    shipToLines.push('No shipping address on file');
  }

  const customerDetailsYStart = cursorY + 44;
  billToLines.forEach((line, index) => {
    doc.text(line, margin + 16, customerDetailsYStart + index * 14);
  });

  shipToLines.forEach((line, index) => {
    doc.text(line, pageWidth / 2 + 16, customerDetailsYStart + index * 14);
  });

  const memoLines = [];
  if (estimate.CustomerMemo?.value) {
    memoLines.push(`Customer Memo: ${estimate.CustomerMemo.value}`);
  }
  if (estimate.PrivateNote) {
    memoLines.push(`Internal Note: ${estimate.PrivateNote}`);
  }

  if (memoLines.length) {
    const memoY = customerDetailsYStart + Math.max(billToLines.length, shipToLines.length) * 14 + 20;
    const memoText = doc.splitTextToSize(memoLines.join(' | '), pageWidth - margin * 2 - 32);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(75, 85, 99);
    doc.text(memoText, margin + 16, memoY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(55, 65, 81);
  }

  cursorY += 130;

  // Line items table
  const lineItems = Array.isArray(estimate.Line)
    ? estimate.Line.filter((line) => line.DetailType === 'SalesItemLineDetail' || line.DetailType === 'DescriptionOnly')
    : [];

  const tableRows = lineItems.map((line, index) => {
    const itemName = line.SalesItemLineDetail?.ItemRef?.name || line.Description || `Line ${index + 1}`;
    const description = line.Description || line.SalesItemLineDetail?.ItemRef?.name || '';
    const quantity = line.SalesItemLineDetail?.Qty ?? '';
    const unitPrice = line.SalesItemLineDetail?.UnitPrice ?? '';
    const amount = line.Amount ?? 0;

    return [
      itemName,
      description,
      quantity !== '' ? quantity : '',
      unitPrice !== '' ? formatCurrency(unitPrice, currencyCode) : '',
      formatCurrency(amount, currencyCode),
    ];
  });

  if (tableRows.length === 0) {
    tableRows.push(['—', 'No line items found on this estimate', '', '', '']);
  }

  autoTable(doc, {
    startY: cursorY,
    head: [['Item', 'Description', 'Qty', 'Unit Cost', 'Amount']],
    body: tableRows,
    styles: {
      font: 'helvetica',
      fontSize: 10,
      textColor: [55, 65, 81],
      cellPadding: 8,
    },
    headStyles: {
      fillColor: accentColor,
      textColor: [255, 255, 255],
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: lightAccent,
    },
    columnStyles: {
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
    },
    margin: { left: margin, right: margin },
    theme: 'grid',
  });

  const tableEndY = doc.lastAutoTable?.finalY || cursorY;

  // Summary box
  const summaryRows = buildSummaryRows(estimate);
  let summaryY = tableEndY + 24;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...accentColor);
  doc.text('Summary', pageWidth - margin, summaryY, { align: 'right' });

  summaryY += 12;
  doc.setLineWidth(0.5);
  doc.setDrawColor(...lightAccent);

  summaryRows
    .filter((row) => row.show)
    .forEach((row) => {
      summaryY += 18;
      doc.setDrawColor(...lightAccent);
      doc.line(pageWidth - 220, summaryY - 12, pageWidth - margin, summaryY - 12);

      doc.setFont('helvetica', row.emphasis ? 'bold' : 'normal');
      doc.setFontSize(row.emphasis ? 12 : 11);
      doc.setTextColor(row.emphasis ? 17 : 55, row.emphasis ? 24 : 65, row.emphasis ? 39 : 81);

      doc.text(row.label, pageWidth - 220, summaryY);
      doc.text(formatCurrency(row.value, currencyCode), pageWidth - margin, summaryY, { align: 'right' });
    });

  summaryY += 24;

  // Notes section
  const combinedNotes = [
    estimate.PrivateNote ? `Internal Notes: ${estimate.PrivateNote}` : null,
    estimate.CustomerMemo?.value ? `Customer Notes: ${estimate.CustomerMemo.value}` : null,
  ].filter(Boolean);

  if (combinedNotes.length > 0) {
    const notesY = summaryY + 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...accentColor);
    doc.text('Notes', margin, notesY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);

    const wrappedNotes = doc.splitTextToSize(combinedNotes.join('\n'), pageWidth - margin * 2);
    doc.text(wrappedNotes, margin, notesY + 18);
    summaryY = notesY + 18 + wrappedNotes.length * 12;
  }

  // Signature block
  if (includeSignatureBlock) {
    const signatureY = Math.max(summaryY + 24, pageHeight - 120);

    doc.setDrawColor(...lightAccent);
    doc.line(margin, signatureY, margin + 220, signatureY);
    doc.line(pageWidth - margin - 220, signatureY, pageWidth - margin, signatureY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    doc.text('Customer Signature', margin, signatureY + 14);
    doc.text('Company Representative', pageWidth - margin - 220, signatureY + 14);
  }

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(120, 127, 139);
  const generatedText = `Generated on ${new Date().toLocaleString()}`;
  doc.text(generatedText, margin, pageHeight - 24);
  doc.text('QuickBooks Integration Dashboard', pageWidth - margin, pageHeight - 24, {
    align: 'right',
  });

  const filename = `${filenamePrefix}_${estimate.DocNumber || estimate.Id || Date.now()}.pdf`;

  if (openInNewTab) {
    doc.output('dataurlnewwindow');
  } else {
    doc.save(filename);
  }

  return doc;
};

export default generateEstimatePdf;
