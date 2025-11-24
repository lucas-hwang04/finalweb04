/**
 * SettingsScreen Class
 * Handles settings, preferences, budget management, data export/import
 */
class SettingsScreen {
  constructor(ui, storage, budgetManager) {
    this.ui = ui;
    this.storage = storage;
    this.budgetManager = budgetManager;
  }

  // Render the settings screen
  render(transactions) {
    const container = this.ui.$('[data-screen="settings"]');
    if (!container) return;

    const settings = this.storage.loadSettings();
    const budgets = this.budgetManager.getBudgets();

    let html = `
      <div class="settings-content">
        <!-- Profile Settings -->
        <section class="card">
          <h2 class="card-title">👤 Profile</h2>
          <div class="settings-group">
            <div class="setting-item">
              <label for="profile-name">Name</label>
              <input type="text" id="profile-name" value="${settings.profileName || 'User'}" />
            </div>
            <div class="setting-item">
              <label for="currency">Currency</label>
              <select id="currency">
                <option value="USD" ${settings.currency === 'USD' ? 'selected' : ''}>$ USD</option>
                <option value="EUR" ${settings.currency === 'EUR' ? 'selected' : ''}>€ EUR</option>
                <option value="GBP" ${settings.currency === 'GBP' ? 'selected' : ''}>£ GBP</option>
              </select>
            </div>
            <button class="btn btn-primary" id="save-profile">Save Profile</button>
          </div>
        </section>

        <!-- Budget Management -->
        <section class="card span-2">
          <h2 class="card-title">💰 Budget Management</h2>
          <div class="budget-grid">
            ${Object.entries(budgets).map(([category, amount]) => `
              <div class="budget-item">
                <div class="budget-label">${category}</div>
                <div class="budget-input-group">
                  <span class="currency">$</span>
                  <input 
                    type="number" 
                    class="budget-input" 
                    data-category="${category}" 
                    value="${amount}" 
                    step="10" 
                    min="0"
                  />
                </div>
              </div>
            `).join('')}
          </div>
          <button class="btn btn-primary" id="save-budgets" style="margin-top: 1rem;">Save Budgets</button>
        </section>

        <!-- Notifications & Privacy -->
        <section class="card">
          <h2 class="card-title">🔔 Preferences</h2>
          <div class="settings-group">
            <div class="toggle-item">
              <label>
                <input type="checkbox" id="notifications-toggle" ${settings.notifications ? 'checked' : ''} />
                Enable Notifications
              </label>
            </div>
            <div class="toggle-item">
              <label>
                <input type="checkbox" id="two-factor-toggle" ${settings.twoFactorEnabled ? 'checked' : ''} />
                Two-Factor Authentication
              </label>
            </div>
          </div>
        </section>

        <!-- Data Management -->
        <section class="card span-2">
          <h2 class="card-title">📊 Data Management</h2>
          <div class="data-section">
            <h3>Export Data</h3>
            <p style="color: var(--muted); margin-bottom: 1rem;">Download your transaction data for backup or analysis</p>
            <div class="export-buttons">
              <button class="btn btn-secondary" id="export-csv">📥 Export as CSV</button>
              <button class="btn btn-secondary" id="export-json">📥 Export as JSON</button>
            </div>
          </div>

          <div class="data-section" style="margin-top: 2rem; border-top: 1px solid var(--border); padding-top: 1rem;">
            <h3>Import Data</h3>
            <p style="color: var(--muted); margin-bottom: 1rem;">Import previously exported transaction data</p>
            <input type="file" id="import-file" accept=".json,.csv" style="display: none;" />
            <button class="btn btn-secondary" id="import-btn">📤 Import Data</button>
          </div>

          <div class="data-section" style="margin-top: 2rem; border-top: 1px solid var(--border); padding-top: 1rem;">
            <h3>Statistics</h3>
            <div class="stats-list">
              <div class="stat-item">
                <span>Total Transactions</span>
                <strong>${transactions.length}</strong>
              </div>
              <div class="stat-item">
                <span>Date Range</span>
                <strong>${transactions.length > 0 ? 
                  new Date(Math.min(...transactions.map(t => new Date(t.date).getTime()))).toLocaleDateString() + ' to ' +
                  new Date(Math.max(...transactions.map(t => new Date(t.date).getTime()))).toLocaleDateString()
                  : 'N/A'}</strong>
              </div>
              <div class="stat-item">
                <span>Storage Used</span>
                <strong>${(new Blob([JSON.stringify(transactions)]).size / 1024).toFixed(2)} KB</strong>
              </div>
            </div>
          </div>
        </section>

        <!-- Danger Zone -->
        <section class="card">
          <h2 class="card-title" style="color: var(--danger);">⚠️ Danger Zone</h2>
          <p style="color: var(--muted); margin-bottom: 1rem;">These actions are irreversible</p>
          <button class="btn btn-danger" id="clear-all-data">🗑️ Clear All Data</button>
        </section>
      </div>
    `;

    container.innerHTML = html;
    this.attachEventListeners(transactions);
  }

