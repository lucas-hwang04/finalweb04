/**
 * SearchScreen Class
 * Search and advanced filtering with NLP-simulated suggestions
 */
class SearchScreen {
  constructor(ui, storage) {
    this.ui = ui;
    this.storage = storage;
    this.filters = {
      query: '',
      category: '',
      minAmount: 0,
      maxAmount: Infinity,
      startDate: '',
      endDate: '',
      type: '',
    };
  }

  /**
   * Render search screen
   */
  render(transactions) {
    const container = this.ui.$('#screen-search');
    if (!container) return;

    const filtered = this.filterTransactions(transactions);

    const categories = [...new Set(transactions.map(t => t.category))].sort();
    const types = ['income', 'expense'];

    let html = `
      <div class="search-header">
        <h2>Search & Filter</h2>
        <p class="subtitle">Find transactions with advanced filters</p>
      </div>

      <!-- Search Bar -->
      <div class="search-bar">
        <input type="text" id="searchInput" class="search-input" placeholder="Search by note or description..." value="${this.filters.query}">
      </div>

      <!-- Quick Filter Buttons -->
      <div class="quick-filters">
        <button class="quick-btn ${this.filters.type === '' ? 'active' : ''}" data-type="">All</button>
        <button class="quick-btn ${this.filters.type === 'income' ? 'active' : ''}" data-type="income">📈 Income</button>
        <button class="quick-btn ${this.filters.type === 'expense' ? 'active' : ''}" data-type="expense">📉 Expense</button>
      </div>

      <!-- Advanced Filters -->
      <div class="filters-section">
        <h3>Advanced Filters</h3>
        <div class="filter-grid">
          <div class="filter-group">
            <label>Category</label>
            <select id="filterCategory">
              <option value="">All Categories</option>
    `;

    for (const cat of categories) {
      html += `<option value="${cat}" ${this.filters.category === cat ? 'selected' : ''}>${cat}</option>`;
    }

    html += `
            </select>
          </div>

          <div class="filter-group">
            <label>Min Amount</label>
            <input type="number" id="filterMinAmount" placeholder="0" value="${this.filters.minAmount === 0 ? '' : this.filters.minAmount}">
          </div>

          <div class="filter-group">
            <label>Max Amount</label>
            <input type="number" id="filterMaxAmount" placeholder="999999" value="${this.filters.maxAmount === Infinity ? '' : this.filters.maxAmount}">
          </div>

          <div class="filter-group">
            <label>Start Date</label>
            <input type="date" id="filterStartDate" value="${this.filters.startDate}">
          </div>

          <div class="filter-group">
            <label>End Date</label>
            <input type="date" id="filterEndDate" value="${this.filters.endDate}">
          </div>
        </div>

        <div class="filter-actions">
          <button class="btn btn-primary" id="applyFilters">Apply Filters</button>
          <button class="btn" id="clearFilters">Clear All</button>
        </div>
      </div>

      <!-- Active Filters Display -->
      <div id="activeFilters" class="active-filters" style="display: ${this.hasActiveFilters() ? 'block' : 'none'}">
        <div class="filters-label">Active Filters:</div>
        <div id="filterBadges" class="filter-badges"></div>
      </div>

      <!-- Results -->
      <div class="results-section">
        <div class="results-header">
          <h3>Results</h3>
          <span class="result-count">${filtered.length} ${filtered.length === 1 ? 'transaction' : 'transactions'}</span>
        </div>
    `;

    if (filtered.length > 0) {
      const total = filtered.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
      html += `<div class="results-total">Total: <strong>${this.ui.formatMoney(total)}</strong></div>`;

      html += `<div class="results-list">`;
      for (const tx of filtered) {
        const sign = tx.type === 'income' ? '+' : '-';
        const amountClass = tx.type === 'income' ? 'positive' : 'negative';
        html += `
          <div class="result-item">
            <div class="result-left">
              <div class="result-note">${tx.note || 'No description'}</div>
              <div class="result-meta">${tx.category} • ${this.ui.formatDate(tx.date)}</div>
            </div>
            <div class="result-right">
              <div class="result-amount ${amountClass}">${sign}${this.ui.formatMoney(Math.abs(tx.amount))}</div>
              <div class="result-type">${tx.type}</div>
            </div>
          </div>
        `;
      }
      html += `</div>`;
    } else {
      html += `<div class="empty-state">No transactions match your filters.</div>`;
    }

    html += `
      </div>
    `;

    container.innerHTML = html;
    this.attachEventListeners();
    this.renderFilterBadges();
  }

