/**
 * SearchScreen Class
 * Provides search, filtering, and advanced query capabilities
 */
class SearchScreen {
  constructor(ui) {
    this.ui = ui;
    this.filters = {
      category: null,
      startDate: null,
      endDate: null,
      minAmount: null,
      maxAmount: null,
      type: null
    };
    this.searchQuery = '';
  }

  // Render the search screen
  render(transactions) {
    const container = this.ui.$('[data-screen="search"]');
    if (!container) return;

    const filteredResults = this.applyFilters(transactions);

    let html = `
      <div class="search-content">
        <!-- Search Bar -->
        <section class="card">
          <h2 class="card-title">🔍 Search & Filter</h2>
          <input 
            type="text" 
            id="search-input" 
            class="search-input" 
            placeholder="Search transactions by note or category..."
          />
        </section>

        <!-- Quick Filter Buttons -->
        <section class="card">
          <div class="quick-filters">
            <button class="quick-filter-btn active" data-type="all">All Transactions</button>
            <button class="quick-filter-btn" data-type="income">💰 Income</button>
            <button class="quick-filter-btn" data-type="expense">💸 Expenses</button>
          </div>
        </section>

        <!-- Advanced Filters -->
        <section class="card span-2">
          <h3 class="filter-title">⚙️ Advanced Filters</h3>
          <div class="filters-grid">
            <div class="filter-group">
              <label>Category</label>
              <select id="filter-category">
                <option value="">All Categories</option>
                ${[...new Set(transactions.map(t => t.category))].map(c => 
                  `<option value="${c}">${c}</option>`
                ).join('')}
              </select>
            </div>

            <div class="filter-group">
              <label>Start Date</label>
              <input type="date" id="filter-start-date" />
            </div>

            <div class="filter-group">
              <label>End Date</label>
              <input type="date" id="filter-end-date" />
            </div>

            <div class="filter-group">
              <label>Min Amount ($)</label>
              <input type="number" id="filter-min-amount" step="0.01" min="0" />
            </div>

            <div class="filter-group">
              <label>Max Amount ($)</label>
              <input type="number" id="filter-max-amount" step="0.01" min="0" />
            </div>

            <div class="filter-group">
              <label>&nbsp;</label>
              <button class="btn btn-secondary" id="clear-filters">Clear Filters</button>
            </div>
          </div>
        </section>

        <!-- Active Filters Display -->
        ${Object.values(this.filters).some(f => f !== null) ? `
          <section class="card">
            <div class="active-filters">
              ${this.filters.category ? `<span class="filter-badge">${this.filters.category} <button onclick="event.stopPropagation()">×</button></span>` : ''}
              ${this.filters.type ? `<span class="filter-badge">${this.filters.type} <button onclick="event.stopPropagation()">×</button></span>` : ''}
              ${this.filters.startDate ? `<span class="filter-badge">From ${this.filters.startDate} <button onclick="event.stopPropagation()">×</button></span>` : ''}
              ${this.filters.endDate ? `<span class="filter-badge">To ${this.filters.endDate} <button onclick="event.stopPropagation()">×</button></span>` : ''}
            </div>
          </section>
        ` : ''}

        <!-- Search Results -->
        <section class="card span-2">
          <h3 class="results-title">
            🔎 Results <span class="results-count">(${filteredResults.length} found, ${filteredResults.reduce((sum, t) => sum + t.amount, 0).toLocaleString('en-US', {style: 'currency', currency: 'USD'})} total)</span>
          </h3>
          ${filteredResults.length > 0 ? `
            <ul class="transaction-list">
              ${filteredResults.map(tx => `
                <li class="transaction-item">
                  <div class="tx-info">
                    <div class="tx-title">${tx.note || tx.category}</div>
                    <div class="tx-meta">${tx.category} • ${this.ui.formatDate(tx.date)} • ${tx.type}</div>
                  </div>
                  <div class="tx-actions">
                    <div class="tx-amount" style="color: ${tx.type === 'income' ? '#22c55e' : '#ef4444'};">
                      ${tx.type === 'income' ? '+' : '-'}${this.ui.formatMoney(tx.amount)}
                    </div>
                  </div>
                </li>
              `).join('')}
            </ul>
          ` : '<p class="empty-state">No transactions found matching your search</p>'}
        </section>
      </div>
    `;

    container.innerHTML = html;
    this.attachEventListeners(transactions);
  }

  // Attach event listeners
  attachEventListeners(transactions) {
    // Search input
    const searchInput = this.ui.$('#search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.render(transactions);
      });
    }

    // Quick filter buttons
    this.ui.$$('[data-type]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.ui.$$('[data-type]').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        const type = e.target.dataset.type;
        this.filters.type = type === 'all' ? null : type;
        this.render(transactions);
      });
    });

    // Advanced filters
    const categoryFilter = this.ui.$('#filter-category');
    const startDateFilter = this.ui.$('#filter-start-date');
    const endDateFilter = this.ui.$('#filter-end-date');
    const minAmountFilter = this.ui.$('#filter-min-amount');
    const maxAmountFilter = this.ui.$('#filter-max-amount');
    const clearBtn = this.ui.$('#clear-filters');

    if (categoryFilter) categoryFilter.addEventListener('change', (e) => {
      this.filters.category = e.target.value || null;
      this.render(transactions);
    });

    if (startDateFilter) startDateFilter.addEventListener('change', (e) => {
      this.filters.startDate = e.target.value || null;
      this.render(transactions);
    });

    if (endDateFilter) endDateFilter.addEventListener('change', (e) => {
      this.filters.endDate = e.target.value || null;
      this.render(transactions);
    });

    if (minAmountFilter) minAmountFilter.addEventListener('change', (e) => {
      this.filters.minAmount = e.target.value ? parseFloat(e.target.value) : null;
      this.render(transactions);
    });

    if (maxAmountFilter) maxAmountFilter.addEventListener('change', (e) => {
      this.filters.maxAmount = e.target.value ? parseFloat(e.target.value) : null;
      this.render(transactions);
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.filters = {
          category: null,
          startDate: null,
          endDate: null,
          minAmount: null,
          maxAmount: null,
          type: null
        };
        this.searchQuery = '';
        this.render(transactions);
      });
    }
  }

  // Apply filters to transactions
  applyFilters(transactions) {
    let results = transactions.slice();

    // Search query
    if (this.searchQuery) {
      results = results.filter(t =>
        (t.note && t.note.toLowerCase().includes(this.searchQuery)) ||
        (t.category && t.category.toLowerCase().includes(this.searchQuery))
      );
    }

    // Type filter
    if (this.filters.type) {
      results = results.filter(t => t.type === this.filters.type);
    }

    // Category filter
    if (this.filters.category) {
      results = results.filter(t => t.category === this.filters.category);
    }

    // Date range filter
    if (this.filters.startDate) {
      const startDate = new Date(this.filters.startDate);
      results = results.filter(t => new Date(t.date) >= startDate);
    }

    if (this.filters.endDate) {
      const endDate = new Date(this.filters.endDate);
      results = results.filter(t => new Date(t.date) <= endDate);
    }

    // Amount range filter
    if (this.filters.minAmount !== null) {
      results = results.filter(t => t.amount >= this.filters.minAmount);
    }

    if (this.filters.maxAmount !== null) {
      results = results.filter(t => t.amount <= this.filters.maxAmount);
    }

    return results.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
}
