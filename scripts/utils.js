/**
 * Utility Functions
 */

/**
 * Formats a number as a currency string.
 * @param {number} amount - The numeric amount.
 * @param {string} currency - The currency code (e.g., 'USD', 'EUR').
 * @returns {string} - Formatted currency string.
 */
export function formatCurrency(amount, currency = 'USD') {
  // Check storage for override
  const storedCurrency = localStorage.getItem('currency');
  const finalCurrency = storedCurrency || currency;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: finalCurrency,
  }).format(amount);
}

/**
 * Formats a date string (YYYY-MM-DD) to a readable locale date.
 * @param {string} dateStr - The date string from input[type="date"].
 * @returns {string} - Formatted date.
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

/**
 * Generates a unique ID with a prefix.
 * @param {string} prefix - The prefix for the ID (default 'txn').
 * @returns {string} - usage: txn_1727382...
 */
export function generateID(prefix = 'txn') {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

/**
 * Escapes HTML to prevent XSS.
 * @param {string} str 
 * @returns {string}
 */
export function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
