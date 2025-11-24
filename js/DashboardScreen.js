/**
 * DashboardScreen Class
 * Displays monthly summary, budget alerts, recent transactions, and AI insights
 */
class DashboardScreen {
  constructor(ui, storage, budgetManager, analyticsEngine) {
    this.ui = ui;
    this.storage = storage;
    this.budgetManager = budgetManager;
    this.analyticsEngine = analyticsEngine;
    this.catChart = null;
    this.monthChart = null;
  }

  /**
   * Render the dashboard screen
   */
  render(transactions) {
    const container = this.ui.$('#screen-dashboard');
    if (!container) return;

    const kpis = this.analyticsEngine.getMonthlyKPIs(transactions);
    const budgetStatus = this.budgetManager.getBudgetStatus(transactions);
    const recommendations = this.analyticsEngine.getRecommendations(transactions, this.budgetManager);

    let html = `
      <div class="dashboard-header">
        <h2>Dashboard</h2>
        <p class="subtitle">Monthly Summary & Insights</p>
      </div>

      <!-- KPIs -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Income</div>
          <div class="kpi-value positive">${this.ui.formatMoney(kpis.income)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Expenses</div>
          <div class="kpi-value negative">${this.ui.formatMoney(kpis.expenses)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Balance</div>
          <div class="kpi-value ${kpis.balance >= 0 ? 'positive' : 'negative'}">${this.ui.formatMoney(kpis.balance)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Avg Expense</div>
          <div class="kpi-value">${this.ui.formatMoney(kpis.avgExpense)}</div>
        </div>
      </div>

      <!-- Budget Alerts -->
      <div class="section">
        <h3>Budget Status</h3>
        <div class="budget-list">
    `;

    for (const budget of budgetStatus) {
      const percentUsed = budget.percentUsed.toFixed(0);
      let statusClass = 'under';
      let statusIcon = '✅';
      if (budget.status === 'warning') {
        statusClass = 'warning';
        statusIcon = '⚠️';
      } else if (budget.status === 'over') {
        statusClass = 'over';
        statusIcon = '🔴';
      }

      html += `
        <div class="budget-item budget-${statusClass}">
          <div class="budget-info">
            <div class="budget-category">
              <span class="budget-icon">${statusIcon}</span>
              <span class="budget-name">${budget.category}</span>
            </div>
            <div class="budget-amounts">
              <span class="spent">${this.ui.formatMoney(budget.spent)}</span>
              <span class="of">/ ${this.ui.formatMoney(budget.budget)}</span>
            </div>
          </div>
          <div class="budget-bar">
            <div class="budget-fill" style="width: ${Math.min(percentUsed, 100)}%"></div>
          </div>
          <div class="budget-percent">${percentUsed}%</div>
        </div>
      `;
    }

    html += `
        </div>
      </div>

      <!-- AI Insights -->
      <div class="section">
        <h3>💡 AI Insights</h3>
        <div class="insights-list">
    `;

    for (const rec of recommendations) {
      html += `
        <div class="insight-card insight-${rec.type}">
          <div class="insight-icon">${rec.icon}</div>
          <div class="insight-content">
            <div class="insight-title">${rec.title}</div>
            <div class="insight-message">${rec.message}</div>
          </div>
        </div>
      `;
    }

    html += `
        </div>
      </div>

      <!-- Recent Transactions -->
      <div class="section">
        <h3>Recent Transactions</h3>
        <div class="transaction-list">
    `;

    const recentTx = transactions
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    for (const tx of recentTx) {
      const sign = tx.type === 'income' ? '+' : '-';
      const amountClass = tx.type === 'income' ? 'positive' : 'negative';
      html += `
        <div class="transaction-item">
          <div class="tx-left">
            <div class="tx-category">${tx.category}</div>
            <div class="tx-note">${tx.note || 'No note'} • ${this.ui.formatDate(tx.date)}</div>
          </div>
          <div class="tx-right">
            <div class="tx-amount ${amountClass}">${sign}${this.ui.formatMoney(Math.abs(tx.amount))}</div>
          </div>
        </div>
      `;
    }

    html += `
        </div>
      </div>

      <!-- Charts -->
      <div class="charts-section">
        <div class="chart-container">
          <h3>Expenses by Category (This Month)</h3>
          <canvas id="catChart" height="200"></canvas>
        </div>
        <div class="chart-container">
          <h3>Income vs Expenses (Last 12 Months)</h3>
          <canvas id="monthChart" height="200"></canvas>
        </div>
      </div>
    `;

    container.innerHTML = html;
    this.renderCharts(transactions);
  }

  /**
   * Render charts using Chart.js
   */
  renderCharts(transactions) {
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded');
      return;
    }

    // Category pie chart
    const breakdown = this.analyticsEngine.getCategoryBreakdown(
      transactions,
      new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
    );

    const catCtx = document.getElementById('catChart');
    if (catCtx && breakdown.length > 0) {
      if (this.catChart) this.catChart.destroy();
      this.catChart = new Chart(catCtx, {
        type: 'doughnut',
        data: {
          labels: breakdown.map(b => b.category),
          datasets: [
            {
              data: breakdown.map(b => b.amount),
              backgroundColor: [
                '#ef4444', '#f59e0b', '#10b981', '#3b82f6',
                '#8b5cf6', '#ec4899', '#22c55e', '#14b8a6',
              ],
              borderColor: '#0b1220',
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              labels: { color: '#e5e7eb' },
            },
          },
        },
      });
    }

    // Monthly line chart
    const series = this.analyticsEngine.getMonthlySeries(transactions);
    const monthCtx = document.getElementById('monthChart');
    if (monthCtx) {
      if (this.monthChart) this.monthChart.destroy();
      this.monthChart = new Chart(monthCtx, {
        type: 'line',
        data: {
          labels: series.labels,
          datasets: [
            {
              label: 'Income',
              data: series.income,
              borderColor: '#22c55e',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              tension: 0.4,
            },
            {
              label: 'Expenses',
              data: series.expenses,
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              labels: { color: '#e5e7eb' },
            },
          },
          scales: {
            x: {
              ticks: { color: '#9ca3af' },
              grid: { color: '#1f2937' },
            },
            y: {
              ticks: { color: '#9ca3af' },
              grid: { color: '#1f2937' },
            },
          },
        },
      });
    }
  }

  /**
   * Called when dashboard is shown
   */
  onShow() {
    const transactions = this.storage.loadTransactions();
    this.render(transactions);
  }
}
