/**
 * DashboardScreen Class
 * Displays monthly summary, budget alerts, recent transactions, and AI insights
 */
class DashboardScreen {
  constructor(ui, storage, budgetManager, analyticsEngine) {
    this.ui = ui;
    this.storage = storage;
    this.budgetManager = budgetManager;
    this.analytics = analyticsEngine;
  }

  // Render the dashboard
  render(transactions) {
    const container = this.ui.$('[data-screen="dashboard"]');
    if (!container) return;

    const kpis = this.analytics.calculateKPIs(transactions);
    const alerts = this.budgetManager.getAlerts(transactions);
    const insights = this.analytics.generateInsights(transactions, this.budgetManager.getBudgets());
    const categoryData = this.analytics.getSpendingByCategory(transactions);
    const monthlyData = this.analytics.getMonthlyTrend(transactions);
    const recentTxs = transactions.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    let html = `
      <div class="dashboard-content">
        <!-- Monthly Summary -->
        <section class="card">
          <h2 class="card-title">📊 Monthly Summary</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-label">Income</span>
              <span class="summary-value positive">${this.ui.formatMoney(kpis.income)}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Expenses</span>
              <span class="summary-value negative">${this.ui.formatMoney(kpis.totalExpenses)}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Balance</span>
              <span class="summary-value">${this.ui.formatMoney(kpis.balance)}</span>
            </div>
          </div>
        </section>

        <!-- Budget Alerts -->
        ${alerts.length > 0 ? `
          <section class="card">
            <h2 class="card-title">⚠️ Budget Alerts</h2>
            <div class="alerts-list">
              ${alerts.map(alert => `
                <div class="alert alert-${alert.status}">
                  <div class="alert-category">${alert.category}</div>
                  <div class="alert-message">${alert.message}</div>
                  <div class="alert-progress">
                    <div class="progress-bar">
                      <div class="progress-fill" style="width: ${Math.min(alert.percentUsed, 100)}%"></div>
                    </div>
                    <span class="progress-text">${Math.round(alert.percentUsed)}%</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

        <!-- AI Insights -->
        <section class="card">
          <h2 class="card-title">✨ AI Insights</h2>
          <div class="insights-list">
            ${insights.map(insight => `
              <div class="insight insight-${insight.type}">
                <span class="insight-icon">${insight.icon}</span>
                <div class="insight-content">
                  <div class="insight-title">${insight.title}</div>
                  <div class="insight-message">${insight.message}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- Recent Transactions -->
        <section class="card span-2">
          <h2 class="card-title">📝 Recent Transactions</h2>
          ${recentTxs.length > 0 ? `
            <ul class="transaction-list">
              ${recentTxs.map(tx => `
                <li class="transaction-item">
                  <div class="tx-info">
                    <div class="tx-title">${tx.note || tx.category}</div>
                    <div class="tx-meta">${tx.category} • ${this.ui.formatDate(tx.date)}</div>
                  </div>
                  <div class="tx-amount" style="color: ${tx.type === 'income' ? '#22c55e' : '#ef4444'}">
                    ${tx.type === 'income' ? '+' : '-'}${this.ui.formatMoney(tx.amount)}
                  </div>
                </li>
              `).join('')}
            </ul>
          ` : '<p class="empty-state">No transactions yet</p>'}
        </section>
      </div>
    `;

    container.innerHTML = html;
  }
}
