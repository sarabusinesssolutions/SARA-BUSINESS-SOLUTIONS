/*******************************************************
 * File: views/dashboard.js
 * Central dashboard: lead/customer/service stats,
 * revenue, pending tasks, upcoming follow-ups, and
 * document/compliance renewal alerts.
 *******************************************************/
async function renderDashboardView(container) {
  container.innerHTML = `<div class="empty-state"><div class="spinner-border text-primary"></div></div>`;
  let stats;
  try {
    stats = await Api.dashboardStats();
  } catch (e) {
    container.innerHTML = `<div class="section-card text-danger">Unable to load dashboard data.</div>`;
    return;
  }

  container.innerHTML = `
    <div class="page-header"><h4><i class="bi bi-speedometer2"></i> Dashboard</h4></div>

    <div class="row">
      ${kpi('Total Leads', stats.leads.total, 'bi-person-lines-fill', '')}
      ${kpi('New Leads (Month)', stats.leads.newThisMonth, 'bi-graph-up-arrow', 'success')}
      ${kpi('Total Customers', stats.customers.total, 'bi-people-fill', '')}
      ${kpi('Active Services', stats.services.active, 'bi-briefcase-fill', '')}
      ${kpi('Revenue (Total)', Utils.formatMoney(stats.revenue.total), 'bi-currency-rupee', 'success')}
      ${kpi('Revenue (This Month)', Utils.formatMoney(stats.revenue.thisMonth), 'bi-cash-coin', 'success')}
      ${kpi('Pending Payments', Utils.formatMoney(stats.revenue.pending), 'bi-exclamation-circle', 'warning')}
      ${kpi('Pending Tasks', stats.tasks.pending, 'bi-list-check', stats.tasks.overdue ? 'danger' : 'warning')}
    </div>

    <div class="row mt-2">
      <div class="col-lg-6">
        <div class="section-card">
          <h6><i class="bi bi-pie-chart-fill"></i> Leads by Source</h6>
          ${renderBarList(stats.leads.bySource)}
        </div>
      </div>
      <div class="col-lg-6">
        <div class="section-card">
          <h6><i class="bi bi-flag-fill"></i> Leads by Status</h6>
          ${renderBarList(stats.leads.byStatus)}
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-lg-6">
        <div class="section-card">
          <h6><i class="bi bi-telephone-outbound-fill"></i> Upcoming Follow-ups (7 days)</h6>
          <p class="mb-0">${stats.followUps.upcoming7Days} follow-up(s) scheduled in the next 7 days.</p>
        </div>
        <div class="section-card">
          <h6><i class="bi bi-clock-history"></i> Recent Leads</h6>
          ${renderMiniList(stats.recentLeads, l => `${l.Name} — ${l.Source} <span class="text-muted">(${l.Status})</span>`)}
        </div>
      </div>
      <div class="col-lg-6">
        <div class="section-card">
          <h6><i class="bi bi-shield-lock-fill"></i> Compliance & Document Renewal Alerts</h6>
          <div class="d-flex gap-2 flex-wrap mb-2">
            <span class="badge alert-pill-30 badge-status">Due 30d: ${stats.compliance.within30Count}</span>
            <span class="badge alert-pill-15 badge-status">Due 15d: ${stats.compliance.within15Count}</span>
            <span class="badge alert-pill-7 badge-status">Due 7d: ${stats.compliance.within7Count}</span>
            <span class="badge alert-pill-expired badge-status">Expired: ${stats.compliance.expiredCount}</span>
          </div>
          <p class="mb-0">Overall compliance health: <strong>${stats.compliance.complianceHealthPct}%</strong></p>
          <p class="mb-0 text-muted small">Customer documents expiring within 30 days: ${stats.documents.expiringSoon}</p>
        </div>
        <div class="section-card">
          <h6><i class="bi bi-receipt"></i> Recent Invoices</h6>
          ${renderMiniList(stats.recentInvoices, i => `${i.CustomerName} — ${Utils.formatMoney(i.TotalAmount)} <span class="text-muted">(${i.PaymentStatus})</span>`)}
        </div>
      </div>
    </div>
  `;

  function kpi(label, value, icon, tone) {
    return `<div class="col-6 col-md-3 mb-3"><div class="kpi-card ${tone}">
      <div class="d-flex justify-content-between align-items-start">
        <div><div class="kpi-value">${value}</div><div class="kpi-label">${label}</div></div>
        <i class="bi ${icon} fs-3 text-muted"></i>
      </div></div></div>`;
  }

  function renderBarList(obj) {
    const entries = Object.entries(obj || {});
    if (!entries.length) return '<p class="text-muted mb-0">No data yet.</p>';
    const max = Math.max(...entries.map(e => e[1]));
    return entries.map(([label, count]) => `
      <div class="mb-2">
        <div class="d-flex justify-content-between small"><span>${label}</span><span>${count}</span></div>
        <div class="progress" style="height:8px;"><div class="progress-bar bg-primary" style="width:${(count / max) * 100}%"></div></div>
      </div>`).join('');
  }

  function renderMiniList(items, fmt) {
    if (!items || !items.length) return '<p class="text-muted mb-0">Nothing to show yet.</p>';
    return `<ul class="list-unstyled mb-0">${items.map(i => `<li class="border-bottom py-1 small">${fmt(i)}</li>`).join('')}</ul>`;
  }
}