  /**
   * Filter transactions based on current filters
   */
  filterTransactions(transactions) {
    return transactions.filter(t => {
      // Text search
      if (this.filters.query) {
        const query = this.filters.query.toLowerCase();
        const match =
          (t.note && t.note.toLowerCase().includes(query)) ||
          (t.category && t.category.toLowerCase().includes(query));
        if (!match) return false;
      }

      // Category filter
      if (this.filters.category && t.category !== this.filters.category) {
        return false;
      }

      // Amount filters
      if (t.amount < this.filters.minAmount || t.amount > this.filters.maxAmount) {
        return false;
      }

      // Date filters
      if (this.filters.startDate && t.date < this.filters.startDate) {
        return false;
      }
      if (this.filters.endDate && t.date > this.filters.endDate) {
        return false;
      }

      // Type filter
      if (this.filters.type && t.type !== this.filters.type) {
        return false;
      }

      return true;
    });
  }

  /**
   * Check if any filters are active
   */
  hasActiveFilters() {
    return (
      this.filters.query ||
      this.filters.category ||
      this.filters.minAmount > 0 ||
      this.filters.maxAmount < Infinity ||
      this.filters.startDate ||
      this.filters.endDate ||
      this.filters.type
    );
  }

  /**
   * Render active filter badges
   */
  renderFilterBadges() {
    const badgesContainer = this.ui.$('#filterBadges');
    if (!badgesContainer) return;

    const badges = [];
    if (this.filters.query) badges.push(`Search: "${this.filters.query}"`);
    if (this.filters.category) badges.push(`Category: ${this.filters.category}`);
    if (this.filters.minAmount > 0) badges.push(`Min: ${this.ui.formatMoney(this.filters.minAmount)}`);
    if (this.filters.maxAmount < Infinity) badges.push(`Max: ${this.ui.formatMoney(this.filters.maxAmount)}`);
    if (this.filters.startDate) badges.push(`From: ${this.ui.formatDate(this.filters.startDate)}`);
    if (this.filters.endDate) badges.push(`To: ${this.ui.formatDate(this.filters.endDate)}`);
    if (this.filters.type) badges.push(`Type: ${this.filters.type}`);

    badgesContainer.innerHTML = badges.map(b => `<span class="filter-badge">${b}</span>`).join('');
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const searchInput = this.ui.$('#searchInput');
    const filterBtns = this.ui.$$('.quick-btn');
    const applyBtn = this.ui.$('#applyFilters');
    const clearBtn = this.ui.$('#clearFilters');

    // Real-time search
    searchInput?.addEventListener('input', e => {
      this.filters.query = e.target.value;
      const transactions = this.storage.loadTransactions();
      this.render(transactions);
    });

    // Quick filter buttons
    for (const btn of filterBtns) {
      btn.addEventListener('click', e => {
        this.filters.type = e.target.dataset.type;
        const transactions = this.storage.loadTransactions();
        this.render(transactions);
      });
    }

    // Apply advanced filters
    applyBtn?.addEventListener('click', () => {
      this.filters.category = this.ui.$('#filterCategory').value;
      this.filters.minAmount = parseFloat(this.ui.$('#filterMinAmount').value) || 0;
      this.filters.maxAmount = parseFloat(this.ui.$('#filterMaxAmount').value) || Infinity;
      this.filters.startDate = this.ui.$('#filterStartDate').value;
      this.filters.endDate = this.ui.$('#filterEndDate').value;

      const transactions = this.storage.loadTransactions();
      this.render(transactions);
    });

    // Clear filters
    clearBtn?.addEventListener('click', () => {
      this.filters = {
        query: '',
        category: '',
        minAmount: 0,
        maxAmount: Infinity,
        startDate: '',
        endDate: '',
        type: '',
      };
      const transactions = this.storage.loadTransactions();
      this.render(transactions);
    });
  }

  /**
   * Called when screen is shown
   */
  onShow() {
    const transactions = this.storage.loadTransactions();
    this.render(transactions);
  }
}
