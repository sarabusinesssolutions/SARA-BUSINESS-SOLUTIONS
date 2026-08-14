/*******************************************************
 * File: views/invoices.js — Invoice Management
 * Customer and Service are picked from live dropdowns
 * (fed by the Customers and Services sheets) instead of
 * free text, so new customers/services show up here
 * automatically as soon as they're created.
 *******************************************************/
async function renderInvoicesView(container) {
  container.innerHTML = `<div class="empty-state"><div class="spinner-border text-primary"></div></div>`;

  let customers = [], services = [];
  try {
    [customers, services] = await Promise.all([Api.list('Customers'), Api.list('Services')]);
  } catch (e) {
    // Api.call already shows a toast on failure
  }

  if (!customers.length) UI.toast('No customers found yet — add a customer first so invoices can be linked to one.', 'warning');
  if (!services.length) UI.toast('No services found yet — add a service first so invoices can be linked to one.', 'warning');

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
      {
        name: 'CustomerID', label: 'Customer', type: 'related-select', required: true, col: 6,
        relatedData: customers,
        optionValue: c => c.CustomerID,
        optionLabel: c => `${c.Name}${c.CompanyName ? ' — ' + c.CompanyName : ''} (${c.Phone})`,
        onSelectFill: { CustomerName: c => c.Name }
      },
      { name: 'CustomerName', type: 'hidden' },
      {
        name: 'ServiceID', label: 'Service', type: 'related-select', required: true, col: 6,
        relatedData: services,
        optionValue: s => s.ServiceID,
        optionLabel: s => `${s.ServiceName} (${s.Category})`,
        onSelectFill: { ServiceName: s => s.ServiceName, Amount: s => s.Price || '' }
      },
      { name: 'ServiceName', type: 'hidden' },
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

