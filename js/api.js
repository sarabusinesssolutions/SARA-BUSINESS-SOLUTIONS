/*******************************************************
 * File: api.js
 * Purpose: Single point of contact with the Google Apps
 * Script backend. Uses text/plain POST bodies to avoid
 * CORS preflight requests (standard GAS + fetch pattern).
 *******************************************************/

const Api = {
  getToken() {
    const s = Auth.getSession();
    return s ? s.token : null;
  },

  async call(payload) {
    payload.token = payload.token || this.getToken();
    try {
      const res = await fetch(CONFIG.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!json.success) {
        if (/session/i.test(json.message || '')) {
          Auth.clearSession();
          window.location.href = 'index.html';
        }
        throw new Error(json.message || 'Request failed');
      }
      return json.data;
    } catch (err) {
      UI.toast(err.message || 'Network error. Please check your connection.', 'danger');
      throw err;
    }
  },

  login(username, password) {
    return this.call({ action: 'login', username, password });
  },

  list(module) {
    return this.call({ action: 'list', module });
  },

  create(module, data) {
    return this.call({ action: 'create', module, data });
  },

  update(module, id, data) {
    return this.call({ action: 'update', module, id, data });
  },

  remove(module, id) {
    return this.call({ action: 'delete', module, id });
  },

  uploadFile(module, recordId, fileName, mimeType, base64) {
    return this.call({ action: 'uploadFile', module, recordId, fileName, mimeType, base64 });
  },

  dashboardStats() {
    return this.call({ action: 'dashboardStats' });
  },

  complianceAlerts() {
    return this.call({ action: 'complianceAlerts' });
  },

  reportData(reportType, from, to) {
    return this.call({ action: 'reportData', reportType, from, to });
  }
};
