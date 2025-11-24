/**
 * App Class
 * Main orchestrator that initializes all components and manages the application lifecycle
 */
class App {
  constructor() {
    this.ui = new UIManager();
    this.storage = new Storage();
    this.budgetManager = new BudgetManager(this.storage);
    this.analyticsEngine = AnalyticsEngine;

    this.screens = {};
    this.initScreens();
    this.setupEventListeners();
    this.init();
  }

  /**
   * Initialize all screen modules
   */
  initScreens() {
    this.screens.dashboard = new DashboardScreen(
      this.ui,
      this.storage,
      this.budgetManager,
      this.analyticsEngine
    );

    this.screens['add-expense'] = new AddExpenseScreen(
      this.ui,
      this.storage,
      () => this.refreshAllScreens()
    );

    this.screens.analytics = new AnalyticsScreen(
      this.ui,
      this.storage,
      this.analyticsEngine,
      this.budgetManager
    );

    this.screens.search = new SearchScreen(this.ui, this.storage);

    this.screens.settings = new SettingsScreen(
      this.ui,
      this.storage,
      this.budgetManager
    );

    // Register screens with UIManager
    for (const [name, screen] of Object.entries(this.screens)) {
      this.ui.registerScreen(name, screen);
    }
  }

  /**
   * Setup navigation and event listeners
   */
  setupEventListeners() {
    const navBtns = this.ui.$$('.nav-btn');
    for (const btn of navBtns) {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.ui.switchTab(tab);
      });
    }

    // Edit transaction listeners (when user clicks edit on a transaction)
    document.addEventListener('click', e => {
      if (e.target.classList.contains('edit-tx-btn')) {
        const txId = e.target.dataset.txId;
        this.screens['add-expense'].editTransaction(txId);
      }
    });
  }

  /**
   * Refresh all screens (called after transaction added/edited)
   */
  refreshAllScreens() {
    for (const screen of Object.values(this.screens)) {
      if (screen.onShow) {
        screen.onShow();
      }
    }
  }

  /**
   * Initialize the app
   */
  init() {
    // Render initial screens
    this.screens.dashboard.onShow();
    this.screens['add-expense'].onShow();
    this.screens.analytics.onShow();
    this.screens.search.onShow();
    this.screens.settings.onShow();

    // Show dashboard by default
    this.ui.switchTab('dashboard');

    console.log('✅ Expense Tracker App initialized');
  }
}

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
