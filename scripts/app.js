/**
 * main app logic
 */

import { load, save, getBudget, setBudget, exportData, importData } from './storage.js';
import { renderTransactions, updateDashboard, showNotification } from './ui.js';
import { generateID } from './utils.js';
import { validateTransaction } from './validators.js';

// global state
let transactions = [];
let editingId = null;

// DOM
const form = document.querySelector('.entry-form');
const searchInput = document.getElementById('search');
const sortSelect = document.getElementById('sort-by');

// navigation
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.page-section');
const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
const sidebar = document.getElementById('sidebar');

// settings
const themeToggleBtn = document.getElementById('theme-toggle');
const deleteAllBtn = document.getElementById('delete-all-btn');

// dashboard
const editBudgetBtn = document.getElementById('edit-budget-btn');

function init() {
  transactions = load();
  renderApp();
  setupEventListeners();
  loadTheme(); // check for saved theme

  // set default date to today
  const dateInput = document.getElementById('date');
  if (dateInput) {
    dateInput.valueAsDate = new Date();
  }
}

// navigation logic
function switchPage(targetId) {
  // 1. update active link
  navLinks.forEach(link => {
    if (link.dataset.target === targetId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // 2. show active section
  sections.forEach(section => {
    if (section.id === targetId) {
      section.classList.add('active');
    } else {
      section.classList.remove('active');
    }
  });

  // 3. close mobile menu if open
  sidebar.classList.remove('open');
}


function renderApp() {
  // 1. filter
  const query = searchInput.value.toLowerCase().trim();
  let filtered = transactions.filter(t =>
    t.description.toLowerCase().includes(query) ||
    t.amount.toString().includes(query) ||
    t.category.toLowerCase().includes(query)
  );

  // 2. sort
  const sortValue = sortSelect.value;
  filtered.sort((a, b) => {
    if (sortValue === 'date-desc') return new Date(b.date) - new Date(a.date);
    if (sortValue === 'date-asc') return new Date(a.date) - new Date(b.date);
    if (sortValue === 'amount-desc') return b.amount - a.amount;
    if (sortValue === 'amount-asc') return a.amount - b.amount;
    return 0;
  });

  // 3. update DOM
  renderTransactions(filtered, {
    searchRegex: null,
    editingId: editingId
  });
  updateDashboard(transactions);
}

// theme management
function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function loadTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  }
}

// action handlers
function handleDelete(id) {
  if (confirm('Are you sure you want to delete this transaction?')) {
    transactions = transactions.filter(t => t.id !== id);
    save(transactions);
    renderApp();
    showNotification('Transaction deleted.', 'info');
  }
}

function handleEdit(id) {
  editingId = id;
  renderApp();
}

function handleCancelEdit() {
  editingId = null;
  renderApp();
}

function handleSaveEdit(id) {
  const newDesc = document.getElementById(`edit-desc-${id}`).value.trim();
  const newAmount = parseFloat(document.getElementById(`edit-amount-${id}`).value);
  const newDate = document.getElementById(`edit-date-${id}`).value;
  const newCat = document.getElementById(`edit-cat-${id}`).value;

  // find original to preserve type
  const original = transactions.find(t => t.id === id);
  const currentType = original ? original.type : 'expense'; // default to expense if missing

  const updatedData = {
    description: newDesc,
    amount: newAmount,
    date: newDate,
    category: newCat,
    type: currentType 
  };

  const validation = validateTransaction(updatedData);

  if (!validation.isValid) {
    const errorMsg = Object.values(validation.errors).join('\n');
    showNotification(`Validation Error:\n${errorMsg}`, 'error');
    return;
  }

  // update transaction
  const index = transactions.findIndex(t => t.id === id);
  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...updatedData };
    save(transactions);
    editingId = null;
    renderApp();
    showNotification('Transaction updated!', 'success');
  }
}

