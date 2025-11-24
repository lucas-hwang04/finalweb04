/**
 * AnalyticsScreen Class
 * Displays detailed analytics, trends, and spending breakdowns
 */
class AnalyticsScreen {
  constructor(ui, analytics) {
    this.ui = ui;
    this.analytics = analytics;
    this.charts = {};
    this.selectedFilter = 'month'; // 'week', 'month', 'year'
  }

  // Render the analytics screen
  render(transactions) {
    const container = this.ui.$('[data-screen="analytics"]');
    if (!container) return;

    const kpis = this.analytics.calculateKPIs(transactions);
    const categoryData = this.analytics.getSpendingByCategory(transactions);
    const monthlyData = this.analytics.getMonthlyTrend(transactions);

    let html = `
      <div class="analytics-content">
        <!-- Time Period Filters -->
        <section class="card">
          <div class="filter-buttons">
            <button class="filter-btn active" data-filter="week">📅 Week</button>
            <button class="filter-btn" data-filter="month">📆 Month</button>
            <button class="filter-btn" data-filter="year">📊 Year</button>
          </div>
        </section>

        <!-- KPI Cards -->
        <section class="card span-2">
          <h2 class="card-title">📈 Key Metrics</h2>
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-label">Total Income</div>
              <div class="kpi-value positive">${this.ui.formatMoney(kpis.income)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Total Expenses</div>
              <div class="kpi-value negative">${this.ui.formatMoney(kpis.totalExpenses)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Net Balance</div>
              <div class="kpi-value">${this.ui.formatMoney(kpis.balance)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Avg Expense</div>
              <div class="kpi-value">${this.ui.formatMoney(kpis.avgExpense)}</div>
            </div>
          </div>
        </section>

        <!-- Charts Section -->
        <section class="card span-2">
          <div class="charts-grid">
            <!-- Spending by Category Pie Chart -->
            <div class="chart-container">
              <h3 class="chart-title">💰 Spending by Category</h3>
              <canvas id="categoryChart" width="200" height="200"></canvas>
            </div>

            <!-- Monthly Trend Line Chart -->
            <div class="chart-container">
              <h3 class="chart-title">📊 Monthly Trend (Last 6 Months)</h3>
              <canvas id="trendChart" width="400" height="200"></canvas>
            </div>
          </div>
        </section>

        <!-- Category Breakdown -->
        <section class="card span-2">
          <h2 class="card-title">🏷️ Category Breakdown</h2>
          <div class="category-breakdown">
            ${categoryData.labels.map((label, idx) => {
              const value = categoryData.values[idx];
              const color = this.analytics.getCategoryColor(idx);
              const percentage = categoryData.values.reduce((a, b) => a + b, 0) > 0 
                ? (value / categoryData.values.reduce((a, b) => a + b, 0)) * 100 
                : 0;
              return `
                <div class="category-row">
                  <div class="category-info">
                    <div class="category-name">${label}</div>
                    <div class="category-bar">
                      <div class="category-fill" style="width: ${percentage}%; background-color: ${color};"></div>
                    </div>
                  </div>
                  <div class="category-amount">${this.ui.formatMoney(value)}</div>
                </div>
              `;
            }).join('')}
          </div>
        </section>
      </div>
    `;

    container.innerHTML = html;

    // Attach filter button listeners
    this.attachFilterListeners();

    // Initialize charts
    setTimeout(() => {
      this.renderCharts(categoryData, monthlyData);
    }, 100);
  }

  // Attach filter button event listeners
  attachFilterListeners() {
    const filterBtns = this.ui.$$('[data-filter]');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.selectedFilter = e.target.dataset.filter;
        this.ui.showToast(`Filtering by ${e.target.dataset.filter}...`, 'info', 1500);
      });
    });
  }

  // Render charts using Chart.js
  renderCharts(categoryData, monthlyData) {
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded');
      return;
    }

    // Destroy existing charts
    Object.values(this.charts).forEach(chart => chart?.destroy?.());
    this.charts = {};

    // Category pie chart
    const catCtx = this.ui.$('#categoryChart');
    if (catCtx) {
      this.charts.categoryChart = new Chart(catCtx, {
        type: 'pie',
        data: {
          labels: categoryData.labels,
          datasets: [{
            data: categoryData.values,
            backgroundColor: categoryData.labels.map((_, i) => this.analytics.getCategoryColor(i)),
            borderColor: '#0b1220',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { labels: { color: '#e5e7eb' } }
          }
        }
      });
    }

    // Monthly trend line chart
    const trendCtx = this.ui.$('#trendChart');
    if (trendCtx) {
      this.charts.trendChart = new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: monthlyData.labels,
          datasets: [
            {
              label: 'Income',
              data: monthlyData.income,
              borderColor: '#22c55e',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              tension: 0.4
            },
            {
              label: 'Expenses',
              data: monthlyData.expenses,
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { labels: { color: '#e5e7eb' } }
          },
          scales: {
            x: { ticks: { color: '#9ca3af' }, grid: { color: '#1f2937' } },
            y: { ticks: { color: '#9ca3af' }, grid: { color: '#1f2937' } }
          }
        }
      });
    }
  }
}
