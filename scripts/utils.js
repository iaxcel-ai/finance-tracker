/**
 * utility functions
 */

/**
 * formats a number as a currency string.
 * @param {number} amount the numeric amount.
 * @param {string} currency the currency code (e.g., 'USD', 'EUR').
 * @returns {string} formatted currency string.
 */
const EXCHANGE_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  KES: 130.0,
  INR: 83.0,
  JPY: 150.0
};

/**
 * formats a number as a currency string.
 * @param {number} amount the numeric amount.
 * @param {string} currency the currency code (e.g., 'USD', 'EUR').
 * @returns {string} formatted currency string.
 */
export function formatCurrency(amount, currency = 'USD') {
  // check storage for override
  const storedCurrency = localStorage.getItem('currency');
  const finalCurrency = storedCurrency || currency;

  // convertion
  const rate = EXCHANGE_RATES[finalCurrency] || 1;
  const convertedAmount = amount * rate;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: finalCurrency,
  }).format(convertedAmount);
}

/**
 * formats a date string (YYYY-MM-DD) to a readable locale date.
 * @param {string} dateStr the date string from input[type="date"].
 * @returns {string} formatted date.
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
 * generates a unique ID with a prefix.
 * @param {string} prefix the prefix for the ID (default 'txn').
 * @returns {string} usage: txn_1727382...
 */
export function generateID(prefix = 'txn') {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

/**
 * escapes HTML to prevent XSS.
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
