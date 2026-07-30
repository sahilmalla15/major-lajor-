/**
 * Atelier — Auth Helpers
 * Handles login/register/logout flows and user state
 */

const Auth = (() => {
  function getStoredUser() {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  }

  function setStoredUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  function getCurrentUser() {
    return getStoredUser();
  }

  function isLoggedIn() {
    return API.isAuthenticated() && !!getStoredUser();
  }

  async function login(username, password) {
    try {
      const result = await API.login(username, password);
      API.setTokens(result.access, result.refresh);

      // Fetch user profile
      const profile = await API.getProfile();
      setStoredUser(profile);
      return { success: true, user: profile };
    } catch (err) {
      return {
        success: false,
        error: err.data?.detail || err.data?.message || err.message || 'Login failed'
      };
    }
  }

  async function register(formData) {
    try {
      const result = await API.register(formData);
      if (result.access) {
        API.setTokens(result.access, result.refresh);
        const profile = await API.getProfile();
        setStoredUser(profile);
        return { success: true, user: profile };
      }
      return { success: true, user: result };
    } catch (err) {
      const errors = err.data || {};
      let msg = 'Registration failed';
      if (typeof errors === 'string') msg = errors;
      else if (errors.username) msg = Array.isArray(errors.username) ? errors.username[0] : errors.username;
      else if (errors.email) msg = Array.isArray(errors.email) ? errors.email[0] : errors.email;
      else if (errors.password) msg = Array.isArray(errors.password) ? errors.password[0] : errors.password;
      else if (errors.detail) msg = errors.detail;
      else if (err.message) msg = err.message;
      return { success: false, error: msg };
    }
  }

  async function logout() {
    API.clearTokens();
    window.location.href = 'login.html';
  }

  function redirectIfNotLoggedIn() {
    if (!isLoggedIn()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }

  function redirectIfLoggedIn() {
    if (isLoggedIn()) {
      window.location.href = 'dashboard.html';
      return true;
    }
    return false;
  }

  function updateNavForAuth() {
    const user = getStoredUser();
    const navUser = document.querySelector('.nav-user');
    const navLinks = document.querySelector('.nav-links');

    if (!navUser && !navLinks) return;

    if (user && isLoggedIn()) {
      // Show user avatar and logout
      if (navUser) {
        const initial = (user.username || user.user?.username || 'U')[0].toUpperCase();
        navUser.innerHTML = `
          <a href="profile.html" class="nav-avatar">
            <div class="nav-avatar-placeholder">${initial}</div>
          </a>
          <button class="btn btn-ghost btn-sm" onclick="Auth.logout()">Logout</button>
        `;
      }
      if (navLinks) {
        navLinks.innerHTML = `
          <a href="dashboard.html">Dashboard</a>
          <a href="mentor.html">AI Mentor</a>
          <a href="drawing-lab.html">Drawing Lab</a>
        `;
      }
    } else {
      if (navUser) {
        navUser.innerHTML = `
          <a href="login.html" class="btn btn-ghost btn-sm">Sign In</a>
          <a href="register.html" class="btn btn-primary btn-sm">Get Started</a>
        `;
      }
      if (navLinks) {
        navLinks.innerHTML = `
          <a href="login.html">Sign In</a>
          <a href="register.html">Register</a>
        `;
      }
    }
  }

  // Auto-run on page load
  document.addEventListener('DOMContentLoaded', updateNavForAuth);

  return {
    login,
    register,
    logout,
    getCurrentUser,
    isLoggedIn,
    redirectIfNotLoggedIn,
    redirectIfLoggedIn,
    updateNavForAuth,
    getStoredUser,
    setStoredUser,
  };
})();
