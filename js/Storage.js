/**
 * Storage Manager Class
 * Handles localStorage persistence for transactions and settings
 */
class Storage {
  constructor(storageKey = 'expenseTracker.transactions') {
    this.storageKey = storageKey;
    this.settingsKey = 'expenseTracker.settings';
  }

  /**
   * Load all transactions from localStorage
   */
  loadTransactions() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];
      return JSON.parse(data).map(obj => Transaction.fromJSON(obj));
    } catch (e) {
      console.error('Failed to load transactions:', e);
      return [];
    }
  }

  /**
   * Save all transactions to localStorage
   */
  saveTransactions(transactions) {
    try {
      const data = transactions.map(t => t.toJSON());
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Failed to save transactions:', e);
      return false;
    }
  }

  /**
   * Load settings (budgets, preferences)
   */
  loadSettings() {
    try {
      const data = localStorage.getItem(this.settingsKey);
      if (!data) {
        return this.getDefaultSettings();
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load settings:', e);
      return this.getDefaultSettings();
    }
  }

  /**
   * Save settings
   */
  saveSettings(settings) {
    try {
      localStorage.setItem(this.settingsKey, JSON.stringify(settings));
      return true;
    } catch (e) {
      console.error('Failed to save settings:', e);
      return false;
    }
  }

  /**
   * Default settings structure
   */
  getDefaultSettings() {
    return {
      budgets: {
        Bills: 500,
        Food: 300,
        Shopping: 200,
        Travel: 400,
        Entertainment: 150,
        Healthcare: 250,
        Other: 100,
      },
      notifications: true,
      currency: 'USD',
      theme: 'dark',
      exportFormat: 'csv',
    };
  }

  /**
   * Clear all data (destructive)
   */
  clearAll() {
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.settingsKey);
      return true;
    } catch (e) {
      console.error('Failed to clear storage:', e);
      return false;
    }
  }

  /**
   * Export transactions as JSON
   */
  exportAsJSON(transactions) {
    return JSON.stringify(
      transactions.map(t => t.toJSON()),
      null,
      2
    );
  }

  /**
   * Export transactions as CSV
   */
  exportAsCSV(transactions) {
    const header = ['Type', 'Category', 'Amount', 'Date', 'Note'];
    const rows = transactions.map(t => [
      t.type,
      t.category,
      t.amount.toFixed(2),
      t.date,
      `"${(t.note || '').replace(/"/g, '""')}"`,
    ]);
    return [header, ...rows].map(row => row.join(',')).join('\n');
  }

  /**
   * Import transactions from JSON
   */
  importFromJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!Array.isArray(data)) throw new Error('Invalid format: expected array');
      return data.map(obj => Transaction.fromJSON(obj));
    } catch (e) {
      console.error('Import failed:', e);
      return [];
    }
  }
}