  // Attach event listeners
  attachEventListeners(transactions) {
    // Save profile
    const saveProfileBtn = this.ui.$('#save-profile');
    if (saveProfileBtn) {
      saveProfileBtn.addEventListener('click', () => {
        const name = this.ui.$('#profile-name').value;
        const currency = this.ui.$('#currency').value;
        const settings = this.storage.loadSettings();
        settings.profileName = name;
        settings.currency = currency;
        this.storage.saveSettings(settings);
        this.ui.showToast('Profile updated! ✅', 'success');
      });
    }

    // Save budgets
    const saveBudgetsBtn = this.ui.$('#save-budgets');
    if (saveBudgetsBtn) {
      saveBudgetsBtn.addEventListener('click', () => {
        const budgetInputs = this.ui.$$('.budget-input');
        const newBudgets = {};
        budgetInputs.forEach(input => {
          const category = input.dataset.category;
          newBudgets[category] = parseFloat(input.value) || 0;
        });
        const settings = this.storage.loadSettings();
        settings.budgets = newBudgets;
        this.storage.saveSettings(settings);
        this.ui.showToast('Budgets updated! ✅', 'success');
      });
    }

    // Export CSV
    const exportCsvBtn = this.ui.$('#export-csv');
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => {
        const csv = this.storage.exportAsCSV(transactions);
        this.downloadFile(csv, 'transactions.csv', 'text/csv');
        this.ui.showToast('CSV exported! 📥', 'success');
      });
    }

    // Export JSON
    const exportJsonBtn = this.ui.$('#export-json');
    if (exportJsonBtn) {
      exportJsonBtn.addEventListener('click', () => {
        const json = this.storage.exportAsJSON(transactions);
        this.downloadFile(json, 'transactions.json', 'application/json');
        this.ui.showToast('JSON exported! 📥', 'success');
      });
    }

    // Import file handler
    const importBtn = this.ui.$('#import-btn');
    const importFile = this.ui.$('#import-file');
    if (importBtn && importFile) {
      importBtn.addEventListener('click', () => importFile.click());
      importFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            try {
              const imported = this.storage.importFromJSON(evt.target.result);
              const currentTxs = this.storage.loadTransactions();
              const merged = [...currentTxs, ...imported];
              this.storage.saveTransactions(merged);
              this.ui.showToast(`Imported ${imported.length} transactions! ✅`, 'success');
              // Reload app
              window.location.reload();
            } catch (err) {
              this.ui.showToast('Error importing file', 'error');
            }
          };
          reader.readAsText(file);
        }
      });
    }

    // Clear all data
    const clearBtn = this.ui.$('#clear-all-data');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure? This will delete ALL transactions and settings. This action cannot be undone!')) {
          this.storage.clearAll();
          this.ui.showToast('All data cleared!', 'success');
          setTimeout(() => window.location.reload(), 1000);
        }
      });
    }
  }

  // Helper to download file
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
}
