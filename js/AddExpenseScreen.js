/**
 * AddExpenseScreen Class
 * Form to add/edit transactions with AI-simulated receipt scanning and categorization
 */
class AddExpenseScreen {
  constructor(ui, storage, onTransactionAdded) {
    this.ui = ui;
    this.storage = storage;
    this.onTransactionAdded = onTransactionAdded;
    this.editingId = null;
    this.categories = {
      income: ['Salary', 'Business', 'Investments', 'Gifts', 'Other'],
      expense: ['Bills', 'Food', 'Shopping', 'Travel', 'Entertainment', 'Healthcare', 'Other'],
    };
  }

  /**
   * Render the add expense screen
   */
  render() {
    const container = this.ui.$('#screen-add-expense');
    if (!container) return;

    const todayStr = this.ui.getTodayString();

    let html = `
      <div class="form-header">
        <h2>Add Transaction</h2>
        <p class="subtitle">Track your income and expenses</p>
      </div>

      <form id="expenseForm" class="form">
        <!-- AI Receipt Scanner (Simulated) -->
        <div class="ai-section">
          <h3>📸 AI Receipt Scanner (Simulated)</h3>
          <div class="upload-area">
            <input type="file" id="receiptFile" accept="image/*" style="display: none;">
            <button type="button" class="btn upload-btn" id="uploadBtn">
              📤 Upload Receipt Image
            </button>
            <div id="receiptPreview" style="display: none; margin-top: 1rem;">
              <img id="previewImg" style="max-width: 200px; border-radius: 8px;">
            </div>
          </div>
        </div>

        <!-- Main Form -->
        <div class="form-row">
          <div class="form-group">
            <label for="type">Transaction Type</label>
            <select id="type" name="type" required>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div class="form-group">
            <label for="category">Category</label>
            <select id="category" name="category" required>
              <option value="">Select category</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="amount">Amount</label>
            <input id="amount" name="amount" type="number" step="0.01" min="0" placeholder="0.00" required>
          </div>
          <div class="form-group">
            <label for="date">Date</label>
            <input id="date" name="date" type="date" value="${todayStr}" required>
          </div>
        </div>

        <div class="form-group">
          <label for="note">Description</label>
          <input id="note" name="note" type="text" placeholder="What was this for? (optional)">
        </div>

        <!-- AI Auto-Categorization (Simulated) -->
        <div id="aiSuggestion" style="display: none; margin-top: 1rem;">
          <div class="ai-badge">✨ AI Suggestion</div>
          <div class="suggestion-box">
            <p id="suggestionText"></p>
            <button type="button" class="btn btn-sm" id="acceptSuggestion">Accept</button>
            <button type="button" class="btn btn-sm" id="dismissSuggestion">Dismiss</button>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Save Transaction</button>
          <button type="button" class="btn" id="cancelEdit" style="display: none;">Cancel</button>
        </div>
      </form>
    `;

    container.innerHTML = html;
    this.attachEventListeners();
    this.updateCategories();
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const form = this.ui.$('#expenseForm');
    const typeSelect = this.ui.$('#type');
    const receiptFile = this.ui.$('#receiptFile');
    const uploadBtn = this.ui.$('#uploadBtn');
    const noteInput = this.ui.$('#note');

    typeSelect.addEventListener('change', () => this.updateCategories());

    form.addEventListener('submit', e => this.handleSubmit(e));

    uploadBtn.addEventListener('click', e => {
      e.preventDefault();
      receiptFile.click();
    });

    receiptFile.addEventListener('change', e => this.handleReceiptUpload(e));

    noteInput.addEventListener('input', e => this.simulateAICategorizaton(e.target.value));

    const acceptBtn = this.ui.$('#acceptSuggestion');
    const dismissBtn = this.ui.$('#dismissSuggestion');

    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => this.acceptAISuggestion());
    }
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        this.ui.$('#aiSuggestion').style.display = 'none';
      });
    }
  }

  /**
   * Update category dropdown based on type
   */
  updateCategories() {
    const type = this.ui.$('#type').value;
    const categorySelect = this.ui.$('#category');
    const cats = this.categories[type] || [];

    categorySelect.innerHTML = '<option value="">Select category</option>';
    for (const cat of cats) {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      categorySelect.appendChild(opt);
    }
  }

  /**
   * Simulate AI receipt scanning and categorization
   */
  handleReceiptUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      const preview = this.ui.$('#receiptPreview');
      const img = this.ui.$('#previewImg');
      img.src = e.target.result;
      preview.style.display = 'block';

      // Simulate AI extraction
      this.simulateReceiptParsing();
    };
    reader.readAsDataURL(file);
  }

  /**
   * Simulate AI parsing of receipt (random category/amount)
   */
  simulateReceiptParsing() {
    const categories = this.categories.expense;
    const randomCat = categories[Math.floor(Math.random() * categories.length)];
    const randomAmount = (Math.random() * 100 + 5).toFixed(2);

    this.ui.$('#category').value = randomCat;
    this.ui.$('#amount').value = randomAmount;

    this.ui.showToast(`✨ Receipt scanned! Category: ${randomCat}, Amount: $${randomAmount}`, 'info');
  }

  /**
   * Simulate AI auto-categorization based on note
   */
  simulateAICategorizaton(note) {
    if (note.length < 3) {
      this.ui.$('#aiSuggestion').style.display = 'none';
      return;
    }

    const keywords = {
      Food: ['lunch', 'dinner', 'breakfast', 'coffee', 'eat', 'pizza', 'burger', 'restaurant'],
      Shopping: ['buy', 'purchase', 'shop', 'store', 'amazon', 'mall', 'shirt', 'shoes', 'clothes'],
      Travel: ['taxi', 'uber', 'gas', 'train', 'flight', 'hotel', 'car', 'transit', 'drive'],
      Entertainment: ['movie', 'game', 'theater', 'concert', 'show', 'ticket', 'cinema'],
      Healthcare: ['doctor', 'hospital', 'medicine', 'pharmacy', 'health', 'dental', 'clinic'],
      Bills: ['utility', 'electricity', 'water', 'internet', 'phone', 'rent', 'subscription'],
    };

    const noteLower = note.toLowerCase();
    let suggestedCat = null;

    for (const [cat, words] of Object.entries(keywords)) {
      if (words.some(w => noteLower.includes(w))) {
        suggestedCat = cat;
        break;
      }
    }

    if (suggestedCat && this.categories.expense.includes(suggestedCat)) {
      this.ui.$('#aiSuggestion').style.display = 'block';
      this.ui.$('#suggestionText').textContent = `Based on "${note}", I suggest: ${suggestedCat}`;
      this.currentSuggestion = suggestedCat;
    } else {
      this.ui.$('#aiSuggestion').style.display = 'none';
    }
  }

  /**
   * Accept AI suggestion
   */
  acceptAISuggestion() {
    if (this.currentSuggestion) {
      this.ui.$('#category').value = this.currentSuggestion;
      this.ui.$('#aiSuggestion').style.display = 'none';
      this.ui.showToast(`✨ Category set to ${this.currentSuggestion}`, 'info');
    }
  }

  /**
   * Handle form submission
   */
  handleSubmit(e) {
    e.preventDefault();

    const type = this.ui.$('#type').value;
    const category = this.ui.$('#category').value;
    const amount = parseFloat(this.ui.$('#amount').value);
    const date = this.ui.$('#date').value;
    const note = this.ui.$('#note').value.trim();

    if (!type || !category || !isFinite(amount) || amount <= 0 || !date) {
      this.ui.showToast('❌ Please fill in all required fields', 'error');
      return;
    }

    const txData = { type, category, amount, date, note };
    let tx;

    if (this.editingId) {
      // Edit existing
      tx = new Transaction({ ...txData, id: this.editingId });
    } else {
      // Create new
      tx = new Transaction(txData);
    }

    const validation = tx.validate();
    if (!validation.valid) {
      this.ui.showToast(`❌ ${validation.errors.join(', ')}`, 'error');
      return;
    }

    const transactions = this.storage.loadTransactions();
    if (this.editingId) {
      const idx = transactions.findIndex(t => t.id === this.editingId);
      if (idx > -1) {
        transactions[idx] = tx;
      }
    } else {
      transactions.push(tx);
    }

    this.storage.saveTransactions(transactions);
    this.ui.showToast(
      this.editingId ? '✅ Transaction updated' : '✅ Transaction added',
      'success'
    );

    // Reset form
    this.editingId = null;
    this.ui.$('#expenseForm').reset();
    this.ui.$('#date').value = this.ui.getTodayString();
    this.ui.$('#cancelEdit').style.display = 'none';
    this.updateCategories();

    if (this.onTransactionAdded) {
      this.onTransactionAdded();
    }
  }

  /**
   * Load transaction for editing
   */
  editTransaction(transactionId) {
    const transactions = this.storage.loadTransactions();
    const tx = transactions.find(t => t.id === transactionId);

    if (!tx) return;

    this.editingId = tx.id;
    this.ui.$('#type').value = tx.type;
    this.updateCategories();
    this.ui.$('#category').value = tx.category;
    this.ui.$('#amount').value = tx.amount;
    this.ui.$('#date').value = tx.date;
    this.ui.$('#note').value = tx.note || '';

    this.ui.$('#expenseForm button[type="submit"]').textContent = 'Update Transaction';
    this.ui.$('#cancelEdit').style.display = 'inline-block';
    this.ui.$('#cancelEdit').addEventListener('click', () => this.cancelEdit());

    this.ui.switchTab('add-expense');
  }

  /**
   * Cancel editing
   */
  cancelEdit() {
    this.editingId = null;
    this.ui.$('#expenseForm').reset();
    this.ui.$('#date').value = this.ui.getTodayString();
    this.ui.$('#expenseForm button[type="submit"]').textContent = 'Save Transaction';
    this.ui.$('#cancelEdit').style.display = 'none';
    this.updateCategories();
  }

  /**
   * Called when screen is shown
   */
  onShow() {
    this.render();
  }
}
