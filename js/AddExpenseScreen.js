/**
 * AddExpenseScreen Class
 * Handles adding and editing transactions
 */
class AddExpenseScreen {
  constructor(ui, storage) {
    this.ui = ui;
    this.storage = storage;
    this.categories = {
      income: ['Salary', 'Business', 'Investments', 'Gifts', 'Other'],
      expense: ['Bills', 'Food', 'Shopping', 'Travel', 'Entertainment', 'Healthcare', 'Other']
    };
    this.editingTransaction = null;
  }

  // Render the add expense screen
  render(transactions) {
    const container = this.ui.$('[data-screen="add-expense"]');
    if (!container) return;

    let html = `
      <div class="add-expense-content">
        <section class="card">
          <h2 class="card-title">➕ Add Transaction</h2>
          <form id="add-expense-form" class="form">
            <div class="form-row">
              <label for="tx-type">Type</label>
              <select id="tx-type" name="type" required>
                <option value="income">💰 Income</option>
                <option value="expense">💸 Expense</option>
              </select>
            </div>

            <div class="form-row">
              <label for="tx-category">Category</label>
              <select id="tx-category" name="category" required>
                ${this.categories.expense.map(c => `<option value="${c}">${c}</option>`).join('')}
              </select>
            </div>

            <div class="form-row">
              <label for="tx-amount">Amount ($)</label>
              <input id="tx-amount" name="amount" type="number" step="0.01" min="0" placeholder="0.00" required />
            </div>

            <div class="form-row">
              <label for="tx-date">Date</label>
              <input id="tx-date" name="date" type="date" value="${this.ui.getTodayDate()}" required />
            </div>

            <div class="form-row">
              <label for="tx-note">Note (optional)</label>
              <input id="tx-note" name="note" type="text" placeholder="What was this for?" />
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary">
                <span id="form-submit-text">✅ Add Transaction</span>
              </button>
              <button type="reset" class="btn btn-secondary" onclick="document.getElementById('add-expense-form').reset();">
                Clear
              </button>
            </div>
          </form>
        </section>

        <!-- AI Receipt Scanning (Simulated) -->
        <section class="card">
          <h2 class="card-title">🤖 AI Receipt Scanning</h2>
          <div class="ai-feature">
            <div class="ai-badge">✨ AI Feature</div>
            <p>Upload a receipt image and our AI will automatically extract:</p>
            <ul class="ai-benefits">
              <li>💳 Merchant name & category</li>
              <li>🏷️ Item descriptions</li>
              <li>💰 Total amount</li>
              <li>📅 Transaction date</li>
            </ul>
            <p style="color: var(--muted); font-size: 0.9rem; margin-top: 1rem;">
              <em>Demo: Receipt scanning feature is simulated in this version</em>
            </p>
          </div>
        </section>
      </div>
    `;

    container.innerHTML = html;

    // Attach event listeners
    this.attachEventListeners();
  }

  // Attach form event listeners
  attachEventListeners() {
    const form = this.ui.$('#add-expense-form');
    const typeSelect = this.ui.$('#tx-type');

    // Handle type change to update categories
    typeSelect.addEventListener('change', () => {
      this.updateCategories();
    });

    // Handle form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }

  // Update category dropdown based on type
  updateCategories() {
    const typeSelect = this.ui.$('#tx-type');
    const categorySelect = this.ui.$('#tx-category');
    const type = typeSelect.value;
    const cats = this.categories[type] || [];

    categorySelect.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');
  }

  // Handle form submission
  handleSubmit() {
    const type = this.ui.$('#tx-type').value;
    const category = this.ui.$('#tx-category').value;
    const amount = parseFloat(this.ui.$('#tx-amount').value);
    const date = this.ui.$('#tx-date').value;
    const note = this.ui.$('#tx-note').value.trim();

    // Validation
    if (!type || !category || !isFinite(amount) || amount <= 0 || !date) {
      this.ui.showToast('Please fill in all required fields correctly', 'error');
      return;
    }

    // Dispatch custom event for App to handle
    const event = new CustomEvent('transactionSubmit', {
      detail: { type, category, amount, date, note, isEdit: !!this.editingTransaction }
    });
    document.dispatchEvent(event);

    // Reset form
    this.ui.$('#add-expense-form').reset();
    this.ui.showToast('Transaction added successfully! ✅', 'success');
  }

  // Set form to edit mode
  setEditMode(transaction) {
    this.editingTransaction = transaction;
    this.ui.$('#tx-type').value = transaction.type;
    this.updateCategories();
    this.ui.$('#tx-category').value = transaction.category;
    this.ui.$('#tx-amount').value = transaction.amount;
    this.ui.$('#tx-date').value = transaction.date;
    this.ui.$('#tx-note').value = transaction.note;
    this.ui.$('#form-submit-text').textContent = '💾 Update Transaction';
  }

  // Clear edit mode
  clearEditMode() {
    this.editingTransaction = null;
    this.ui.$('#form-submit-text').textContent = '✅ Add Transaction';
  }
}
