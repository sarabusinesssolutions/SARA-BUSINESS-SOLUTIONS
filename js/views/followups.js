/*******************************************************
 * File: views/followups.js — Follow-up Tracking
 * Logs every call/email/visit made with a lead or
 * customer and schedules the next follow-up.
 *******************************************************/
function renderFollowUpsView(container) {
  renderCrudView(container, {
    module: 'FollowUps',
    title: 'Follow-up Tracking',
    singular: 'Follow-up',
    icon: 'bi-telephone-outbound-fill',
    idField: 'FollowUpID',
    searchFields: ['LeadOrCustomerID', 'Notes', 'HandledBy'],
    filters: [{ field: 'Type', label: 'Type', options: ['Call', 'Email', 'WhatsApp', 'Meeting', 'Site Visit'] }],
    columns: [
      { field: 'FollowUpID', label: 'ID' },
      { field: 'LeadOrCustomerID', label: 'Lead/Customer ID' },
      { field: 'Type', label: 'Type', render: r => UI.badge(r.Type, 'bg-primary') },
      { field: 'FollowUpDate', label: 'Date' },
      { field: 'Outcome', label: 'Outcome' },
      { field: 'NextFollowUpDate', label: 'Next Follow-up' },
      { field: 'HandledBy', label: 'Handled By' }
    ],
    formFields: [
      { name: 'LeadOrCustomerID', label: 'Lead / Customer ID', required: true, col: 6 },
      { name: 'Type', label: 'Follow-up Type', type: 'select', options: ['Call', 'Email', 'WhatsApp', 'Meeting', 'Site Visit'], required: true, col: 6 },
      { name: 'FollowUpDate', label: 'Follow-up Date', type: 'date', required: true, col: 6 },
      { name: 'NextFollowUpDate', label: 'Next Follow-up Date', type: 'date', col: 6 },
      { name: 'Outcome', label: 'Outcome', type: 'select', options: ['Interested', 'Not Interested', 'Call Back Later', 'Converted', 'No Response'], col: 6 },
      { name: 'HandledBy', label: 'Handled By', required: true, col: 6 },
      { name: 'Notes', label: 'Notes', type: 'textarea', col: 12 }
    ]
  });
}
