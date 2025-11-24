/**
 * Storage Class
 * Handles localStorage persistence for transactions and settings
 */
class Storage {
  constructor(storageKey = 'expense-tracker-v1', settingsKey = 'expense-tracker-settings-v1') {
    this.storageKey = storageKey;
    this.settingsKey = settingsKey;
  }

  // Load all transactions from localStorage
  loadTransactions() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];
      const transactions = JSON.parse(data);
      return transactions.map(tx => Transaction.fromJSON(tx));
    } catch (e) {
      console.error('Error loading transactions:', e);
      return [];
    }
  }

  // Save all transactions to localStorage
  saveTransactions(transactions) {
    try {
      const data = transactions.map(tx => tx.toJSON ? tx.toJSON() : tx);
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Error saving transactions:', e);
      return false;
    }
  }

  // Load settings
  loadSettings() {
    try {
      const data = localStorage.getItem(this.settingsKey);
      return data ? JSON.parse(data) : this.getDefaultSettings();
    } catch (e) {
      console.error('Error loading settings:', e);
      return this.getDefaultSettings();
    }
  }

  // Save settings
  saveSettings(settings) {
    try {
      localStorage.setItem(this.settingsKey, JSON.stringify(settings));
      return true;
    } catch (e) {
      console.error('Error saving settings:', e);
      return false;
    }
  }

  // Export transactions as CSV
  exportAsCSV(transactions) {
    const header = ['Type', 'Category', 'Amount', 'Date', 'Note'];
    const rows = transactions.map(t => [
      t.type,
      t.category,
      t.amount,
      t.date,
      t.note || ''
    ]);
    const csv = [header, ...rows].map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    return csv;
  }

  // Export transactions as JSON
  exportAsJSON(transactions) {
    return JSON.stringify(transactions.map(t => t.toJSON()), null, 2);
  }

  // Import transactions from JSON
  importFromJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      return data.map(tx => Transaction.fromJSON(tx));
    } catch (e) {
      console.error('Error importing transactions:', e);
      return [];
    }
  }

  // Default settings structure
  getDefaultSettings() {
    return {
      currency: 'USD',
      theme: 'dark',
      notifications: true,
      budgets: {
        Bills: 500,
        Food: 300,
        Shopping: 200,
        Travel: 400,
        Entertainment: 150,
        Healthcare: 200,
        Other: 100
      },
      twoFactorEnabled: false,
      profileName: 'User'
    };
  }

  // Clear all data (use with caution)
  clearAll() {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.settingsKey);
  }
}
