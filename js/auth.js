/*******************************************************
 * File: auth.js
 * Purpose: Session persistence (localStorage) and
 *          role-based access helpers used by every page.
 *******************************************************/

const Auth = {
  getSession() {
    const raw = localStorage.getItem(CONFIG.SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  setSession(token, user, permissions) {
    localStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify({ token, user, permissions, ts: Date.now() }));
  },

  clearSession() {
    localStorage.removeItem(CONFIG.SESSION_KEY);
  },

  isLoggedIn() {
    return !!this.getSession();
  },

  currentUser() {
    const s = this.getSession();
    return s ? s.user : null;
  },

  role() {
    const s = this.getSession();
    return s ? s.user.Role : null;
  },

  isAdmin() {
    const r = this.role();
    return r === 'SuperAdmin' || r === 'Admin';
  },

  canAccess(moduleName) {
    const s = this.getSession();
    if (!s) return false;
    const perm = s.permissions;
    if (!perm) return false;
    if (perm.all) return true;
    return (perm.modules || []).indexOf(moduleName) !== -1;
  },

  isReadOnly(moduleName) {
    const s = this.getSession();
    if (!s || !s.permissions) return false;
    return (s.permissions.readOnly || []).indexOf(moduleName) !== -1;
  },

  requireLogin() {
    if (!this.isLoggedIn()) {
      window.location.href = 'index.html';
    }
  },

  async logout() {
    try { await Api.call({ action: 'logout' }); } catch (e) {}
    this.clearSession();
    window.location.href = 'index.html';
  }
};
