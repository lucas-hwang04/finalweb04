/**
 * AnalyticsScreen Class
 * Advanced analytics with time period filters, trends, and recommendations
 */
class AnalyticsScreen {
  constructor(ui, storage, analyticsEngine, budgetManager) {
    this.ui = ui;
    this.storage = storage;
    this.analyticsEngine = analyticsEngine;
    this.budgetManager = budgetManager;
    this.currentPeriod = 'month';
    this.trendChart = null;
    this.budgetChart = null;
  }

  /**
   * Render analytics screen
   */
  render(transactions) {
    const container = this.ui.$('#screen-analytics');
    if (!container) return;

    const now = new Date();
    let startDate, endDate, periodLabel;

    // Determine date range based on period
    if (this.currentPeriod === 'week') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay());
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      periodLabel = 'This Week';
    } else if (this.currentPeriod === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      periodLabel = 'This Month';
    } else if (this.currentPeriod === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
      periodLabel = 'This Year';
    }

    // Filter transactions in range
    const filtered = transactions.filter(t => {
      const txDate = new Date(t.date);
      return txDate >= startDate && txDate <= endDate;
    });

    const income = filtered
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = filtered
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expenses;

    const breakdown = this.analyticsEngine.getCategoryBreakdown(
      transactions,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );

    const recommendations = this.analyticsEngine.getRecommendations(
      transactions,
      this.budgetManager
    );

    let html = `
      <div class="analytics-header">
        <h2>Analytics</h2>
        <div class="period-filters">
          <button class="filter-btn ${this.currentPeriod === 'week' ? 'active' : ''}" data-period="week">Week</button>
          <button class="filter-btn ${this.currentPeriod === 'month' ? 'active' : ''}" data-period="month">Month</button>
          <button class="filter-btn ${this.currentPeriod === 'year' ? 'active' : ''}" data-period="year">Year</button>
        </div>
      </div>

      <div class="period-label">${periodLabel}</div>

      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="summary-card">
          <div class="card-label">Income</div>
          <div class="card-value positive">${this.ui.formatMoney(income)}</div>
        </div>
        <div class="summary-card">
          <div class="card-label">Expenses</div>
          <div class="card-value negative">${this.ui.formatMoney(expenses)}</div>
        </div>
        <div class="summary-card">
          <div class="card-label">Balance</div>
          <div class="card-value ${balance >= 0 ? 'positive' : 'negative'}">${this.ui.formatMoney(balance)}</div>
        </div>
      </div>

      <!-- Charts -->
      <div class="charts-row">
        <div class="chart-box">
          <h3>Spending Trend</h3>
          <canvas id="trendChart" height="150"></canvas>
        </div>
        <div class="chart-box">
          <h3>Top Categories</h3>
          <canvas id="topCategoriesChart" height="150"></canvas>
        </div>
      </div>

      <!-- Category Breakdown -->
      <div class="section">
        <h3>Category Breakdown</h3>
        <div class="category-breakdown">
    `;

    for (const item of breakdown) {
      const pct = expenses > 0 ? ((item.amount / expenses) * 100).toFixed(1) : 0;
      html += `
        <div class="breakdown-item">
          <div class="breakdown-info">
            <span class="breakdown-category">${item.category}</span>
            <div class="breakdown-amounts">
              <span class="amount">${this.ui.formatMoney(item.amount)}</span>
              <span class="percent">${pct}%</span>
            </div>
          </div>
          <div class="breakdown-bar">
            <div class="breakdown-fill" style="width: ${pct}%"></div>
          </div>
        </div>
      `;
    }

    html += `
        </div>
      </div>

      <!-- AI Recommendations -->
      <div class="section">
        <h3>✨ AI Recommendations</h3>
        <div class="recommendations-list">
    `;

    for (const rec of recommendations) {
      html += `
        <div class="recommendation-card rec-${rec.type}">
          <div class="rec-icon">${rec.icon}</div>
          <div class="rec-content">
            <div class="rec-title">${rec.title}</div>
            <div class="rec-message">${rec.message}</div>
          </div>
        </div>
      `;
    }

    html += `
        </div>
      </div>
    `;

    container.innerHTML = html;
    this.attachEventListeners();
    this.renderCharts(transactions);
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const filterBtns = this.ui.$$('.filter-btn');
    for (const btn of filterBtns) {
      btn.addEventListener('click', e => {
        const period = e.target.dataset.period;
        this.currentPeriod = period;
        const transactions = this.storage.loadTransactions();
        this.render(transactions);
      });
    }
  }

  /**
   * Render charts
   */
  renderCharts(transactions) {
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded');
      return;
    }

    // Trend chart
    let series;
    if (this.currentPeriod === 'week') {
      series = this.analyticsEngine.getWeeklySeries(transactions);
    } else {
      series = this.analyticsEngine.getMonthlySeries(transactions);
    }

    const trendCtx = document.getElementById('trendChart');
    if (trendCtx) {
      if (this.trendChart) this.trendChart.destroy();
      this.trendChart = new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: series.labels,
          datasets: [
            {
              label: 'Expenses',
              data: series.expenses,
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#e5e7eb' } },
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

    // Top categories chart
    const breakdown = this.analyticsEngine.getCategoryBreakdown(
      transactions,
      new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
    );

    const topCatsCtx = document.getElementById('topCategoriesChart');
    if (topCatsCtx && breakdown.length > 0) {
      if (this.budgetChart) this.budgetChart.destroy();
      this.budgetChart = new Chart(topCatsCtx, {
        type: 'bar',
        data: {
          labels: breakdown.slice(0, 5).map(b => b.category),
          datasets: [
            {
              label: 'Amount',
              data: breakdown.slice(0, 5).map(b => b.amount),
              backgroundColor: '#3b82f6',
              borderColor: '#1e40af',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          plugins: {
            legend: { labels: { color: '#e5e7eb' } },
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
   * Called when screen is shown
   */
  onShow() {
    const transactions = this.storage.loadTransactions();
    this.render(transactions);
  }
}
