/*******************************************************
 * File: views/compliance.js
 * Business Compliance & Document Vault (Admin only)
 * MSME, GST, PAN, TAN, PF, ESIC, Prof. Tax, FSSAI,
 * Shop & Establishment, UDYAM, DSC, Trademark, Insurance,
 * Rental/Vendor/Client agreements, Employee docs, Bank
 * details, cheque copies, legal & property documents.
 *******************************************************/
async function renderComplianceView(container) {
  if (!Auth.isAdmin()) {
    container.innerHTML = `<div class="section-card"><p class="text-danger mb-0">Access denied. This module is restricted to Admin users.</p></div>`;
    return;
  }

  let allRecords = [];
  let searchTerm = '';
  let categoryFilter = '';
  let statusFilter = '';

  container.innerHTML = `
    <div class="page-header">
      <h4><i class="bi bi-shield-lock-fill"></i> Business Compliance & Document Vault</h4>
      <div class="d-flex gap-2 no-print">
        <button class="btn btn-outline-secondary btn-sm" id="comp-export-csv"><i class="bi bi-filetype-csv"></i> CSV</button>
        <button class="btn btn-outline-secondary btn-sm" id="comp-export-pdf"><i class="bi bi-file-earmark-pdf"></i> PDF</button>
        <button class="btn btn-primary btn-sm" id="comp-add-btn"><i class="bi bi-plus-lg"></i> Add Document</button>
      </div>
    </div>

    <div class="row mb-3" id="comp-kpis"></div>

    <div class="table-card">
      <div class="filter-bar">
        <input type="text" class="form-control form-control-sm" id="comp-search" placeholder="Search document, reg. number...">
        <select class="form-select form-select-sm" id="comp-category-filter">
          <option value="">All Categories</option>
          ${CONFIG.COMPLIANCE_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
        </select>
        <select class="form-select form-select-sm" id="comp-status-filter">
          <option value="">All Renewal Status</option>
          <option value="expired">Expired</option>
          <option value="7">Due in 7 days</option>
          <option value="15">Due in 15 days</option>
          <option value="30">Due in 30 days</option>
          <option value="valid">Valid</option>
        </select>
      </div>
      <div id="comp-table-holder"><div class="empty-state"><div class="spinner-border text-primary"></div></div></div>
    </div>
  `;

  document.getElementById('comp-search').addEventListener('input', Utils.debounce(e => { searchTerm = e.target.value.toLowerCase(); render(); }, 250));
  document.getElementById('comp-category-filter').addEventListener('change', e => { categoryFilter = e.target.value; render(); });
  document.getElementById('comp-status-filter').addEventListener('change', e => { statusFilter = e.target.value; render(); });
  document.getElementById('comp-add-btn').addEventListener('click', () => openForm(null));
  document.getElementById('comp-export-csv').addEventListener('click', () => Utils.exportToCSV('Compliance_Vault', columns, filtered()));
  document.getElementById('comp-export-pdf').addEventListener('click', () => Utils.exportToPDF('Business Compliance & Document Vault', columns, filtered()));

  const columns = [
    { field: 'ComplianceID', label: 'ID' },
    { field: 'Category', label: 'Category' },
    { field: 'DocumentName', label: 'Document Name' },
    { field: 'RegistrationNumber', label: 'Reg. No.' },
    { field: 'ExpiryDate', label: 'Expiry Date' },
    { field: 'Status', label: 'Renewal Status' }
  ];

  await load();

  async function load() {
    UI.showSpinner();
    try { allRecords = await Api.list('ComplianceRecords'); } finally { UI.hideSpinner(); }
    renderKpis();
    render();
  }

  function renewalBucket(rec) {
    const days = Utils.daysBetween(rec.ExpiryDate || rec.RenewalDate);
    if (days === null || isNaN(days)) return 'none';
    if (days < 0) return 'expired';
    if (days <= 7) return '7';
    if (days <= 15) return '15';
    if (days <= 30) return '30';
    return 'valid';
  }

  function renderKpis() {
    const expired = allRecords.filter(r => renewalBucket(r) === 'expired').length;
    const d7 = allRecords.filter(r => renewalBucket(r) === '7').length;
    const d15 = allRecords.filter(r => renewalBucket(r) === '15').length;
    const d30 = allRecords.filter(r => renewalBucket(r) === '30').length;
    const healthPct = allRecords.length ? Math.round(((allRecords.length - expired) / allRecords.length) * 100) : 100;

    document.getElementById('comp-kpis').innerHTML = `
      ${kpi('Total Records', allRecords.length, '')}
      ${kpi('Due in 30 Days', d30, 'warning')}
      ${kpi('Due in 15 Days', d15, 'warning')}
      ${kpi('Due in 7 Days', d7, 'danger')}
      ${kpi('Expired', expired, 'danger')}
      ${kpi('Compliance Health', healthPct + '%', healthPct > 80 ? 'success' : 'warning')}
    `;
  }

  function kpi(label, value, tone) {
    return `<div class="col-6 col-md-2 mb-2"><div class="kpi-card ${tone}">
      <div class="kpi-value">${value}</div><div class="kpi-label">${label}</div></div></div>`;
  }

  function filtered() {
    return allRecords.filter(r => {
      if (searchTerm) {
        const hay = `${r.DocumentName} ${r.RegistrationNumber} ${r.Category}`.toLowerCase();
        if (!hay.includes(searchTerm)) return false;
      }
      if (categoryFilter && r.Category !== categoryFilter) return false;
      if (statusFilter && renewalBucket(r) !== statusFilter) return false;
      return true;
    });
  }

  function render() {
    const rows = filtered();
    const holder = document.getElementById('comp-table-holder');
    if (!rows.length) {
      holder.innerHTML = `<div class="empty-state"><i class="bi bi-inbox fs-1"></i><p>No compliance documents found.</p></div>`;
      return;
    }
    holder.innerHTML = `<div class="table-responsive"><table class="table table-hover data-table">
      <thead><tr><th>ID</th><th>Category</th><th>Document Name</th><th>Reg. No.</th>
      <th>Issue Date</th><th>Expiry Date</th><th>Renewal Status</th><th>File</th><th class="text-end">Actions</th></tr></thead>
      <tbody>${rows.map(r => {
        const b = UI.expiryBadge(r.ExpiryDate || r.RenewalDate);
        return `<tr>
          <td>${r.ComplianceID}</td>
          <td>${Utils.escapeHtml(r.Category)}</td>
          <td>${Utils.escapeHtml(r.DocumentName)}</td>
          <td>${Utils.escapeHtml(r.RegistrationNumber)}</td>
          <td>${r.IssueDate || '-'}</td>
          <td>${r.ExpiryDate || '-'}</td>
          <td>${UI.badge(b.label, b.cls)}</td>
          <td>${r.FileURL ? `<a href="${r.FileURL}" target="_blank" class="btn btn-sm btn-outline-primary"><i class="bi bi-eye"></i></a>` : '-'}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-primary me-1" data-edit="${r.ComplianceID}"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-outline-danger" data-del="${r.ComplianceID}"><i class="bi bi-trash"></i></button>
          </td>
        </tr>`;
      }).join('')}</tbody></table></div>`;

    holder.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', () => openForm(allRecords.find(r => r.ComplianceID === btn.dataset.edit)));
    });
    holder.querySelectorAll('[data-del]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!UI.confirm('Delete this compliance record? This action is logged in the audit trail.')) return;
        UI.showSpinner();
        try { await Api.remove('ComplianceRecords', btn.dataset.del); await load(); UI.toast('Record deleted.', 'success'); }
        finally { UI.hideSpinner(); }
      });
    });
  }

  function openForm(existing) {
    const isEdit = !!existing;
    const v = existing || {};
    const body = `
      <form id="comp-form">
        <div class="row">
          <div class="mb-3 col-md-6"><label class="form-label required">Category</label>
            <select class="form-select" name="Category" required>
              <option value="">-- select --</option>
              ${CONFIG.COMPLIANCE_CATEGORIES.map(c => `<option ${c === v.Category ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
          </div>
          <div class="mb-3 col-md-6"><label class="form-label required">Document Name</label>
            <input class="form-control" name="DocumentName" value="${Utils.escapeHtml(v.DocumentName)}" required></div>
          <div class="mb-3 col-md-6"><label class="form-label">Registration Number</label>
            <input class="form-control" name="RegistrationNumber" value="${Utils.escapeHtml(v.RegistrationNumber)}"></div>
          <div class="mb-3 col-md-6"><label class="form-label">Status</label>
            <select class="form-select" name="Status">
              ${['Active', 'Renewed', 'Expired', 'Under Renewal'].map(s => `<option ${s === v.Status ? 'selected' : ''}>${s}</option>`).join('')}
            </select></div>
          <div class="mb-3 col-md-4"><label class="form-label">Issue Date</label><input type="date" class="form-control" name="IssueDate" value="${v.IssueDate || ''}"></div>
          <div class="mb-3 col-md-4"><label class="form-label">Expiry Date</label><input type="date" class="form-control" name="ExpiryDate" value="${v.ExpiryDate || ''}"></div>
          <div class="mb-3 col-md-4"><label class="form-label">Renewal Date</label><input type="date" class="form-control" name="RenewalDate" value="${v.RenewalDate || ''}"></div>
          <div class="mb-3 col-md-12"><label class="form-label">Description</label><textarea class="form-control" name="Description" rows="2">${Utils.escapeHtml(v.Description)}</textarea></div>
          <div class="mb-3 col-md-12"><label class="form-label">Notes</label><textarea class="form-control" name="Notes" rows="2">${Utils.escapeHtml(v.Notes)}</textarea></div>
          <div class="mb-3 col-md-12"><label class="form-label">${isEdit ? 'Replace File (optional)' : 'Upload File'}</label>
            <input type="file" class="form-control" id="comp-file-input" ${isEdit ? '' : ''}>
            ${v.FileURL ? `<div class="form-text">Current file: <a href="${v.FileURL}" target="_blank">view</a></div>` : ''}
          </div>
        </div>
      </form>`;
    const footer = `<button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
      <button class="btn btn-primary" id="comp-save-btn">${isEdit ? 'Update' : 'Save'}</button>`;
    UI.openModal('compModal', `${isEdit ? 'Edit' : 'Add'} Compliance Document`, body, footer);

    document.getElementById('comp-save-btn').addEventListener('click', async () => {
      const form = document.getElementById('comp-form');
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const data = {
        Category: form.Category.value, DocumentName: form.DocumentName.value,
        RegistrationNumber: form.RegistrationNumber.value, Status: form.Status.value,
        IssueDate: form.IssueDate.value, ExpiryDate: form.ExpiryDate.value,
        RenewalDate: form.RenewalDate.value, Description: form.Description.value, Notes: form.Notes.value
      };
      UI.showSpinner();
      try {
        const fileInput = document.getElementById('comp-file-input');
        if (fileInput.files.length) {
          const file = fileInput.files[0];
          const base64 = await Utils.fileToBase64(file);
          const res = await Api.uploadFile('ComplianceRecords', v.ComplianceID || '', file.name, file.type, base64);
          data.FileURL = res.fileUrl; data.FileID = res.fileId; data.DriveLink = res.fileUrl;
        }
        if (isEdit) {
          await Api.update('ComplianceRecords', existing.ComplianceID, data);
          UI.toast('Compliance record updated.', 'success');
        } else {
          await Api.create('ComplianceRecords', data);
          UI.toast('Compliance record added.', 'success');
        }
        UI.closeModal('compModal');
        await load();
      } finally { UI.hideSpinner(); }
    });
  }
}
