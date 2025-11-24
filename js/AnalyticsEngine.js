/**
 * Analytics Engine Class
 * Calculates insights, trends, and statistics
 */
class AnalyticsEngine {
  /**
   * Get KPIs for current month
   */
  static getMonthlyKPIs(transactions) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const thisMonth = transactions.filter(t => {
      const txDate = new Date(t.date);
      return txDate >= monthStart && txDate <= monthEnd;
    });

    const income = thisMonth
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = thisMonth
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const count = thisMonth.length;
    const avgExpense = expenses > 0 ? expenses / thisMonth.filter(t => t.type === 'expense').length : 0;

    // Top category
    const categorySpend = {};
    thisMonth.filter(t => t.type === 'expense').forEach(t => {
      categorySpend[t.category] = (categorySpend[t.category] || 0) + t.amount;
    });

    let topCategory = '—';
    let topAmount = 0;
    for (const [cat, amt] of Object.entries(categorySpend)) {
      if (amt > topAmount) {
        topAmount = amt;
        topCategory = cat;
      }
    }

    return {
      income,
      expenses,
      balance: income - expenses,
      transactionCount: count,
      topCategory,
      avgExpense,
    };
  }

  /**
   * Get category breakdown for a time range
   */
  static getCategoryBreakdown(transactions, startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const breakdown = {};
    transactions
      .filter(t => {
        const txDate = new Date(t.date);
        return t.type === 'expense' && txDate >= start && txDate <= end;
      })
      .forEach(t => {
        breakdown[t.category] = (breakdown[t.category] || 0) + t.amount;
      });

    return Object.entries(breakdown)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }

  /**
   * Get monthly trend (last 12 months)
   */
  static getMonthlySeries(transactions) {
    const now = new Date();
    const months = [];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push(key);
    }

    const incomeMap = new Map(months.map(m => [m, 0]));
    const expenseMap = new Map(months.map(m => [m, 0]));

    transactions.forEach(t => {
      const key = t.date.slice(0, 7); // YYYY-MM
      if (incomeMap.has(key)) {
        if (t.type === 'income') {
          incomeMap.set(key, incomeMap.get(key) + t.amount);
        } else {
          expenseMap.set(key, expenseMap.get(key) + t.amount);
        }
      }
    });

    return {
      labels: months,
      income: months.map(m => incomeMap.get(m)),
      expenses: months.map(m => expenseMap.get(m)),
    };
  }

  /**
   * Get weekly trend (last 8 weeks)
   */
  static getWeeklySeries(transactions) {
    const weeks = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - d.getDay() - i * 7);
      const key = d.toISOString().split('T')[0];
      weeks.push(key);
    }

    const incomeMap = new Map(weeks.map(w => [w, 0]));
    const expenseMap = new Map(weeks.map(w => [w, 0]));

    transactions.forEach(t => {
      const d = new Date(t.date);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().split('T')[0];

      if (incomeMap.has(key)) {
        if (t.type === 'income') {
          incomeMap.set(key, incomeMap.get(key) + t.amount);
        } else {
          expenseMap.set(key, expenseMap.get(key) + t.amount);
        }
      }
    });

    return {
      labels: weeks.map(w => new Date(w).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      income: weeks.map(w => incomeMap.get(w)),
      expenses: weeks.map(w => expenseMap.get(w)),
    };
  }

  /**
   * AI-simulated recommendations based on spending patterns
   */
  static getRecommendations(transactions, budgetManager) {
    const kpis = this.getMonthlyKPIs(transactions);
    const recommendations = [];

    // Recommendation 1: High spending category
    if (kpis.topCategory && kpis.topCategory !== '—') {
      const budget = budgetManager.getBudget(kpis.topCategory);
      if (budget > 0 && kpis.topCategory === 'Shopping') {
        recommendations.push({
          type: 'savings',
          icon: '💡',
          title: 'Optimize Shopping Spending',
          message: `Your top category is ${kpis.topCategory}. Consider setting a budget or finding discounts.`,
        });
      }
    }

    // Recommendation 2: Good income-to-expense ratio
    if (kpis.balance > 0) {
      recommendations.push({
        type: 'positive',
        icon: '✨',
        title: 'Great Job!',
        message: `You have a positive balance of $${kpis.balance.toFixed(2)} this month. Keep it up!`,
      });
    } else if (kpis.balance < 0) {
      recommendations.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Expenses Exceed Income',
        message: `Consider increasing income or reducing expenses to balance your budget.`,
      });
    }

    // Recommendation 3: Transaction frequency
    if (kpis.transactionCount > 20) {
      recommendations.push({
        type: 'info',
        icon: '📊',
        title: 'High Transaction Volume',
        message: `You have ${kpis.transactionCount} transactions this month. Monitor for unusual patterns.`,
      });
    }

    return recommendations;
  }
}
