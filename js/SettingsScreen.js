/**
 * SettingsScreen Class
 * User preferences, budget management, export/import, and profile settings
 */
class SettingsScreen {
  constructor(ui, storage, budgetManager) {
    this.ui = ui;
    this.storage = storage;
    this.budgetManager = budgetManager;
  }

  /**
   * Render settings screen
   */
  render() {
    const container = this.ui.$('#screen-settings');
    if (!container) return;

    const settings = this.storage.loadSettings();
    const budgets = this.budgetManager.getAllBudgets();

    let html = `
      <div class="settings-header">
        <h2>Settings</h2>
        <p class="subtitle">Manage your preferences and data</p>
      </div>

      <!-- Profile Section -->
      <div class="settings-section">
        <h3>👤 Profile</h3>
        <div class="setting-item">
          <label for="profileName">Name</label>
          <input type="text" id="profileName" placeholder="Your name (optional)">
        </div>
        <div class="setting-item">
          <label for="profileEmail">Email</label>
          <input type="email" id="profileEmail" placeholder="your@email.com (optional)">
        </div>
      </div>

      <!-- Budgets Section -->
      <div class="settings-section">
        <h3>💰 Category Budgets</h3>
        <div class="budgets-grid">
    `;

    for (const [category, budget] of Object.entries(budgets)) {
      html += `
        <div class="budget-input-group">
          <label>${category}</label>
          <div class="input-wrapper">
            <span class="currency">$</span>
            <input type="number" class="budget-input" data-category="${category}" value="${budget}" step="10" min="0">
          </div>
        </div>
      `;
    }

    html += `
        </div>
        <button class="btn btn-primary" id="saveBudgets">Save Budgets</button>
      </div>

      <!-- Preferences Section -->
      <div class="settings-section">
        <h3>⚙️ Preferences</h3>

        <div class="setting-item">
          <label for="currency">Currency</label>
          <select id="currency">
            <option value="USD" ${settings.currency === 'USD' ? 'selected' : ''}>USD ($)</option>
            <option value="EUR" ${settings.currency === 'EUR' ? 'selected' : ''}>EUR (€)</option>
            <option value="GBP" ${settings.currency === 'GBP' ? 'selected' : ''}>GBP (£)</option>
            <option value="JPY" ${settings.currency === 'JPY' ? 'selected' : ''}>JPY (¥)</option>
          </select>
        </div>

        <div class="setting-item">
          <label for="theme">Theme</label>
          <select id="theme">
            <option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>Dark</option>
            <option value="light" ${settings.theme === 'light' ? 'selected' : ''}>Light</option>
          </select>
        </div>

        <div class="setting-item toggle">
          <label for="notifications">Enable Notifications</label>
          <input type="checkbox" id="notifications" ${settings.notifications ? 'checked' : ''}>
          <span class="toggle-slider"></span>
        </div>
      </div>

      <!-- AI Features Section -->
      <div class="settings-section">
        <h3>✨ AI Features</h3>
        <p class="setting-description">Simulated AI-powered features are enabled to enhance your experience:</p>
        <ul class="feature-list">
          <li>📸 Receipt Scanning - Auto-extract amounts and categories from receipt images</li>
          <li>🤖 Auto-Categorization - Smart category suggestions based on transaction descriptions</li>
          <li>💡 Smart Insights - Personalized spending recommendations and patterns</li>
          <li>📊 Trend Analysis - Automatic detection of spending trends and anomalies</li>
        </ul>
      </div>

      <!-- Data Management Section -->
      <div class="settings-section">
        <h3>📦 Data Management</h3>

        <div class="data-action">
          <h4>Export Data</h4>
          <div class="export-options">
            <button class="btn" id="exportCSV">📥 Export as CSV</button>
            <button class="btn" id="exportJSON">📥 Export as JSON</button>
          </div>
        </div>

        <div class="data-action">
          <h4>Import Data</h4>
          <div class="import-options">
            <input type="file" id="importFile" accept=".json" style="display: none;">
            <button class="btn" id="importBtn">📤 Import from JSON</button>
          </div>
        </div>

        <div class="data-action">
          <h4>Sync Status</h4>
          <div class="sync-status">
            <span class="status-dot"></span>
            <span class="status-text">Local storage only (no cloud sync)</span>
          </div>
        </div>
      </div>

      <!-- Privacy & Security Section -->
      <div class="settings-section">
        <h3>🔒 Privacy & Security</h3>
        <p class="setting-description">Your data is stored locally in your browser and never sent to external servers.</p>

        <div class="setting-item toggle">
          <label for="twoFA">Enable Two-Factor Authentication</label>
          <input type="checkbox" id="twoFA">
          <span class="toggle-slider"></span>
        </div>

        <div class="danger-zone">
          <h4>Danger Zone</h4>
          <button class="btn btn-danger" id="clearData">🗑️ Clear All Data</button>
        </div>
      </div>
    `;

    container.innerHTML = html;
    this.attachEventListeners();
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Save budgets
    const saveBudgetsBtn = this.ui.$('#saveBudgets');
    saveBudgetsBtn?.addEventListener('click', () => {
      const budgetInputs = this.ui.$$('.budget-input');
      for (const input of budgetInputs) {
        const category = input.dataset.category;
        const amount = parseFloat(input.value) || 0;
        this.budgetManager.setBudget(category, amount);
      }
      this.ui.showToast('✅ Budgets saved', 'success');
    });

    // Export CSV
    const exportCSVBtn = this.ui.$('#exportCSV');
    exportCSVBtn?.addEventListener('click', () => {
      const transactions = this.storage.loadTransactions();
      const csv = this.storage.exportAsCSV(transactions);
      this.downloadFile(csv, 'transactions.csv', 'text/csv');
      this.ui.showToast('✅ Exported as CSV', 'success');
    });

    // Export JSON
    const exportJSONBtn = this.ui.$('#exportJSON');
    exportJSONBtn?.addEventListener('click', () => {
      const transactions = this.storage.loadTransactions();
      const json = this.storage.exportAsJSON(transactions);
      this.downloadFile(json, 'transactions.json', 'application/json');
      this.ui.showToast('✅ Exported as JSON', 'success');
    });

    // Import
    const importFile = this.ui.$('#importFile');
    const importBtn = this.ui.$('#importBtn');
    importBtn?.addEventListener('click', () => importFile?.click());

    importFile?.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = event => {
        try {
          const imported = this.storage.importFromJSON(event.target.result);
          const existing = this.storage.loadTransactions();
          const merged = [...existing, ...imported];
          this.storage.saveTransactions(merged);
          this.ui.showToast(`✅ Imported ${imported.length} transactions`, 'success');
        } catch (err) {
          this.ui.showToast(`❌ Import failed: ${err.message}`, 'error');
        }
      };
      reader.readAsText(file);
    });

    // Clear all data
    const clearDataBtn = this.ui.$('#clearData');
    clearDataBtn?.addEventListener('click', () => {
      if (confirm('⚠️ This will delete all your data. Are you sure?')) {
        this.storage.clearAll();
        this.ui.showToast('✅ All data cleared', 'success');
        // Reload
        setTimeout(() => location.reload(), 1000);
      }
    });

    // Preferences
    const themeSelect = this.ui.$('#theme');
    themeSelect?.addEventListener('change', e => {
      const settings = this.storage.loadSettings();
      settings.theme = e.target.value;
      this.storage.saveSettings(settings);
      this.ui.showToast(`✅ Theme set to ${e.target.value}`, 'success');
    });

    const notificationsToggle = this.ui.$('#notifications');
    notificationsToggle?.addEventListener('change', e => {
      const settings = this.storage.loadSettings();
      settings.notifications = e.target.checked;
      this.storage.saveSettings(settings);
    });
  }

  /**
   * Helper to download file
   */
  downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  /**
   * Called when screen is shown
   */
  onShow() {
    this.render();
  }
}
