/**
 * Budget Manager Class
 * Handles budget creation, tracking, and alerts
 */
class BudgetManager {
  constructor(storage) {
    this.storage = storage;
    this.settings = storage.loadSettings();
    this.budgets = this.settings.budgets || {};
  }

  /**
   * Set budget for a category
   */
  setBudget(category, amount) {
    this.budgets[category] = parseFloat(amount) || 0;
    this.saveBudgets();
  }

  /**
   * Get budget for a category
   */
  getBudget(category) {
    return this.budgets[category] || 0;
  }

  /**
   * Get all budgets
   */
  getAllBudgets() {
    return { ...this.budgets };
  }

  /**
   * Calculate spending for a category in current month
   */
  calculateCategorySpending(category, transactions) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return transactions
      .filter(t => {
        const txDate = new Date(t.date);
        return (
          t.type === 'expense' &&
          t.category === category &&
          txDate >= monthStart &&
          txDate <= monthEnd
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }

  /**
   * Get budget status for all categories
   * Returns array of { category, budget, spent, percentUsed, status (under/warning/over) }
   */
  getBudgetStatus(transactions) {
    const status = [];
    for (const [category, budget] of Object.entries(this.budgets)) {
      const spent = this.calculateCategorySpending(category, transactions);
      const percentUsed = budget > 0 ? (spent / budget) * 100 : 0;
      let statusType = 'under';
      if (percentUsed >= 100) statusType = 'over';
      else if (percentUsed >= 80) statusType = 'warning';

      status.push({
        category,
        budget,
        spent,
        percentUsed,
        status: statusType,
      });
    }
    return status;
  }

  /**
   * Get alert for a specific category
   */
  getCategoryAlert(category, transactions) {
    const budget = this.getBudget(category);
    const spent = this.calculateCategorySpending(category, transactions);

    if (budget === 0) return null;

    const percentUsed = (spent / budget) * 100;
    if (percentUsed >= 100) {
      return {
        type: 'over',
        message: `You've exceeded ${category} budget by $${(spent - budget).toFixed(2)}`,
      };
    }
    if (percentUsed >= 80) {
      return {
        type: 'warning',
        message: `You've used ${percentUsed.toFixed(0)}% of your ${category} budget`,
      };
    }
    return null;
  }

  /**
   * Save budgets to storage
   */
  saveBudgets() {
    this.settings.budgets = this.budgets;
    this.storage.saveSettings(this.settings);
  }
}
