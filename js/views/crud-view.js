/*******************************************************
 * File: crud-view.js
 * Purpose: One generic, config-driven CRUD screen used
 *          by Leads, Customers, Services, Employees,
 *          Tasks, FollowUps, Invoices and Users. Keeps
 *          the codebase DRY while still producing a full
 *          list + search + filter + add/edit/delete +
 *          export UI for each module.
 *******************************************************/

async function renderCrudView(container, config) {
  let allRows = [];
  let searchTerm = '';
  let activeFilters = {};

  container.innerHTML = `
    <div class="page-header">
      <h4><i class="bi ${config.icon || 'bi-table'}"></i> ${config.title}</h4>
      <div class="d-flex gap-2 no-print">
        <button class="btn btn-outline-secondary btn-sm" id="crud-export-csv"><i class="bi bi-filetype-csv"></i> CSV</button>
        <button class="btn btn-outline-secondary btn-sm" id="crud-export-pdf"><i class="bi bi-file-earmark-pdf"></i> PDF</button>
        ${!Auth.isReadOnly(config.module) ? `<button class="btn btn-primary btn-sm" id="crud-add-btn"><i class="bi bi-plus-lg"></i> Add ${config.singular}</button>` : ''}
      </div>
    </div>
    <div class="table-card">
      <div class="filter-bar">
        <input type="text" class="form-control form-control-sm" id="crud-search" placeholder="Search ${config.title.toLowerCase()}...">
        ${(config.filters || []).map(f => `
          <select class="form-select form-select-sm" data-filter="${f.field}">
            <option value="">All ${f.label}</option>
            ${f.options.map(o => `<option value="${o}">${o}</option>`).join('')}
          </select>`).join('')}
      </div>
      <div id="crud-table-holder"><div class="empty-state"><div class="spinner-border text-primary"></div></div></div>
    </div>
  `;

  document.getElementById('crud-search').addEventListener('input', Utils.debounce((e) => {
    searchTerm = e.target.value.toLowerCase();
    renderRows();
  }, 250));

  container.querySelectorAll('[data-filter]').forEach(sel => {
    sel.addEventListener('change', (e) => {
      activeFilters[e.target.dataset.filter] = e.target.value;
      renderRows();
    });
  });

  const addBtn = document.getElementById('crud-add-btn');
  if (addBtn) addBtn.addEventListener('click', () => openForm(null));

  document.getElementById('crud-export-csv').addEventListener('click', () => {
    Utils.exportToCSV(config.module, config.columns, getFiltered());
  });
  document.getElementById('crud-export-pdf').addEventListener('click', () => {
    Utils.exportToPDF(config.title, config.columns, getFiltered());
  });

  await load();

  async function load() {
    UI.showSpinner();
    try {
      allRows = await Api.list(config.module);
    } finally { UI.hideSpinner(); }
    renderRows();
  }

  function getFiltered() {
    return allRows.filter(row => {
      if (searchTerm) {
        const hay = config.searchFields.map(f => String(row[f] || '').toLowerCase()).join(' ');
        if (!hay.includes(searchTerm)) return false;
      }
      for (const key in activeFilters) {
        if (activeFilters[key] && row[key] !== activeFilters[key]) return false;
      }
      return true;
    });
  }

  function renderRows() {
    const rows = getFiltered();
    const holder = document.getElementById('crud-table-holder');
    const readOnly = Auth.isReadOnly(config.module);
    holder.innerHTML = Utils.renderTable(config.columns, rows, readOnly ? null : (row) => `
      <button class="btn btn-sm btn-outline-primary me-1" data-edit="${row[config.idField]}"><i class="bi bi-pencil"></i></button>
      ${Auth.isAdmin() || config.module !== 'Employees' ? `<button class="btn btn-sm btn-outline-danger" data-del="${row[config.idField]}"><i class="bi bi-trash"></i></button>` : ''}
    `);

    holder.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = allRows.find(r => r[config.idField] === btn.dataset.edit);
        openForm(row);
      });
    });
    holder.querySelectorAll('[data-del]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!UI.confirm(`Delete this ${config.singular.toLowerCase()}? This cannot be undone.`)) return;
        UI.showSpinner();
        try {
          await Api.remove(config.module, btn.dataset.del);
          UI.toast(`${config.singular} deleted.`, 'success');
          await load();
        } finally { UI.hideSpinner(); }
      });
    });
  }

  function openForm(existing) {
    const isEdit = !!existing;
    const bodyHtml = `<form id="crud-form"><div class="row">${config.formFields.map(f => fieldHtml(f, existing)).join('')}</div></form>`;
    const footerHtml = `
      <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
      <button class="btn btn-primary" id="crud-save-btn">${isEdit ? 'Update' : 'Save'}</button>`;
    UI.openModal('crudModal', `${isEdit ? 'Edit' : 'Add'} ${config.singular}`, bodyHtml, footerHtml);

    document.getElementById('crud-save-btn').addEventListener('click', async () => {
      const form = document.getElementById('crud-form');
      const data = {};
      let valid = true;
      config.formFields.forEach(f => {
        const el = form.querySelector(`[name="${f.name}"]`);
        const val = el ? el.value : '';
        if (f.required && !val) { el.classList.add('is-invalid'); valid = false; }
        else if (el) el.classList.remove('is-invalid');
        data[f.name] = val;
      });
      if (!valid) { UI.toast('Please fill all required fields.', 'danger'); return; }
      if (config.beforeSave) Object.assign(data, config.beforeSave(data, existing) || {});

      UI.showSpinner();
      try {
        if (isEdit) {
          await Api.update(config.module, existing[config.idField], data);
          UI.toast(`${config.singular} updated.`, 'success');
        } else {
          await Api.create(config.module, data);
          UI.toast(`${config.singular} added.`, 'success');
        }
        UI.closeModal('crudModal');
        await load();
      } finally { UI.hideSpinner(); }
    });
  }

  function fieldHtml(f, existing) {
    const value = existing ? (existing[f.name] ?? '') : (f.default ?? '');
    const req = f.required ? 'required' : '';
    const labelCls = f.required ? 'form-label required' : 'form-label';
    let input;
    if (f.type === 'select') {
      input = `<select class="form-select" name="${f.name}" ${req}>
        <option value="">-- select --</option>
        ${f.options.map(o => `<option value="${o}" ${o === value ? 'selected' : ''}>${o}</option>`).join('')}
      </select>`;
    } else if (f.type === 'textarea') {
      input = `<textarea class="form-control" name="${f.name}" rows="3" ${req}>${Utils.escapeHtml(value)}</textarea>`;
    } else {
      input = `<input type="${f.type || 'text'}" class="form-control" name="${f.name}" value="${Utils.escapeHtml(value)}" ${req} ${f.readonly ? 'readonly' : ''}>`;
    }
    return `<div class="mb-3 col-md-${f.col || 12}"><label class="${labelCls}">${f.label}</label>${input}</div>`;
  }
}
