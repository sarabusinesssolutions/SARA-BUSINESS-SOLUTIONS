/*******************************************************
 * File: views/tasks.js — Task Management
 *******************************************************/
function renderTasksView(container) {
  renderCrudView(container, {
    module: 'Tasks',
    title: 'Task Management',
    singular: 'Task',
    icon: 'bi-list-check',
    idField: 'TaskID',
    searchFields: ['Title', 'Description', 'AssignedTo'],
    filters: [
      { field: 'Priority', label: 'Priority', options: CONFIG.TASK_PRIORITIES },
      { field: 'Status', label: 'Status', options: CONFIG.TASK_STATUSES }
    ],
    columns: [
      { field: 'TaskID', label: 'ID' },
      { field: 'Title', label: 'Title' },
      { field: 'Module', label: 'Related Module' },
      { field: 'AssignedTo', label: 'Assigned To' },
      { field: 'Priority', label: 'Priority', render: r => UI.badge(r.Priority, r.Priority === 'Urgent' ? 'bg-danger' : r.Priority === 'High' ? 'bg-warning text-dark' : 'bg-secondary') },
      { field: 'DueDate', label: 'Due Date' },
      { field: 'Status', label: 'Status', render: r => UI.badge(r.Status, UI.statusBadgeClass(r.Status)) }
    ],
    formFields: [
      { name: 'Title', label: 'Task Title', required: true, col: 8 },
      { name: 'Module', label: 'Related Module', type: 'select', options: ['Leads', 'Customers', 'Services', 'Invoices', 'Documents', 'General'], col: 4 },
      { name: 'AssignedTo', label: 'Assigned To (Employee)', required: true, col: 6 },
      { name: 'Priority', label: 'Priority', type: 'select', options: CONFIG.TASK_PRIORITIES, required: true, col: 6 },
      { name: 'DueDate', label: 'Due Date', type: 'date', required: true, col: 6 },
      { name: 'Status', label: 'Status', type: 'select', options: CONFIG.TASK_STATUSES, required: true, col: 6 },
      { name: 'RelatedRecordID', label: 'Related Record ID (optional)', col: 6 },
      { name: 'Description', label: 'Description', type: 'textarea', col: 12 }
    ]
  });
}
