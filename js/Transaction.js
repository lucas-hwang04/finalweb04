/**
 * Transaction Model Class
 * Represents a single income/expense transaction
 */
class Transaction {
  constructor(data = {}) {
    this.id = data.id || `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.type = data.type || 'expense'; // 'income' or 'expense'
    this.category = data.category || '';
    this.amount = parseFloat(data.amount) || 0;
    this.date = data.date || new Date().toISOString().split('T')[0];
    this.note = data.note || '';
    this.tags = data.tags || [];
  }

  /**
   * Validate transaction before saving
   */
  validate() {
    const errors = [];
    if (!this.type || !['income', 'expense'].includes(this.type)) {
      errors.push('Type must be income or expense');
    }
    if (!this.category || this.category.trim() === '') {
      errors.push('Category is required');
    }
    if (!isFinite(this.amount) || this.amount <= 0) {
      errors.push('Amount must be a positive number');
    }
    if (!this.date || !/^\d{4}-\d{2}-\d{2}$/.test(this.date)) {
      errors.push('Date must be in YYYY-MM-DD format');
    }
    return { valid: errors.length === 0, errors };
  }

  /**
   * Return transaction as plain object
   */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      category: this.category,
      amount: this.amount,
      date: this.date,
      note: this.note,
      tags: this.tags,
    };
  }

  /**
   * Create transaction from JSON
   */
  static fromJSON(obj) {
    return new Transaction(obj);
  }

  /**
   * Get display string
   */
  getDisplayString() {
    return `${this.note || this.category} - ${this.type === 'income' ? '+' : '-'}$${this.amount.toFixed(2)}`;
  }
}