// event listeners
function setupEventListeners() {
  // navigation
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.dataset.target;
      switchPage(target);
    });
  });

  // mobile menu
  mobileMenuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  // theme toggle
  themeToggleBtn.addEventListener('click', toggleTheme);

  // delete all data
  deleteAllBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete ALL data? This cannot be undone.')) {
      transactions = [];
      save(transactions);
      renderApp();
      showNotification('All data deleted.', 'info');
    }
  });

  // Currency Selector
  const currencySelect = document.getElementById('currency-select');
  if (currencySelect) {
      // Set initial value
      currencySelect.value = localStorage.getItem('currency') || 'USD';
      
      currencySelect.addEventListener('change', (e) => {
          localStorage.setItem('currency', e.target.value);
          renderApp(); // Re-render to update all formatted prices
          showNotification(`Currency changed to ${e.target.value}`, 'success');
      });
  }

  // Export Data
  const exportBtn = document.getElementById('export-btn');
  if (exportBtn) {
      exportBtn.addEventListener('click', () => {
          const url = exportData(transactions);
          const a = document.createElement('a');
          a.href = url;
          a.download = `finance_data_${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          URL.revokeObjectURL(url);
          showNotification('Data exported successfully.', 'success');
      });
  }

  // Import Data
  const importTrigger = document.getElementById('import-trigger-btn');
  const importInput = document.getElementById('import-file');

  if (importTrigger && importInput) {
      importTrigger.addEventListener('click', () => importInput.click());

      importInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (!file) return;

          const reader = new FileReader();
          reader.onload = (event) => {
              const imported = importData(event.target.result);
              if (imported) {
                  // Merge Strategy: Append new items (could add duplicate check based on ID)
                  // Simple approach: Concat and save
                  const newTransactions = [...transactions, ...imported];
                  // Removing potential duplicates by ID just in case
                  const unique = Array.from(new Map(newTransactions.map(item => [item.id, item])).values());
                  
                  transactions = unique;
                  save(transactions);
                  renderApp();
                  showNotification(`Imported ${imported.length} records.`, 'success');
              } else {
                  showNotification('Failed to import data. Check file format.', 'error');
              }
              // Reset input
              importInput.value = '';
          };
          reader.readAsText(file);
      });
  }

  // budget inline edit
  const toggleBtn = document.getElementById('toggle-budget-edit');
  const budgetDisplay = document.getElementById('budget-display');
  const budgetForm = document.getElementById('budget-form');
  const cancelBtn = document.getElementById('cancel-budget-edit');
  const newBudgetInput = document.getElementById('new-budget-input');

  if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
          budgetDisplay.classList.add('hidden');
          budgetForm.classList.remove('hidden');
          newBudgetInput.value = getBudget(); // Pre-fill
          newBudgetInput.focus();
      });
  }

  if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
          budgetDisplay.classList.remove('hidden');
          budgetForm.classList.add('hidden');
      });
  }

  if (budgetForm) {
      budgetForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const val = parseFloat(newBudgetInput.value);
          if (!isNaN(val) && val >= 0) {
              setBudget(val);
              updateDashboard(transactions);
              showNotification('Budget updated!', 'success');
              
              // close form
              budgetDisplay.classList.remove('hidden');
              budgetForm.classList.add('hidden');
          } else {
              showNotification('Invalid budget amount.', 'error');
          }
      });
  }

  // real-time validation for description
  const descInput = document.getElementById('description');
  if (descInput) {
    descInput.addEventListener('input', () => {
      const val = descInput.value;
      if (/\d/.test(val)) {
        descInput.setCustomValidity('Numbers are not allowed in the description.');
      } else {
        descInput.setCustomValidity('');
      }
    });
  }

  // type radio toggle -> update categories
  const typeRadios = document.querySelectorAll('input[name="type"]');
  const categorySelect = document.getElementById('category');
  
  // define categories
  const categories = {
      expense: ['Food', 'Books', 'Transport', 'Entertainment', 'Fees', 'Other'],
      income: ['Salary', 'Allowance', 'Gift', 'Other']
  };

  function updateCategoryOptions(type) {
      categorySelect.innerHTML = '<option value="">Select a category</option>';
      const options = categories[type] || categories.expense;
      options.forEach(cat => {
          const option = document.createElement('option');
          option.value = cat;
          option.textContent = cat;
          categorySelect.appendChild(option);
      });
  }

  typeRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
          updateCategoryOptions(e.target.value);
      });
  });

  // form submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const newTxn = {
      description: formData.get('description').trim(),
      amount: parseFloat(formData.get('amount')),
      date: formData.get('date'),
      category: formData.get('category'),
      type: formData.get('type') // capture type
    };

    const validation = validateTransaction(newTxn);
    console.log('Validating new transaction:', newTxn);
    console.log('Validation result:', validation);

    if (!validation.isValid) {
      console.warn('Validation failed:', validation.errors);
      const errorMsg = Object.values(validation.errors).join('\n');
      showNotification(`Validation Error:\n${errorMsg}`, 'error');
      return;
    }

    // add id
    newTxn.id = generateID();

    transactions.push(newTxn);
    save(transactions);
    renderApp();
    form.reset();

    // Reset date to today
    const dateInput = document.getElementById('date');
    if (dateInput) dateInput.valueAsDate = new Date();

    showNotification('Transaction added!', 'success');
    switchPage('records');
  });

  // search & sort
  searchInput.addEventListener('input', renderApp);
  sortSelect.addEventListener('change', renderApp);

  // click delegation for table actions
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;

    switch (action) {
      case 'delete':
        handleDelete(id);
        break;
      case 'edit':
        handleEdit(id);
        break;
      case 'save-edit':
        handleSaveEdit(id);
        break;
      case 'cancel-edit':
        handleCancelEdit();
        break;
    }
  });
}

// start
document.addEventListener('DOMContentLoaded', init);
