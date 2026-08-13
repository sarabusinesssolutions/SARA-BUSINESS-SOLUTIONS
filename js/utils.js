/*******************************************************
 * File: utils.js
 * Purpose: Reusable UI helpers shared by every view:
 *          toasts, modals, table rendering, CSV/PDF
 *          export, and expiry/renewal badges.
 *******************************************************/

const UI = {
  toast(message, type = 'primary') {
    let holder = document.getElementById('toast-holder');
    if (!holder) {
      holder = document.createElement('div');
      holder.id = 'toast-holder';
      holder.style.cssText = 'position:fixed;top:70px;right:16px;z-index:3000;display:flex;flex-direction:column;gap:.5rem;';
      document.body.appendChild(holder);
    }
    const el = document.createElement('div');
    el.className = `alert alert-${type} shadow-sm mb-0`;
    el.style.cssText = 'min-width:260px;';
    el.textContent = message;
    holder.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  },

  showSpinner() {
    if (document.getElementById('global-spinner')) return;
    const div = document.createElement('div');
    div.id = 'global-spinner';
    div.className = 'spinner-overlay';
    div.innerHTML = '<div class="spinner-border text-primary" role="status"></div>';
    document.body.appendChild(div);
  },

  hideSpinner() {
    const el = document.getElementById('global-spinner');
    if (el) el.remove();
  },

  confirm(message) {
    return window.confirm(message);
  },

  // Renders a Bootstrap modal (creates it fresh each time to keep state clean).
  openModal(id, title, bodyHtml, footerHtml) {
    let existing = document.getElementById(id);
    if (existing) existing.remove();
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="modal fade" id="${id}" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${title}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">${bodyHtml}</div>
            <div class="modal-footer">${footerHtml || ''}</div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(wrapper.firstElementChild);
    const modalEl = document.getElementById(id);
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
    modalEl.addEventListener('hidden.bs.modal', () => modalEl.remove());
    return modal;
  },

  closeModal(id) {
    const el = document.getElementById(id);
    if (el) {
      const m = bootstrap.Modal.getInstance(el);
      if (m) m.hide();
    }
  },

  badge(text, colorClass) {
    return `<span class="badge badge-status ${colorClass}">${text}</span>`;
  },

  statusBadgeClass(status) {
    const map = {
      Active: 'bg-success', Converted: 'bg-success', Paid: 'bg-success', Completed: 'bg-success',
      Pending: 'bg-warning text-dark', New: 'bg-info text-dark', 'In Progress': 'bg-info text-dark',
      Contacted: 'bg-info text-dark', 'Partially Paid': 'bg-warning text-dark',
      Inactive: 'bg-secondary', Lost: 'bg-danger', 'Not Interested': 'bg-danger',
      Unpaid: 'bg-danger', Overdue: 'bg-danger', 'On Hold': 'bg-secondary'
    };
    return map[status] || 'bg-secondary';
  },

  // Returns { label, cls } for a document/compliance expiry date.
  expiryBadge(dateStr) {
    if (!dateStr) return { label: 'No Expiry', cls: 'bg-secondary' };
    const days = Utils.daysBetween(dateStr);
    if (days < 0) return { label: 'Expired', cls: 'alert-pill-expired' };
    if (days <= 7) return { label: `${days}d left`, cls: 'alert-pill-7' };
    if (days <= 15) return { label: `${days}d left`, cls: 'alert-pill-15' };
    if (days <= 30) return { label: `${days}d left`, cls: 'alert-pill-30' };
    return { label: 'Valid', cls: 'bg-success' };
  }
};

const Utils = {
  daysBetween(dateStr) {
    const target = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    return Math.round((target - today) / 86400000);
  },

  formatMoney(n) {
    n = Number(n) || 0;
    return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  },

  formatDate(d) {
    if (!d) return '-';
    return d;
  },

  escapeHtml(str) {
    if (str === undefined || str === null) return '';
    return String(str).replace(/[&<>"']/g, (m) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
  },

  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // Generic HTML <table> builder used by every list view.
  renderTable(columns, rows, rowActionsFn) {
    if (!rows.length) {
      return `<div class="empty-state"><i class="bi bi-inbox fs-1"></i><p>No records found.</p></div>`;
    }
    let thead = columns.map(c => `<th>${c.label}</th>`).join('');
    if (rowActionsFn) thead += '<th class="text-end">Actions</th>';
    let tbody = rows.map(row => {
      let cells = columns.map(c => `<td>${c.render ? c.render(row) : Utils.escapeHtml(row[c.field])}</td>`).join('');
      if (rowActionsFn) cells += `<td class="text-end">${rowActionsFn(row)}</td>`;
      return `<tr>${cells}</tr>`;
    }).join('');
    return `<div class="table-responsive"><table class="table table-hover data-table">
      <thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table></div>`;
  },

  exportToCSV(filename, columns, rows) {
    let csv = columns.map(c => `"${c.label}"`).join(',') + '\n';
    rows.forEach(row => {
      csv += columns.map(c => `"${String(row[c.field] ?? '').replace(/"/g, '""')}"`).join(',') + '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename + '.csv';
    link.click();
  },

  exportToPDF(title, columns, rows) {
    const win = window.open('', '_blank');
    let html = `<html><head><title>${title}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:20px;}
        h2{color:#0d3b66;} table{width:100%;border-collapse:collapse;margin-top:10px;}
        th,td{border:1px solid #ccc;padding:6px 8px;font-size:12px;text-align:left;}
        th{background:#0d3b66;color:#fff;}
      </style></head><body>
      <h2>${title}</h2><p>${CONFIG.APP_NAME} - Generated ${new Date().toLocaleString()}</p>
      <table><thead><tr>${columns.map(c => `<th>${c.label}</th>`).join('')}</tr></thead><tbody>`;
    rows.forEach(row => {
      html += `<tr>${columns.map(c => `<td>${Utils.escapeHtml(row[c.field])}</td>`).join('')}</tr>`;
    });
    html += '</tbody></table></body></html>';
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  },

  debounce(fn, wait = 300) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
  }
};
