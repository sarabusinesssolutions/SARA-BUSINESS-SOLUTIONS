/*******************************************************
 * File: views/admin.js — Admin Controls
 * User management (create staff/manager/viewer logins),
 * role permission overview, and audit log viewer.
 *******************************************************/
async function renderAdminView(container) {
  if (!Auth.isAdmin()) {
    container.innerHTML = `<div class="section-card"><p class="text-danger mb-0">Access denied. Admins only.</p></div>`;
    return;
  }

  container.innerHTML = `
    <div class="page-header"><h4><i class="bi bi-gear-fill"></i> Admin Controls</h4></div>
    <ul class="nav nav-tabs mb-3">
      <li class="nav-item"><button class="nav-link active" id="tab-users" data-tab="users">User Management</button></li>
      <li class="nav-item"><button class="nav-link" id="tab-roles" data-tab="roles">Role Permissions</button></li>
      <li class="nav-item"><button class="nav-link" id="tab-audit" data-tab="audit">Audit Log</button></li>
    </ul>
    <div id="admin-tab-content"></div>
  `;

  container.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      showTab(btn.dataset.tab);
    });
  });

  showTab('users');

  function showTab(tab) {
    const holder = document.getElementById('admin-tab-content');
    if (tab === 'users') return renderUsersTab(holder);
    if (tab === 'roles') return renderRolesTab(holder);
    if (tab === 'audit') return renderAuditTab(holder);
  }
}

async function renderUsersTab(holder) {
  holder.innerHTML = `<div class="empty-state"><div class="spinner-border text-primary"></div></div>`;
  const users = await Api.list('Users');
  holder.innerHTML = `
    <div class="table-card">
      <div class="d-flex justify-content-end mb-2"><button class="btn btn-primary btn-sm" id="user-add-btn"><i class="bi bi-person-plus"></i> Add User</button></div>
      ${Utils.renderTable(
        [
          { field: 'UserID', label: 'ID' }, { field: 'FullName', label: 'Name' },
          { field: 'Username', label: 'Username' }, { field: 'Role', label: 'Role', render: r => UI.badge(r.Role, 'bg-primary') },
          { field: 'Email', label: 'Email' },
          { field: 'Status', label: 'Status', render: r => UI.badge(r.Status, UI.statusBadgeClass(r.Status)) }
        ],
        users,
        (row) => `<button class="btn btn-sm btn-outline-primary me-1" data-edit-user="${row.UserID}"><i class="bi bi-pencil"></i></button>
                   <button class="btn btn-sm btn-outline-danger" data-del-user="${row.UserID}"><i class="bi bi-trash"></i></button>`
      )}
    </div>`;

  document.getElementById('user-add-btn').addEventListener('click', () => openUserForm(null));
  holder.querySelectorAll('[data-edit-user]').forEach(btn => btn.addEventListener('click', () => {
    openUserForm(users.find(u => u.UserID === btn.dataset.editUser));
  }));
  holder.querySelectorAll('[data-del-user]').forEach(btn => btn.addEventListener('click', async () => {
    if (!UI.confirm('Delete this user account?')) return;
    UI.showSpinner();
    try { await Api.remove('Users', btn.dataset.delUser); UI.toast('User deleted.', 'success'); renderUsersTab(holder); }
    finally { UI.hideSpinner(); }
  }));
}

