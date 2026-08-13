/*******************************************************
 * File: views/customers.js — Customer Management
 * Complete customer profiles, service history, payment
 * details. (Documents & communication live in their own
 * linked modules: Documents, FollowUps, Invoices.)
 *******************************************************/
function renderCustomersView(container) {
  renderCrudView(container, {
    module: 'Customers',
    title: 'Customer Management',
    singular: 'Customer',
    icon: 'bi-people-fill',
    idField: 'CustomerID',
    searchFields: ['Name', 'Phone', 'Email', 'CompanyName', 'GSTNumber'],
    filters: [{ field: 'Status', label: 'Status', options: ['Active', 'Inactive'] }],
    columns: [
      { field: 'CustomerID', label: 'ID' },
      { field: 'Name', label: 'Name' },
      { field: 'CompanyName', label: 'Company' },
      { field: 'Phone', label: 'Phone' },
      { field: 'ServicesAvailed', label: 'Services Availed' },
      { field: 'TotalDue', label: 'Due', render: r => Utils.formatMoney(r.TotalDue) },
      { field: 'Status', label: 'Status', render: r => UI.badge(r.Status, UI.statusBadgeClass(r.Status)) }
    ],
    formFields: [
      { name: 'Name', label: 'Customer Name', required: true, col: 6 },
      { name: 'Phone', label: 'Phone Number', required: true, col: 6 },
      { name: 'Email', label: 'Email', type: 'email', col: 6 },
      { name: 'CompanyName', label: 'Company Name', col: 6 },
      { name: 'Address', label: 'Address', type: 'textarea', col: 12 },
      { name: 'GSTNumber', label: 'GST Number', col: 6 },
      { name: 'PANNumber', label: 'PAN Number', col: 6 },
      { name: 'ServicesAvailed', label: 'Services Availed', col: 12 },
      { name: 'TotalPaid', label: 'Total Paid (₹)', type: 'number', col: 6 },
      { name: 'TotalDue', label: 'Total Due (₹)', type: 'number', col: 6 },
      { name: 'Status', label: 'Status', type: 'select', options: ['Active', 'Inactive'], required: true, col: 6 },
      { name: 'Notes', label: 'Communication / Notes', type: 'textarea', col: 12 }
    ]
  });
}
