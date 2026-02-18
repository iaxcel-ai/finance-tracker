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
 * @param {Object} options - { searchRegex, editingId }
 */
export function renderTransactions(transactions, { searchRegex = null, editingId = null } = {}) {
  // Clear existing
  elements.tableBody.innerHTML = '';
  elements.cardsContainer.innerHTML = '';

  if (transactions.length === 0) {
    elements.tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No transactions found.</td></tr>';
    elements.cardsContainer.innerHTML = '<p class="text-center text-muted">No transactions found.</p>';
    return;
  }

  transactions.forEach(txn => {
    const isEditing = txn.id === editingId;
    const descriptionHTML = searchRegex ? highlight(txn.description, searchRegex) : escapeHTML(txn.description);
    const amountFormatted = formatCurrency(txn.amount);
    const dateFormatted = formatDate(txn.date);

    // 1. Table Row
    const row = document.createElement('tr');
    if (isEditing) {
      row.innerHTML = `
                <td><input type="date" class="form-control-sm" id="edit-date-${txn.id}" value="${txn.date}"></td>
                <td><input type="text" class="form-control-sm" id="edit-desc-${txn.id}" value="${escapeHTML(txn.description)}" pattern="[A-Za-zÀ-ÿ]+( [A-Za-zÀ-ÿ]+)*" title="Letters and single spaces only"></td>
                <td>
                    <select class="form-control-sm" id="edit-cat-${txn.id}">
                        <option value="Food" ${txn.category === 'Food' ? 'selected' : ''}>Food</option>
                        <option value="Books" ${txn.category === 'Books' ? 'selected' : ''}>Books</option>
                        <option value="Transport" ${txn.category === 'Transport' ? 'selected' : ''}>Transport</option>
                        <option value="Entertainment" ${txn.category === 'Entertainment' ? 'selected' : ''}>Entertainment</option>
                        <option value="Fees" ${txn.category === 'Fees' ? 'selected' : ''}>Fees</option>
                        <option value="Other" ${txn.category === 'Other' ? 'selected' : ''}>Other</option>
                    </select>
                </td>
                <td class="text-right"><input type="number" step="0.01" class="form-control-sm text-right" id="edit-amount-${txn.id}" value="${txn.amount}" style="width: 100px;"></td>
                <td class="text-right">
                    <button type="button" class="btn btn-sm btn-success" data-id="${txn.id}" data-action="save-edit">Save</button>
                    <button type="button" class="btn btn-sm btn-secondary" data-id="${txn.id}" data-action="cancel-edit">Cancel</button>
                </td>
            `;
    } else {
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
    }
    elements.tableBody.appendChild(row);

    // 2. Mobile Card (Simplified, usually better to keep editing in table for this specific request)
    const card = document.createElement('article');
    card.className = 'record-card';
    if (isEditing) {
      card.innerHTML = `
                <div class="card-body">
                    <p class="text-center font-bold">Editing in table...</p>
                    <div class="flex justify-center gap-2 mt-2">
                         <button type="button" class="btn btn-sm btn-success" data-id="${txn.id}" data-action="save-edit">Save</button>
                         <button type="button" class="btn btn-sm btn-secondary" data-id="${txn.id}" data-action="cancel-edit">Cancel</button>
                    </div>
                </div>
            `;
    } else {
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
                    <button type="button" class="btn btn-sm btn-secondary" data-id="${txn.id}" data-action="edit">Edit</button>
                    <button type="button" class="btn btn-sm btn-danger" data-id="${txn.id}" data-action="delete">Delete</button>
                </div>
            `;
    }
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

  // Visual feedback
  if (type === 'error') {
    alert(`ERR: ${message}`); // Prefix with ERR for clarity
  } else {
    console.log(`INFO: ${message}`);
  }
}
