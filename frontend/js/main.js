/**
 * Atelier — Common UI Utilities
 * Toast notifications, loading states, modals, helpers
 */

const UI = (() => {
  function showToast(message, type = 'info', duration = 4000) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const icons = {
      success: '✅',
      error: '❌',
      info: 'ℹ️',
      warning: '⚠️'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type] || ''}</span> ${message}`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  function showLoading(container, message = 'Loading...') {
    if (!container) return;
    const existing = container.querySelector('.loading-overlay');
    if (existing) return;

    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
      <div class="spinner"></div>
      <span>${message}</span>
    `;
    container.appendChild(overlay);
  }

  function hideLoading(container) {
    if (!container) return;
    const overlay = container.querySelector('.loading-overlay');
    if (overlay) overlay.remove();
  }

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('open');
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('open');
  }

  function showError(element, message) {
    if (!element) return;
    element.textContent = message;
    element.classList.remove('hidden');
  }

  function hideError(element) {
    if (!element) return;
    element.classList.add('hidden');
    element.textContent = '';
  }

  function formatDate(dateString) {
    const d = new Date(dateString);
    const now = new Date();
    const diff = now - d;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function getInitials(name) {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  }

  function getSkillBadge(skill) {
    const map = {
      beginner: 'badge-beginner',
      intermediate: 'badge-intermediate',
      advanced: 'badge-advanced'
    };
    return map[skill] || 'badge-beginner';
  }

  function getStatusBadge(status) {
    const map = {
      completed: 'badge-completed',
      in_progress: 'badge-in-progress',
      pending: 'badge-pending'
    };
    return map[status] || 'badge-pending';
  }

  function getStatusLabel(status) {
    const map = {
      completed: 'Completed',
      in_progress: 'In Progress',
      pending: 'Pending'
    };
    return map[status] || status;
  }

  function renderStats(container, stats) {
    if (!container || !stats) return;

    const configs = [
      { key: 'total_lessons_completed', label: 'Lessons Done', icon: '📚', color: 'gold' },
      { key: 'streak_days', label: 'Day Streak', icon: '🔥', color: 'purple' },
      { key: 'total_exercises_done', label: 'Exercises Done', icon: '✏️', color: 'green' },
      { key: 'total_mentor_queries', label: 'Mentor Queries', icon: '🎨', color: 'blue' },
    ];

    container.innerHTML = configs.map(cfg => `
      <div class="stat-card">
        <div class="stat-icon ${cfg.color}">${cfg.icon}</div>
        <div>
          <div class="stat-value">${stats[cfg.key] ?? 0}</div>
          <div class="stat-label">${cfg.label}</div>
        </div>
      </div>
    `).join('');
  }

  function renderActivityFeed(container, activities) {
    if (!container) return;
    if (!activities || activities.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>No activity yet. Start learning!</p></div>';
      return;
    }

    container.innerHTML = activities.slice(0, 10).map(a => `
      <div class="activity-item" style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border-color-light);font-size:var(--font-size-sm)">
        <span style="font-size:18px">${getActivityIcon(a.activity_type)}</span>
        <div style="flex:1">
          <div style="color:var(--color-text-primary)">${a.description}</div>
          <div style="color:var(--color-text-muted);font-size:var(--font-size-xs)">${formatDate(a.timestamp)}</div>
        </div>
      </div>
    `).join('');
  }

  function getActivityIcon(type) {
    const icons = {
      lesson_complete: '📖',
      exercise_done: '✏️',
      mentor_query: '🤖',
      submission: '📸',
      login: '🔑',
      roadmap_generated: '🗺️'
    };
    return icons[type] || '📌';
  }

  function renderDifficultyBadge(difficulty) {
    const map = {
      beginner: { class: 'badge-beginner', label: 'Beginner' },
      intermediate: { class: 'badge-intermediate', label: 'Intermediate' },
      advanced: { class: 'badge-advanced', label: 'Advanced' }
    };
    const info = map[difficulty] || map.beginner;
    return `<span class="badge ${info.class}">${info.label}</span>`;
  }

  function debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  // Close modal on overlay click
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      e.target.classList.remove('open');
    }
  });

  function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }

  return {
    showToast,
    showLoading,
    hideLoading,
    openModal,
    closeModal,
    showError,
    hideError,
    formatDate,
    getInitials,
    getSkillBadge,
    getStatusBadge,
    getStatusLabel,
    renderStats,
    renderActivityFeed,
    renderDifficultyBadge,
    escapeHtml,
    debounce,
  };
})();

// Global password toggle helper
function togglePassword(inputId, btn) {
  var input = document.getElementById(inputId);
  if (!input) return;
  var icon = btn.querySelector('i');
  if (input.type === 'password') {
    input.type = 'text';
    if (icon) icon.className = 'fas fa-eye-slash';
  } else {
    input.type = 'password';
    if (icon) icon.className = 'fas fa-eye';
  }
}