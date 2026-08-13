/*******************************************************
 * File: views/employees.js — Employee Management
 *******************************************************/
function renderEmployeesView(container) {
  renderCrudView(container, {
    module: 'Employees',
    title: 'Employee Management',
    singular: 'Employee',
    icon: 'bi-person-badge-fill',
    idField: 'EmployeeID',
    searchFields: ['FullName', 'Designation', 'Department', 'Phone'],
    filters: [{ field: 'Status', label: 'Status', options: ['Active', 'Inactive'] }],
    columns: [
      { field: 'EmployeeID', label: 'ID' },
      { field: 'FullName', label: 'Name' },
      { field: 'Designation', label: 'Designation' },
      { field: 'Department', label: 'Department' },
      { field: 'Phone', label: 'Phone' },
      { field: 'JoiningDate', label: 'Joined' },
      { field: 'Status', label: 'Status', render: r => UI.badge(r.Status, UI.statusBadgeClass(r.Status)) }
    ],
    formFields: [
      { name: 'FullName', label: 'Full Name', required: true, col: 6 },
      { name: 'Designation', label: 'Designation', required: true, col: 6 },
      { name: 'Department', label: 'Department', col: 6 },
      { name: 'Phone', label: 'Phone Number', required: true, col: 6 },
      { name: 'Email', label: 'Email', type: 'email', col: 6 },
      { name: 'JoiningDate', label: 'Joining Date', type: 'date', col: 6 },
      { name: 'Salary', label: 'Salary (₹)', type: 'number', col: 6 },
      { name: 'Status', label: 'Status', type: 'select', options: ['Active', 'Inactive'], required: true, col: 6 },
      { name: 'Address', label: 'Address', type: 'textarea', col: 12 }
    ]
  });
}
