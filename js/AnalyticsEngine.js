/**
 * AnalyticsEngine Class
 * Provides analytics, insights, and KPI calculations
 */
class AnalyticsEngine {
  constructor() {
    this.categoryColors = [
      '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
      '#ec4899', '#22c55e', '#14b8a6', '#eab308', '#06b6d4'
    ];
  }

  // Get current month date range
  getCurrentMonthRange() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start, end };
  }

  // Get last 6 months
  getLast6MonthsRange() {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    return months;
  }

  // Calculate KPIs for current month
  calculateKPIs(transactions) {
    const { start, end } = this.getCurrentMonthRange();
    const thisMonth = transactions.filter(t => t.isWithinRange(start, end));

    const count = thisMonth.length;
    const income = thisMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = thisMonth.filter(t => t.type === 'expense');
    const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0);
    const avgExpense = expenses.length ? totalExpenses / expenses.length : 0;

    // Top expense category
    const byCat = new Map();
    for (const t of expenses) {
      byCat.set(t.category, (byCat.get(t.category) || 0) + t.amount);
    }
    let topCat = '—';
    let topVal = 0;
    for (const [cat, val] of byCat) {
      if (val > topVal) {
        topVal = val;
        topCat = cat;
      }
    }

    return {
      transactionCount: count,
      income: income,
      totalExpenses: totalExpenses,
      balance: income - totalExpenses,
      avgExpense: avgExpense,
      topCategory: topCat,
      topCategoryAmount: topVal
    };
  }

  // Get spending by category for current month
  getSpendingByCategory(transactions) {
    const { start, end } = this.getCurrentMonthRange();
    const expenses = transactions.filter(t => 
      t.type === 'expense' && t.isWithinRange(start, end)
    );

    const byCat = new Map();
    for (const t of expenses) {
      byCat.set(t.category, (byCat.get(t.category) || 0) + t.amount);
    }

    const labels = Array.from(byCat.keys());
    const values = labels.map(l => byCat.get(l));

    return { labels, values };
  }

  // Get income and expenses by month (last 6 months)
  getMonthlyTrend(transactions) {
    const months = this.getLast6MonthsRange();
    const incomeMap = new Map(months.map(m => [m, 0]));
    const expenseMap = new Map(months.map(m => [m, 0]));

    for (const t of transactions) {
      const key = t.getMonthKey();
      if (!incomeMap.has(key)) continue;
      if (t.type === 'income') {
        incomeMap.set(key, incomeMap.get(key) + t.amount);
      } else if (t.type === 'expense') {
        expenseMap.set(key, expenseMap.get(key) + t.amount);
      }
    }

    return {
      labels: months,
      income: months.map(m => incomeMap.get(m)),
      expenses: months.map(m => expenseMap.get(m))
    };
  }

  // Generate AI-like insights
  generateInsights(transactions, budgets) {
    const insights = [];
    const { start, end } = this.getCurrentMonthRange();
    const kpis = this.calculateKPIs(transactions);

    // Insight 1: Spending trend
    if (kpis.totalExpenses > kpis.income) {
      insights.push({
        type: 'warning',
        title: 'Spending Alert',
        message: `You're spending $${(kpis.totalExpenses - kpis.income).toFixed(2)} more than you're earning this month.`,
        icon: '⚠️'
      });
    }

    // Insight 2: Top category warning
    if (kpis.topCategory !== '—') {
      const topBudget = budgets[kpis.topCategory] || 0;
      if (kpis.topCategoryAmount > topBudget) {
        insights.push({
          type: 'warning',
          title: `${kpis.topCategory} Overspend`,
          message: `${kpis.topCategory} has exceeded its budget by $${(kpis.topCategoryAmount - topBudget).toFixed(2)}.`,
          icon: '📊'
        });
      }
    }

    // Insight 3: Savings opportunity
    if (kpis.avgExpense > 0) {
      const potentialSavings = (kpis.avgExpense * 0.1).toFixed(2);
      insights.push({
        type: 'success',
        title: 'Savings Opportunity',
        message: `If you reduce average expense by 10%, you could save ~$${potentialSavings} this month.`,
        icon: '💰'
      });
    }

    // Insight 4: No spending warning
    if (kpis.totalExpenses === 0 && kpis.income > 0) {
      insights.push({
        type: 'info',
        title: 'Great Start',
        message: 'You haven\'t recorded any expenses yet this month. Keep up the good financial tracking!',
        icon: '✨'
      });
    }

    return insights;
  }

  // Get color for a category
  getCategoryColor(categoryIndex) {
    return this.categoryColors[categoryIndex % this.categoryColors.length];
  }
}
