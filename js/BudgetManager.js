/**
 * BudgetManager Class
 * Manages budgets and provides budget analysis
 */
class BudgetManager {
  constructor(storage) {
    this.storage = storage;
    this.settings = storage.loadSettings();
  }

  // Get all budgets
  getBudgets() {
    return this.settings.budgets || {};
  }

  // Set budget for a category
  setBudget(category, amount) {
    this.settings.budgets[category] = parseFloat(amount) || 0;
    this.storage.saveSettings(this.settings);
  }

  // Get budget for a specific category
  getBudgetForCategory(category) {
    return this.settings.budgets[category] || 0;
  }

  // Calculate spending for a category in current month
  getSpendingForCategory(category, transactions) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return transactions
      .filter(t => 
        t.type === 'expense' &&
        t.category === category &&
        t.isWithinRange(startOfMonth, endOfMonth)
      )
      .reduce((sum, t) => sum + t.amount, 0);
  }

  // Get budget status for all categories (current month)
  getBudgetStatus(transactions) {
    const budgets = this.getBudgets();
    const status = {};

    for (const [category, budgetAmount] of Object.entries(budgets)) {
      const spent = this.getSpendingForCategory(category, transactions);
      const remaining = budgetAmount - spent;
      const percentUsed = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

      status[category] = {
        budget: budgetAmount,
        spent: spent,
        remaining: remaining,
        percentUsed: percentUsed,
        status: percentUsed >= 100 ? 'exceeded' : percentUsed >= 80 ? 'warning' : 'ok'
      };
    }

    return status;
  }

  // Get categories approaching or exceeding budget
  getAlerts(transactions) {
    const status = this.getBudgetStatus(transactions);
    return Object.entries(status)
      .filter(([_, data]) => data.status !== 'ok')
      .map(([category, data]) => ({
        category,
        ...data,
        message: data.status === 'exceeded' 
          ? `${category} budget exceeded by $${(data.spent - data.budget).toFixed(2)}`
          : `${category} is at ${Math.round(data.percentUsed)}% of budget`
      }));
  }
}
