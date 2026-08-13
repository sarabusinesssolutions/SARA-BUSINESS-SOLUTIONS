/*******************************************************
 * File: sidebar.js
 * Purpose: Builds the left navigation menu according to
 *          the logged-in user's role/permissions and
 *          wires up the topbar (user info, logout).
 *******************************************************/

const NAV_ITEMS = [
  { module: 'Dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
  { module: 'Leads', label: 'Lead Management', icon: 'bi-person-lines-fill' },
  { module: 'Customers', label: 'Customer Management', icon: 'bi-people-fill' },
  { module: 'Services', label: 'Service Management', icon: 'bi-briefcase-fill' },
  { module: 'Employees', label: 'Employee Management', icon: 'bi-person-badge-fill' },
  { module: 'Tasks', label: 'Task Management', icon: 'bi-list-check' },
  { module: 'FollowUps', label: 'Follow-up Tracking', icon: 'bi-telephone-outbound-fill' },
  { module: 'Invoices', label: 'Invoice Management', icon: 'bi-receipt' },
  { module: 'Documents', label: 'Document Management', icon: 'bi-folder2-open' },
  { module: 'Reports', label: 'Reports', icon: 'bi-bar-chart-line-fill' }
];

const ADMIN_NAV_ITEMS = [
  { module: 'ComplianceRecords', label: 'Compliance & Document Vault', icon: 'bi-shield-lock-fill' },
  { module: 'Admin', label: 'Admin Controls', icon: 'bi-gear-fill' }
];

function buildSidebar(activeModule) {
  Auth.requireLogin();
  const session = Auth.getSession();
  const nav = document.getElementById('sidebar-nav');
  if (!nav) return;

  let html = '';
  NAV_ITEMS.forEach(item => {
    if (!Auth.canAccess(item.module)) return;
    html += navLink(item, activeModule);
  });

  if (Auth.isAdmin()) {
    html += `<div class="nav-section-title">Admin Only</div>`;
    ADMIN_NAV_ITEMS.forEach(item => { html += navLink(item, activeModule); });
  }

  nav.innerHTML = html;

  const userLabel = document.getElementById('topbar-user');
  if (userLabel) userLabel.textContent = `${session.user.FullName} (${session.user.Role})`;

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.onclick = () => Auth.logout();

  const toggleBtn = document.getElementById('sidebar-toggle');
  if (toggleBtn) toggleBtn.onclick = () => document.getElementById('sidebar').classList.toggle('show');
}

function navLink(item, activeModule) {
  const active = item.module === activeModule ? 'active' : '';
  return `<a class="nav-link ${active}" href="app.html#${item.module}">
    <i class="bi ${item.icon}"></i> <span>${item.label}</span>
  </a>`;
}
