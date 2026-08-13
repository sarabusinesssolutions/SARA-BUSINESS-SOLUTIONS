/*******************************************************
 * File: views/invoices.js — Invoice Management
 *******************************************************/
function renderInvoicesView(container) {
  renderCrudView(container, {
    module: 'Invoices',
    title: 'Invoice Management',
    singular: 'Invoice',
    icon: 'bi-receipt',
    idField: 'InvoiceID',
    searchFields: ['CustomerName', 'ServiceName', 'InvoiceID'],
    filters: [{ field: 'PaymentStatus', label: 'Payment Status', options: CONFIG.PAYMENT_STATUSES }],
    columns: [
      { field: 'InvoiceID', label: 'Invoice #' },
      { field: 'CustomerName', label: 'Customer' },
      { field: 'ServiceName', label: 'Service' },
      { field: 'TotalAmount', label: 'Total', render: r => Utils.formatMoney(r.TotalAmount) },
      { field: 'PaidAmount', label: 'Paid', render: r => Utils.formatMoney(r.PaidAmount) },
      { field: 'BalanceAmount', label: 'Balance', render: r => Utils.formatMoney(r.BalanceAmount) },
      { field: 'PaymentStatus', label: 'Status', render: r => UI.badge(r.PaymentStatus, UI.statusBadgeClass(r.PaymentStatus)) },
      { field: 'InvoiceDate', label: 'Date' }
    ],
    formFields: [
      { name: 'CustomerID', label: 'Customer ID', required: true, col: 6 },
      { name: 'CustomerName', label: 'Customer Name', required: true, col: 6 },
      { name: 'ServiceID', label: 'Service ID', col: 6 },
      { name: 'ServiceName', label: 'Service Name', required: true, col: 6 },
      { name: 'Amount', label: 'Amount (₹)', type: 'number', required: true, col: 4 },
      { name: 'TaxAmount', label: 'Tax Amount (₹)', type: 'number', default: 0, col: 4 },
      { name: 'PaidAmount', label: 'Paid Amount (₹)', type: 'number', default: 0, col: 4 },
      { name: 'PaymentMode', label: 'Payment Mode', type: 'select', options: CONFIG.PAYMENT_MODES, col: 6 },
      { name: 'InvoiceDate', label: 'Invoice Date', type: 'date', required: true, col: 6 },
      { name: 'DueDate', label: 'Due Date', type: 'date', col: 6 }
    ],
    beforeSave(data) {
      const amount = Number(data.Amount) || 0;
      const tax = Number(data.TaxAmount) || 0;
      const paid = Number(data.PaidAmount) || 0;
      const total = amount + tax;
      const balance = Math.max(total - paid, 0);
      let status = 'Unpaid';
      if (paid >= total && total > 0) status = 'Paid';
      else if (paid > 0) status = 'Partially Paid';
      if (data.DueDate && Utils.daysBetween(data.DueDate) < 0 && status !== 'Paid') status = 'Overdue';
      return { TotalAmount: total, BalanceAmount: balance, PaymentStatus: status };
    }
  });
}
