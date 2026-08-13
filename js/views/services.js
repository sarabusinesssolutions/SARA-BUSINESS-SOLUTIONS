/*******************************************************
 * File: views/services.js — Service Management
 * Government/RTO/GST/MSME/PF/ESIC/FSSAI/Passport/IT/
 * Web Dev/Digital Marketing/Software Dev/Manpower etc.
 *******************************************************/
function renderServicesView(container) {
  renderCrudView(container, {
    module: 'Services',
    title: 'Service Management',
    singular: 'Service',
    icon: 'bi-briefcase-fill',
    idField: 'ServiceID',
    searchFields: ['ServiceName', 'Category', 'Description'],
    filters: [
      { field: 'Category', label: 'Category', options: CONFIG.SERVICE_CATEGORIES },
      { field: 'Status', label: 'Status', options: ['Active', 'Inactive'] }
    ],
    columns: [
      { field: 'ServiceID', label: 'ID' },
      { field: 'ServiceName', label: 'Service Name' },
      { field: 'Category', label: 'Category', render: r => UI.badge(r.Category, 'bg-primary') },
      { field: 'Price', label: 'Price', render: r => r.Price ? Utils.formatMoney(r.Price) : '-' },
      { field: 'DurationDays', label: 'Duration (days)' },
      { field: 'Status', label: 'Status', render: r => UI.badge(r.Status, UI.statusBadgeClass(r.Status)) }
    ],
    formFields: [
      { name: 'ServiceName', label: 'Service Name', required: true, col: 8 },
      { name: 'Category', label: 'Category', type: 'select', options: CONFIG.SERVICE_CATEGORIES, required: true, col: 4 },
      { name: 'Price', label: 'Price (₹)', type: 'number', col: 6 },
      { name: 'DurationDays', label: 'Typical Duration (days)', type: 'number', col: 6 },
      { name: 'Status', label: 'Status', type: 'select', options: ['Active', 'Inactive'], required: true, col: 6 },
      { name: 'Description', label: 'Description', type: 'textarea', col: 12 }
    ]
  });
}
