/**
 * UIManager Class
 * Handles tab navigation, screen rendering, and DOM utilities
 */
class UIManager {
  constructor() {
    this.currentTab = 'dashboard';
    this.screens = {};
    this.toastTimeout = null;
  }

  /**
   * Register a screen (Dashboard, Analytics, etc.)
   */
  registerScreen(screenName, screenInstance) {
    this.screens[screenName] = screenInstance;
  }

  /**
   * Switch to a tab/screen
   */
  switchTab(tabName) {
    if (!this.screens[tabName]) {
      console.warn(`Screen ${tabName} not registered`);
      return;
    }

    // Hide all screens
    document.querySelectorAll('.screen').forEach(s => {
      s.style.display = 'none';
    });

    // Show active screen
    const screenEl = document.getElementById(`screen-${tabName}`);
    if (screenEl) {
      screenEl.style.display = 'block';
    }

    // Update active tab indicator
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }

    this.currentTab = tabName;

    // Trigger screen's onShow method if it exists
    if (this.screens[tabName].onShow) {
      this.screens[tabName].onShow();
    }
  }

  /**
   * Show toast notification
   */
  showToast(message, type = 'info', duration = 3000) {
    // Remove existing toast
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  /**
   * DOM selector helper
   */
  $(selector) {
    return document.querySelector(selector);
  }

  /**
   * DOM selector all helper
   */
  $$(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  /**
   * Format currency
   */
  formatMoney(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount || 0);
  }

  /**
   * Format date
   */
  formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  /**
   * Get today's date in YYYY-MM-DD format
   */
  getTodayString() {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }
}
