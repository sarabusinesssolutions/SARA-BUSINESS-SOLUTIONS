/*******************************************************
 * File: router.js
 * Purpose: Simple hash-based SPA router. Reads
 * window.location.hash (#Leads, #Customers, ...) and
 * renders the matching view module into #main-content.
 *******************************************************/

const VIEW_MAP = {
  Dashboard: renderDashboardView,
  Leads: renderLeadsView,
  Customers: renderCustomersView,
  Services: renderServicesView,
  Employees: renderEmployeesView,
  Tasks: renderTasksView,
  FollowUps: renderFollowUpsView,
  Invoices: renderInvoicesView,
  Documents: renderDocumentsView,
  Reports: renderReportsView,
  ComplianceRecords: renderComplianceView,
  Admin: renderAdminView
};

function getCurrentModule() {
  const hash = window.location.hash.replace('#', '');
  return hash || 'Dashboard';
}

function routeTo() {
  const moduleName = getCurrentModule();
  const container = document.getElementById('main-content');

  if (moduleName !== 'Admin' && moduleName !== 'ComplianceRecords' && !Auth.canAccess(moduleName)) {
    container.innerHTML = `<div class="section-card"><p class="text-danger mb-0">Access denied for your role.</p></div>`;
    return;
  }
  if ((moduleName === 'Admin' || moduleName === 'ComplianceRecords') && !Auth.isAdmin()) {
    container.innerHTML = `<div class="section-card"><p class="text-danger mb-0">Access denied. Admins only.</p></div>`;
    return;
  }

  buildSidebar(moduleName);
  const renderFn = VIEW_MAP[moduleName];
  if (!renderFn) {
    container.innerHTML = `<div class="section-card">Module not found.</div>`;
    return;
  }
  document.getElementById('sidebar').classList.remove('show');
  renderFn(container);
}

window.addEventListener('hashchange', routeTo);
window.addEventListener('DOMContentLoaded', () => {
  Auth.requireLogin();
  routeTo();
});
