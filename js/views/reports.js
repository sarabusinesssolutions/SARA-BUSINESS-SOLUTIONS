/*******************************************************
 * File: views/reports.js — Reports
 * Daily / weekly / monthly / yearly revenue, lead and
 * service reports with CSV / PDF export.
 *******************************************************/
function renderReportsView(container) {
  container.innerHTML = `
    <div class="page-header"><h4><i class="bi bi-bar-chart-line-fill"></i> Reports</h4></div>
    <div class="section-card">
      <div class="row g-2 align-items-end">
        <div class="col-md-3">
          <label class="form-label">Report Type</label>
          <select class="form-select" id="rep-type">
            <option value="revenue">Revenue Report</option>
            <option value="leads">Leads Report</option>
            <option value="services">Service-wise Revenue</option>
            <option value="compliance">Compliance Report</option>
          </select>
        </div>
        <div class="col-md-3"><label class="form-label">From</label><input type="date" class="form-control" id="rep-from"></div>
        <div class="col-md-3"><label class="form-label">To</label><input type="date" class="form-control" id="rep-to"></div>
        <div class="col-md-3"><button class="btn btn-primary w-100" id="rep-run"><i class="bi bi-search"></i> Run Report</button></div>
      </div>
    </div>
    <div class="table-card">
      <div class="d-flex justify-content-end gap-2 mb-2 no-print">
        <button class="btn btn-outline-secondary btn-sm" id="rep-csv" disabled><i class="bi bi-filetype-csv"></i> CSV</button>
        <button class="btn btn-outline-secondary btn-sm" id="rep-pdf" disabled><i class="bi bi-file-earmark-pdf"></i> PDF</button>
        <button class="btn btn-outline-secondary btn-sm" id="rep-print" disabled><i class="bi bi-printer"></i> Print</button>
      </div>
      <div id="rep-output"><div class="empty-state">Choose a report type and click "Run Report".</div></div>
    </div>
  `;

  let lastColumns = [], lastRows = [], lastTitle = 'Report';

  document.getElementById('rep-run').addEventListener('click', runReport);
  document.getElementById('rep-csv').addEventListener('click', () => Utils.exportToCSV(lastTitle, lastColumns, lastRows));
  document.getElementById('rep-pdf').addEventListener('click', () => Utils.exportToPDF(lastTitle, lastColumns, lastRows));
  document.getElementById('rep-print').addEventListener('click', () => window.print());

  async function runReport() {
    const type = document.getElementById('rep-type').value;
    const from = document.getElementById('rep-from').value;
    const to = document.getElementById('rep-to').value;
    UI.showSpinner();
    try {
      const data = await Api.reportData(type, from, to);
      if (type === 'revenue') {
        lastColumns = [
          { field: 'InvoiceID', label: 'Invoice #' }, { field: 'CustomerName', label: 'Customer' },
          { field: 'ServiceName', label: 'Service' }, { field: 'TotalAmount', label: 'Total' },
          { field: 'PaidAmount', label: 'Paid' }, { field: 'BalanceAmount', label: 'Balance' },
          { field: 'PaymentStatus', label: 'Status' }, { field: 'InvoiceDate', label: 'Date' }
        ];
        lastRows = data.invoices; lastTitle = 'Revenue Report';
        document.getElementById('rep-output').innerHTML =
          `<p class="fw-bold">Total Revenue: ${Utils.formatMoney(data.totalRevenue)}</p>` +
          Utils.renderTable(lastColumns, lastRows);
      } else if (type === 'leads') {
        lastColumns = [
          { field: 'LeadID', label: 'ID' }, { field: 'Name', label: 'Name' }, { field: 'Source', label: 'Source' },
          { field: 'Status', label: 'Status' }, { field: 'CreatedDate', label: 'Created' }
        ];
        lastRows = data.leads; lastTitle = 'Leads Report';
        document.getElementById('rep-output').innerHTML = Utils.renderTable(lastColumns, lastRows);
      } else if (type === 'services') {
        lastColumns = [{ field: 'ServiceName', label: 'Service' }, { field: 'Revenue', label: 'Revenue' }];
        lastRows = Object.entries(data.byService).map(([k, v]) => ({ ServiceName: k, Revenue: v }));
        lastTitle = 'Service-wise Revenue';
        document.getElementById('rep-output').innerHTML = Utils.renderTable(lastColumns, lastRows);
      } else if (type === 'compliance') {
        lastColumns = [
          { field: 'ComplianceID', label: 'ID' }, { field: 'Category', label: 'Category' },
          { field: 'DocumentName', label: 'Document' }, { field: 'ExpiryDate', label: 'Expiry' }, { field: 'Status', label: 'Status' }
        ];
        lastRows = [].concat(data.expired, data.within7, data.within15, data.within30);
        lastTitle = 'Compliance Report';
        document.getElementById('rep-output').innerHTML = Utils.renderTable(lastColumns, lastRows);
      }
      ['rep-csv', 'rep-pdf', 'rep-print'].forEach(id => document.getElementById(id).disabled = !lastRows.length);
    } finally { UI.hideSpinner(); }
  }
}
