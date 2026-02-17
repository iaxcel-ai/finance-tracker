/**
 * UI Module
 * Handles DOM updates and rendering.
 */

import { formatCurrency, formatDate, escapeHTML } from './utils.js';

const elements = {
  tableBody: document.getElementById('transaction-list-table'),
  cardsContainer: document.getElementById('transaction-list-cards'),
  totalBalance: document.getElementById('total-balance'),
  monthlySpending: document.getElementById('monthly-spending'),
  topCategory: document.getElementById('top-category')
};

/**
 * Highlights matches in text using a regex.
 * @param {string} text 
 * @param {RegExp} regex 
 * @returns {string} HTML string with <mark> tags
 */
export function highlight(text, regex) {
  if (!regex || !text) return escapeHTML(text);
  return text.replace(regex, (match) => `<mark>${match}</mark>`);
}

/**
 * Renders the transactions list (Table & Cards).
 * @param {Array} transactions 
 * @param {RegExp} searchRegex - Optional regex for highlighting
 */
export function renderTransactions(transactions, searchRegex = null) {
  // Clear existing
  elements.tableBody.innerHTML = '';
  elements.cardsContainer.innerHTML = '';

  if (transactions.length === 0) {
    elements.tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No transactions found.</td></tr>';
    elements.cardsContainer.innerHTML = '<p class="text-center text-muted">No transactions found.</p>';
    return;
  }

  transactions.forEach(txn => {
    const descriptionHTML = searchRegex ? highlight(txn.description, searchRegex) : escapeHTML(txn.description);
    const amountFormatted = formatCurrency(txn.amount);
    const dateFormatted = formatDate(txn.date);

    // 1. Table Row
    const row = document.createElement('tr');
    row.innerHTML = `
            <td>${dateFormatted}</td>
            <td>${descriptionHTML}</td>
            <td><span class="badge category-${txn.category.toLowerCase()}">${txn.category}</span></td>
            <td class="text-right">${amountFormatted}</td>
            <td class="text-right">
                <button type="button" class="btn-icon" aria-label="Edit ${escapeHTML(txn.description)}" data-id="${txn.id}" data-action="edit">Edit</button>
                <button type="button" class="btn-icon danger" aria-label="Delete ${escapeHTML(txn.description)}" data-id="${txn.id}" data-action="delete">Delete</button>
            </td>
        `;
    elements.tableBody.appendChild(row);

    // 2. Mobile Card
    const card = document.createElement('article');
    card.className = 'record-card';
    card.innerHTML = `
            <div class="card-header">
                <span class="date">${dateFormatted}</span>
                <span class="badge category-${txn.category.toLowerCase()}">${txn.category}</span>
            </div>
            <div class="card-body">
                <h3>${descriptionHTML}</h3>
                <p class="amount">${amountFormatted}</p>
            </div>
            <div class="card-footer">
                <button type="button" class="btn-sm" data-id="${txn.id}" data-action="edit">Edit</button>
                <button type="button" class="btn-sm danger" data-id="${txn.id}" data-action="delete">Delete</button>
            </div>
        `;
    elements.cardsContainer.appendChild(card);
  });
}

/**
 * Updates the dashboard stats.
 * @param {Array} transactions 
 */
export function updateDashboard(transactions) {
  const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  if (elements.totalBalance) {
    elements.totalBalance.textContent = formatCurrency(total);
  }

  // Additional stats logic (monthly spending, top category) can go here
  updateMonthlySpending(transactions);
}

function updateMonthlySpending(transactions) {
  // Implementation for monthly spending stat
  // For now, placeholder or basic sum of current month
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyTotal = transactions
    .filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + Number(t.amount), 0);

  if (elements.monthlySpending) {
    elements.monthlySpending.textContent = formatCurrency(monthlyTotal);
  }
}

/**
 * Shows a temporary notification (Toast).
 * Uses ARIA live region for accessibility.
 * @param {string} message 
 * @param {string} type - 'success', 'error', 'info'
 */
export function showNotification(message, type = 'info') {
  // Create or get live region
  let liveRegion = document.getElementById('live-region');
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'live-region';
    liveRegion.className = 'visually-hidden'; // Or visible toast style
    liveRegion.setAttribute('role', 'status'); // 'alert' for errors
    liveRegion.setAttribute('aria-live', 'polite');
    document.body.appendChild(liveRegion);
  }

  // If error, use 'assertive'
  if (type === 'error') {
    liveRegion.setAttribute('role', 'alert');
    liveRegion.setAttribute('aria-live', 'assertive');
  } else {
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
  }

  liveRegion.textContent = message;

  // Optional: Visual toast implementation could go here
  if (type === 'error') alert(message); // Fallback/Simple for now
  else console.log(message);
}