function openUserForm(existing) {
  const isEdit = !!existing;
  const v = existing || {};
  const body = `
    <form id="user-form">
      <div class="row">
        <div class="mb-3 col-md-6"><label class="form-label required">Full Name</label><input class="form-control" name="FullName" value="${Utils.escapeHtml(v.FullName)}" required></div>
        <div class="mb-3 col-md-6"><label class="form-label required">Username</label><input class="form-control" name="Username" value="${Utils.escapeHtml(v.Username)}" required ${isEdit ? 'readonly' : ''}></div>
        <div class="mb-3 col-md-6"><label class="form-label ${isEdit ? '' : 'required'}">Password ${isEdit ? '(leave blank to keep current)' : ''}</label><input type="password" class="form-control" name="Password" ${isEdit ? '' : 'required'}></div>
        <div class="mb-3 col-md-6"><label class="form-label required">Role</label>
          <select class="form-select" name="Role" required>${CONFIG.ROLES.map(r => `<option ${r === v.Role ? 'selected' : ''}>${r}</option>`).join('')}</select></div>
        <div class="mb-3 col-md-6"><label class="form-label">Email</label><input type="email" class="form-control" name="Email" value="${Utils.escapeHtml(v.Email)}"></div>
        <div class="mb-3 col-md-6"><label class="form-label">Phone</label><input class="form-control" name="Phone" value="${Utils.escapeHtml(v.Phone)}"></div>
        <div class="mb-3 col-md-6"><label class="form-label">Status</label>
          <select class="form-select" name="Status"><option ${v.Status === 'Active' ? 'selected' : ''}>Active</option><option ${v.Status === 'Inactive' ? 'selected' : ''}>Inactive</option></select></div>
      </div>
    </form>`;
  const footer = `<button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button class="btn btn-primary" id="user-save-btn">${isEdit ? 'Update' : 'Create'}</button>`;
  UI.openModal('userModal', `${isEdit ? 'Edit' : 'Add'} User`, body, footer);

  document.getElementById('user-save-btn').addEventListener('click', async () => {
    const form = document.getElementById('user-form');
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const data = {
      FullName: form.FullName.value, Username: form.Username.value, Role: form.Role.value,
      Email: form.Email.value, Phone: form.Phone.value, Status: form.Status.value
    };
    if (form.Password.value) data.Password = form.Password.value;
    UI.showSpinner();
    try {
      if (isEdit) await Api.update('Users', existing.UserID, data);
      else await Api.create('Users', data);
      UI.toast(`User ${isEdit ? 'updated' : 'created'}.`, 'success');
      UI.closeModal('userModal');
      renderUsersTab(document.getElementById('admin-tab-content'));
    } finally { UI.hideSpinner(); }
  });
}

function renderRolesTab(holder) {
  holder.innerHTML = `
    <div class="table-card">
      <table class="table data-table">
        <thead><tr><th>Role</th><th>Access Level</th></tr></thead>
        <tbody>
          <tr><td><span class="badge bg-primary">SuperAdmin</span></td><td>Full access to every module, including Compliance Vault, Admin Controls, and user management.</td></tr>
          <tr><td><span class="badge bg-primary">Admin</span></td><td>Full access to every module, including Compliance Vault and Admin Controls.</td></tr>
          <tr><td><span class="badge bg-info text-dark">Manager</span></td><td>Leads, Customers, Services, Employees (no delete), Tasks, Follow-ups, Invoices, Documents, Reports.</td></tr>
          <tr><td><span class="badge bg-secondary">Staff</span></td><td>Leads, Customers, Tasks, Follow-ups, Documents (create/edit). Reports read-only.</td></tr>
          <tr><td><span class="badge bg-secondary">Viewer</span></td><td>Dashboard and Reports, read-only.</td></tr>
        </tbody>
      </table>
    </div>`;
}

async function renderAuditTab(holder) {
  holder.innerHTML = `<div class="empty-state"><div class="spinner-border text-primary"></div></div>`;
  const logs = await Api.call({ action: 'auditLog' });
  const sorted = logs.slice().reverse();
  holder.innerHTML = `<div class="table-card">${Utils.renderTable(
    [
      { field: 'Timestamp', label: 'Timestamp' }, { field: 'User', label: 'User' },
      { field: 'Action', label: 'Action' }, { field: 'Module', label: 'Module' },
      { field: 'RecordID', label: 'Record ID' }, { field: 'Details', label: 'Details' }
    ],
    sorted.slice(0, 200)
  )}</div>`;
}
