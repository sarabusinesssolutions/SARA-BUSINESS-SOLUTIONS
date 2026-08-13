/*******************************************************
 * File: views/leads.js — Lead Management
 * Tracks leads from Website, Facebook, Instagram,
 * WhatsApp, Google Ads, and Walk-in.
 *******************************************************/
function renderLeadsView(container) {
  renderCrudView(container, {
    module: 'Leads',
    title: 'Lead Management',
    singular: 'Lead',
    icon: 'bi-person-lines-fill',
    idField: 'LeadID',
    searchFields: ['Name', 'Phone', 'Email', 'ServiceInterested'],
    filters: [
      { field: 'Source', label: 'Source', options: CONFIG.LEAD_SOURCES },
      { field: 'Status', label: 'Status', options: CONFIG.LEAD_STATUSES }
    ],
    columns: [
      { field: 'LeadID', label: 'ID' },
      { field: 'Name', label: 'Name' },
      { field: 'Phone', label: 'Phone' },
      { field: 'Source', label: 'Source', render: r => UI.badge(r.Source, 'bg-primary') },
      { field: 'ServiceInterested', label: 'Interested In' },
      { field: 'Status', label: 'Status', render: r => UI.badge(r.Status, UI.statusBadgeClass(r.Status)) },
      { field: 'NextFollowUpDate', label: 'Next Follow-up' },
      { field: 'AssignedTo', label: 'Assigned To' }
    ],
    formFields: [
      { name: 'Name', label: 'Lead Name', required: true, col: 6 },
      { name: 'Phone', label: 'Phone Number', required: true, col: 6 },
      { name: 'Email', label: 'Email', type: 'email', col: 6 },
      { name: 'Source', label: 'Lead Source', type: 'select', options: CONFIG.LEAD_SOURCES, required: true, col: 6 },
      { name: 'ServiceInterested', label: 'Service Interested', col: 6 },
      { name: 'Status', label: 'Status', type: 'select', options: CONFIG.LEAD_STATUSES, required: true, col: 6 },
      { name: 'AssignedTo', label: 'Assigned To (Employee)', col: 6 },
      { name: 'NextFollowUpDate', label: 'Next Follow-up Date', type: 'date', col: 6 },
      { name: 'Notes', label: 'Notes', type: 'textarea', col: 12 }
    ]
  });
}
