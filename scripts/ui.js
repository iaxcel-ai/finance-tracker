/**
 * ui module
 * handles DOM updates and rendering.
 */

import { formatCurrency, formatDate, escapeHTML } from './utils.js';
import { getBudget } from './storage.js';

const elements = {
  tableBody: document.getElementById('transaction-list-table'),
  totalBalance: document.getElementById('total-balance'),
  monthlySpending: document.getElementById('monthly-spending'),
  totalVolume: document.getElementById('total-volume'),
  totalRecords: document.getElementById('total-records'),
  topCategory: document.getElementById('top-category'),
  budgetAmount: document.getElementById('budget-amount'), // Spent
  budgetLimit: document.getElementById('budget-limit'),
  budgetRemainingText: document.getElementById('budget-remaining-text'),
  budgetProgress: document.getElementById('budget-progress'),
  budgetForecast: document.getElementById('budget-forecast')
};

/**
 * highlights matches in text using a regex.
 * @param {string} text 
 * @param {RegExp} regex 
 * @returns {string} HTML string with <mark> tags
 */
export function highlight(text, regex) {
  if (!regex || !text) return escapeHTML(text);
  return text.replace(regex, (match) => `<mark>${match}</mark>`);
}

/**
 * renders the transactions list (table & cards).
 * @param {Array} transactions 
 * @param {Object} options - { searchRegex, editingId }
 */
export function renderTransactions(transactions, { searchRegex = null, editingId = null } = {}) {
  // clear existing
  elements.tableBody.innerHTML = '';

  if (transactions.length === 0) {
    elements.tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No transactions found.</td></tr>';
    return;
  }

  transactions.forEach(txn => {
    const isEditing = txn.id === editingId;
    const descriptionHTML = searchRegex ? highlight(txn.description, searchRegex) : escapeHTML(txn.description);
    const amountFormatted = formatCurrency(txn.amount);
    const dateFormatted = formatDate(txn.date);

    const typeClass = txn.type === 'income' ? 'amount-income' : 'amount-expense';
    const amountPrefix = txn.type === 'income' ? '+' : '-';
    
    // 1. table row
    const row = document.createElement('tr');
    if (isEditing) {
      row.innerHTML = `
                <td><input type="date" class="form-control-sm" id="edit-date-${txn.id}" value="${txn.date}"></td>
                <td><input type="text" class="form-control-sm" id="edit-desc-${txn.id}" value="${escapeHTML(txn.description)}" pattern="[A-Za-zÀ-ÿ]+( [A-Za-zÀ-ÿ]+)*" title="Letters and single spaces only"></td>
                <td>
                    <select class="form-control-sm" id="edit-cat-${txn.id}">
                        <!-- Helper will populate this based on type, but for now simple list -->
                        <option value="Food" ${txn.category === 'Food' ? 'selected' : ''}>Food</option>
                        <option value="Books" ${txn.category === 'Books' ? 'selected' : ''}>Books</option>
                        <option value="Transport" ${txn.category === 'Transport' ? 'selected' : ''}>Transport</option>
                        <option value="Entertainment" ${txn.category === 'Entertainment' ? 'selected' : ''}>Entertainment</option>
                        <option value="Fees" ${txn.category === 'Fees' ? 'selected' : ''}>Fees</option>
                        <option value="Other" ${txn.category === 'Other' ? 'selected' : ''}>Other</option>
                        <option value="Salary" ${txn.category === 'Salary' ? 'selected' : ''}>Salary</option>
                        <option value="Allowance" ${txn.category === 'Allowance' ? 'selected' : ''}>Allowance</option>
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
                <td><span class="badge category-${txn.category.toLowerCase().replace(' ', '-')}">${txn.category}</span></td>
                <td class="text-right ${typeClass}">${amountPrefix}${amountFormatted}</td>
                <td class="text-right">
                    <button type="button" class="btn-icon" aria-label="Edit ${escapeHTML(txn.description)}" data-id="${txn.id}" data-action="edit">Edit</button>
                    <button type="button" class="btn-icon danger" aria-label="Delete ${escapeHTML(txn.description)}" data-id="${txn.id}" data-action="delete">Delete</button>
                </td>
            `;
    }
    elements.tableBody.appendChild(row);
  });
}

/**
 * updates the dashboard stats.
 * @param {Array} transactions 
 */
/**
 * updates the dashboard stats.
 * @param {Array} transactions 
 */
