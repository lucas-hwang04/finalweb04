/**
 * Transaction Class
 * Represents a single income or expense transaction
 */
class Transaction {
  constructor(type, category, amount, date, note = '', id = null) {
    this.id = id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.type = type; // 'income' or 'expense'
    this.category = category;
    this.amount = parseFloat(amount) || 0;
    this.date = date;
    this.note = note;
    this.createdAt = new Date().toISOString();
  }

  // Return formatted money string
  formatAmount() {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(this.amount);
  }

  // Check if transaction is within a date range
  isWithinRange(startDate, endDate) {
    const txDate = new Date(this.date);
    return txDate >= startDate && txDate <= endDate;
  }

  // Get month-year key for grouping
  getMonthKey() {
    const d = new Date(this.date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      category: this.category,
      amount: this.amount,
      date: this.date,
      note: this.note,
      createdAt: this.createdAt
    };
  }

  // Create from JSON
  static fromJSON(data) {
    const tx = new Transaction(data.type, data.category, data.amount, data.date, data.note, data.id);
    tx.createdAt = data.createdAt || tx.createdAt;
    return tx;
  }
}
