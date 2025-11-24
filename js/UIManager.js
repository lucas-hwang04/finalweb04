/**
 * UIManager Class
 * Handles DOM manipulation, screen transitions, and UI utilities
 */
class UIManager {
  constructor() {
    this.currentScreen = 'dashboard';
    this.toast = null;
  }

  // Query selector helper
  $(selector, parent = document) {
    return parent.querySelector(selector);
  }

  // Query selector all helper
  $$(selector, parent = document) {
    return Array.from(parent.querySelectorAll(selector));
  }

  // Show a screen by ID
  showScreen(screenId) {
    this.$$('[data-screen]').forEach(el => {
      el.style.display = 'none';
    });
    const screen = this.$(`[data-screen="${screenId}"]`);
    if (screen) {
      screen.style.display = 'block';
      this.currentScreen = screenId;
      // Update navigation highlights
      this.$$('[data-nav]').forEach(el => {
        el.classList.toggle('active', el.dataset.nav === screenId);
      });
    }
  }

  // Show a toast notification
  showToast(message, type = 'info', duration = 3000) {
    // Remove existing toast
    if (this.toast) {
      this.toast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(toast);
    this.toast = toast;

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // Format money
  formatMoney(amount) {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  }

  // Get today's date in YYYY-MM-DD format
  getTodayDate() {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }

  // Format date for display
  formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  }

  // Add animation styles to head
  static injectAnimations() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
}