export function updateDashboard(transactions) {
  // 1. total Balance
  const total = transactions.reduce((sum, t) => {
    return t.type === 'income' 
        ? sum + Number(t.amount) 
        : sum - Number(t.amount);
  }, 0);

  if (elements.totalBalance) elements.totalBalance.textContent = formatCurrency(total);

  // 2. total volume (absolute sum of all amounts)
  const volume = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  if (elements.totalVolume) elements.totalVolume.textContent = formatCurrency(volume);

  // 3. total records
  if (elements.totalRecords) elements.totalRecords.textContent = transactions.length;

  // 4. top category
  const catCounts = {};
  transactions.forEach(t => {
      catCounts[t.category] = (catCounts[t.category] || 0) + 1;
  });
  let topCat = '-';
  let maxCount = 0;
  for (const [cat, count] of Object.entries(catCounts)) {
      if (count > maxCount) {
          maxCount = count;
          topCat = cat;
      }
  }
  if (elements.topCategory) elements.topCategory.textContent = topCat;

  // 5. monthly expenses (for budget)
  updateBudgetSection(transactions);

  // 6. trend chart
  renderTrendChart(transactions);
}

function updateBudgetSection(transactions) {
  const budget = getBudget();
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // calculate monthly spending (expenses only)
  const monthlyExpenses = transactions
    .filter(t => {
      const d = new Date(t.date);
      return (t.type === 'expense' || !t.type) && 
             d.getMonth() === currentMonth && 
             d.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + Number(t.amount), 0);

  if (elements.monthlySpending) elements.monthlySpending.textContent = formatCurrency(monthlyExpenses);
  
  // update budget ui
  if (elements.budgetLimit) elements.budgetLimit.textContent = formatCurrency(budget);
  if (elements.budgetAmount) elements.budgetAmount.textContent = formatCurrency(monthlyExpenses); // Spent amount

  const remaining = budget - monthlyExpenses;
  if (elements.budgetRemainingText) {
      if (budget > 0) {
          elements.budgetRemainingText.textContent = `${formatCurrency(remaining)} Remaining`;
          elements.budgetRemainingText.style.color = remaining < 0 ? 'var(--color-danger)' : 'var(--color-text-main)';
      } else {
          elements.budgetRemainingText.textContent = 'No Limit Set';
      }
  }

  if (budget > 0) {
      const percent = Math.min((monthlyExpenses / budget) * 100, 100);
      if (elements.budgetProgress) {
          elements.budgetProgress.style.width = `${percent}%`;
          // color coding
          if (percent > 90) elements.budgetProgress.style.backgroundColor = 'var(--color-danger)';
          else if (percent > 75) elements.budgetProgress.style.backgroundColor = 'var(--color-accent)'; // Orange-ish usually
          else elements.budgetProgress.style.backgroundColor = 'var(--color-primary)';
      }

      // forecast
      const dayOfMonth = now.getDate(); // 1-31
      const dailyAvg = monthlyExpenses / dayOfMonth;
      
      let forecastMsg = '';
      if (remaining <= 0) {
          forecastMsg = 'Budget exceeded!';
          showNotification('Warning: Monthly budget limit exceeded!', 'error');
      } else if (dailyAvg > 0) {
          const daysLeft = Math.floor(remaining / dailyAvg);
          forecastMsg = `At this rate, budget runs out in ~${daysLeft} days.`;
      } else {
          forecastMsg = 'You are on track.';
      }

      if (elements.budgetForecast) elements.budgetForecast.textContent = forecastMsg;

  } else {
      if (elements.budgetProgress) elements.budgetProgress.style.width = '0%';
      if (elements.budgetForecast) elements.budgetForecast.textContent = 'Set a budget to see forecast.';
  }
}

let chartInstance = null;

function renderTrendChart(transactions) {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;

    // filter last 7 days (including today)
    const labels = [];
    const dataPoints = [];
    
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
        
        // sum expenses for this day
        const dayTotal = transactions
            .filter(t => t.date === dateStr && (t.type === 'expense' || !t.type))
            .reduce((sum, t) => sum + Number(t.amount), 0);
        
        labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
        dataPoints.push(dayTotal);
    }

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Daily Spending',
                data: dataPoints,
                backgroundColor: 'rgba(217, 70, 239, 0.5)',
                borderColor: 'rgba(217, 70, 239, 1)',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.05)' }
                },
                x: {
                    grid: { display: false }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

/**
 * shows a temporary notification
 * @param {string} message 
 * @param {string} type - 'success', 'error', 'info'
 */
export function showNotification(message, type = 'info') {
  // create or get live region
  let liveRegion = document.getElementById('live-region');
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'live-region';
    liveRegion.className = 'visually-hidden'; // or visible toast style
    liveRegion.setAttribute('role', 'status'); // 'alert' for errors
    liveRegion.setAttribute('aria-live', 'polite');
    document.body.appendChild(liveRegion);
  }

  if (type === 'error') {
    liveRegion.setAttribute('role', 'alert');
    liveRegion.setAttribute('aria-live', 'assertive');
  } else {
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
  }

  liveRegion.textContent = message;

  // visual feedback
  if (type === 'error') {
    alert(`ERR: ${message}`); // prefix with ERR for clarity
  } else {
    console.log(`INFO: ${message}`);
  }
}
