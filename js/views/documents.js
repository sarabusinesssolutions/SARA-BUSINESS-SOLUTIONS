/*******************************************************
 * File: views/documents.js — Document Management
 * Uploads customer documents to Google Drive and links
 * them automatically in the Documents sheet.
 *******************************************************/
async function renderDocumentsView(container) {
  let allDocs = [];
  let searchTerm = '';

  container.innerHTML = `
    <div class="page-header">
      <h4><i class="bi bi-folder2-open"></i> Document Management</h4>
      <div class="d-flex gap-2 no-print">
        <button class="btn btn-outline-secondary btn-sm" id="doc-export-csv"><i class="bi bi-filetype-csv"></i> CSV</button>
        <button class="btn btn-primary btn-sm" id="doc-add-btn"><i class="bi bi-cloud-upload"></i> Upload Document</button>
      </div>
    </div>
    <div class="table-card">
      <div class="filter-bar">
        <input type="text" class="form-control form-control-sm" id="doc-search" placeholder="Search by customer, document name, type...">
      </div>
      <div id="doc-table-holder"><div class="empty-state"><div class="spinner-border text-primary"></div></div></div>
    </div>
  `;

  document.getElementById('doc-search').addEventListener('input', Utils.debounce(e => {
    searchTerm = e.target.value.toLowerCase();
    render();
  }, 250));
  document.getElementById('doc-add-btn').addEventListener('click', openUploadForm);
  document.getElementById('doc-export-csv').addEventListener('click', () => {
    Utils.exportToCSV('Documents', columns, filtered());
  });

  const columns = [
    { field: 'DocumentID', label: 'ID' },
    { field: 'CustomerName', label: 'Customer' },
    { field: 'DocumentType', label: 'Type' },
    { field: 'DocumentName', label: 'Document Name' },
    { field: 'ExpiryDate', label: 'Expiry', render: r => {
        const b = UI.expiryBadge(r.ExpiryDate);
        return r.ExpiryDate ? `${r.ExpiryDate} ${UI.badge(b.label, b.cls)}` : '-';
      } },
    { field: 'UploadedDate', label: 'Uploaded' },
    { field: 'FileURL', label: 'File', render: r => r.FileURL ? `<a href="${r.FileURL}" target="_blank" class="btn btn-sm btn-outline-primary"><i class="bi bi-eye"></i> View</a>` : '-' }
  ];

  await load();

  async function load() {
    UI.showSpinner();
    try { allDocs = await Api.list('Documents'); } finally { UI.hideSpinner(); }
    render();
  }

  function filtered() {
    if (!searchTerm) return allDocs;
    return allDocs.filter(d => [d.CustomerName, d.DocumentName, d.DocumentType].join(' ').toLowerCase().includes(searchTerm));
  }

  function render() {
    const holder = document.getElementById('doc-table-holder');
    holder.innerHTML = Utils.renderTable(columns, filtered(), row => `
      <button class="btn btn-sm btn-outline-danger" data-del="${row.DocumentID}"><i class="bi bi-trash"></i></button>
    `);
    holder.querySelectorAll('[data-del]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!UI.confirm('Delete this document record?')) return;
        UI.showSpinner();
        try { await Api.remove('Documents', btn.dataset.del); await load(); UI.toast('Document deleted.', 'success'); }
        finally { UI.hideSpinner(); }
      });
    });
  }

  function openUploadForm() {
    const body = `
      <form id="doc-form">
        <div class="row">
          <div class="mb-3 col-md-6"><label class="form-label required">Customer ID</label><input class="form-control" name="CustomerID" required></div>
          <div class="mb-3 col-md-6"><label class="form-label required">Customer Name</label><input class="form-control" name="CustomerName" required></div>
          <div class="mb-3 col-md-6"><label class="form-label required">Document Type</label>
            <select class="form-select" name="DocumentType" required>
              <option value="">-- select --</option>
              <option>ID Proof</option><option>Address Proof</option><option>PAN Card</option>
              <option>Business Registration</option><option>Bank Document</option><option>Agreement</option>
              <option>Other</option>
            </select>
          </div>
          <div class="mb-3 col-md-6"><label class="form-label required">Document Name</label><input class="form-control" name="DocumentName" required></div>
          <div class="mb-3 col-md-6"><label class="form-label">Expiry Date (if applicable)</label><input type="date" class="form-control" name="ExpiryDate"></div>
          <div class="mb-3 col-md-6"><label class="form-label required">File</label><input type="file" class="form-control" id="doc-file-input" required></div>
          <div class="mb-3 col-md-12"><label class="form-label">Notes</label><textarea class="form-control" name="Notes" rows="2"></textarea></div>
        </div>
      </form>`;
    const footer = `<button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
      <button class="btn btn-primary" id="doc-save-btn"><i class="bi bi-cloud-upload"></i> Upload</button>`;
    UI.openModal('docModal', 'Upload Customer Document', body, footer);

    document.getElementById('doc-save-btn').addEventListener('click', async () => {
      const form = document.getElementById('doc-form');
      const fileInput = document.getElementById('doc-file-input');
      if (!form.checkValidity() || !fileInput.files.length) { form.reportValidity(); return; }
      const file = fileInput.files[0];
      UI.showSpinner();
      try {
        const base64 = await Utils.fileToBase64(file);
        const uploadResult = await Api.uploadFile('Documents', '', file.name, file.type, base64);
        const data = {
          CustomerID: form.CustomerID.value,
          CustomerName: form.CustomerName.value,
          DocumentType: form.DocumentType.value,
          DocumentName: form.DocumentName.value,
          ExpiryDate: form.ExpiryDate.value,
          Notes: form.Notes.value,
          FileURL: uploadResult.fileUrl,
          FileID: uploadResult.fileId,
          UploadedBy: Auth.currentUser().Username,
          UploadedDate: new Date().toISOString().slice(0, 10)
        };
        await Api.create('Documents', data);
        UI.toast('Document uploaded successfully.', 'success');
        UI.closeModal('docModal');
        await load();
      } finally { UI.hideSpinner(); }
    });
  }
}
