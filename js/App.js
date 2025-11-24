/**
 * App Class
 * Main orchestrator that ties all components together
 */
class App {
  constructor() {
    // Initialize core systems
    this.ui = new UIManager();
    this.storage = new Storage();
    this.budgetManager = new BudgetManager(this.storage);
    this.analytics = new AnalyticsEngine();

    // Initialize screen managers
    this.dashboardScreen = new DashboardScreen(this.ui, this.storage, this.budgetManager, this.analytics);
    this.addExpenseScreen = new AddExpenseScreen(this.ui, this.storage);
    this.analyticsScreen = new AnalyticsScreen(this.ui, this.analytics);
    this.searchScreen = new SearchScreen(this.ui);
    this.settingsScreen = new SettingsScreen(this.ui, this.storage, this.budgetManager);

    // Load data
    this.transactions = this.storage.loadTransactions();

    // Inject styles
    UIManager.injectAnimations();
  }

  // Initialize the app
  init() {
    console.log('🚀 Initializing Expense Tracker App...');

    // Render all screens for the first time
    this.renderAll();

    // Show dashboard by default
    this.ui.showScreen('dashboard');

    // Attach event listeners
    this.attachEventListeners();

    console.log('✅ App initialized successfully');
  }

  // Render all screens with current data
  renderAll() {
    this.dashboardScreen.render(this.transactions);
    this.addExpenseScreen.render(this.transactions);
    this.analyticsScreen.render(this.transactions);
    this.searchScreen.render(this.transactions);
    this.settingsScreen.render(this.transactions);
  }

  // Attach global event listeners
  attachEventListeners() {
    // Navigation buttons
    this.ui.$$('[data-nav]').forEach(btn => {
      btn.addEventListener('click', () => {
        const screenId = btn.dataset.nav;
        this.ui.showScreen(screenId);
      });
    });

    // Transaction submit (from Add Expense Screen)
    document.addEventListener('transactionSubmit', (e) => {
      const { type, category, amount, date, note, isEdit } = e.detail;

      if (isEdit && this.addExpenseScreen.editingTransaction) {
        // Update existing transaction
        const idx = this.transactions.findIndex(t => t.id === this.addExpenseScreen.editingTransaction.id);
        if (idx > -1) {
          this.transactions[idx] = new Transaction(type, category, amount, date, note, this.addExpenseScreen.editingTransaction.id);
        }
        this.addExpenseScreen.clearEditMode();
      } else {
        // Add new transaction
        const tx = new Transaction(type, category, amount, date, note);
        this.transactions.push(tx);
      }

      // Save and refresh
      this.storage.saveTransactions(this.transactions);
      this.renderAll();
    });

    // Edit transaction (from dashboard)
    document.addEventListener('editTransaction', (e) => {
      const { transactionId } = e.detail;
      const tx = this.transactions.find(t => t.id === transactionId);
      if (tx) {
        this.addExpenseScreen.setEditMode(tx);
        this.ui.showScreen('add-expense');
      }
    });

    // Delete transaction (from dashboard)
    document.addEventListener('deleteTransaction', (e) => {
      const { transactionId } = e.detail;
      if (confirm('Delete this transaction?')) {
        this.transactions = this.transactions.filter(t => t.id !== transactionId);
        this.storage.saveTransactions(this.transactions);
        this.renderAll();
        this.ui.showToast('Transaction deleted ✅', 'success');
      }
    });
  }

  // Public method to add transaction (can be called from outside)
  addTransaction(type, category, amount, date, note = '') {
    const tx = new Transaction(type, category, amount, date, note);
    this.transactions.push(tx);
    this.storage.saveTransactions(this.transactions);
    this.renderAll();
    return tx;
  }

  // Public method to get transactions
  getTransactions() {
    return this.transactions;
  }

  // Public method to export transactions
  exportTransactions(format = 'json') {
    if (format === 'csv') {
      return this.storage.exportAsCSV(this.transactions);
    }
    return this.storage.exportAsJSON(this.transactions);
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  window.app.init();
});
