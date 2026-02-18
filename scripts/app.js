/**
 * Main Application Logic
 */

import { load, save } from './storage.js';
import { renderTransactions, updateDashboard, showNotification } from './ui.js';
import { generateID } from './utils.js';
import { validateTransaction } from './validators.js';

// Global State
let transactions = [];
let editingId = null;

// DOM
const form = document.querySelector('.entry-form');
const searchInput = document.getElementById('search');
const sortSelect = document.getElementById('sort-by');

// Navigation
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.page-section');
const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
const sidebar = document.getElementById('sidebar');

// Settings
const themeToggleBtn = document.getElementById('theme-toggle');
const deleteAllBtn = document.getElementById('delete-all-btn');

function init() {
  transactions = load();
  renderApp();
  setupEventListeners();
  loadTheme(); // Check for saved theme

  // Set default date to today
  const dateInput = document.getElementById('date');
  if (dateInput) {
    dateInput.valueAsDate = new Date();
  }
}

/**
 * Navigation Logic
 */
function switchPage(targetId) {
  // 1. Update Active Link
  navLinks.forEach(link => {
    if (link.dataset.target === targetId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // 2. Show Active Section
  sections.forEach(section => {
    if (section.id === targetId) {
      section.classList.add('active');
    } else {
      section.classList.remove('active');
    }
  });

  // 3. Close mobile menu if open
  sidebar.classList.remove('open');
}


function renderApp() {
  // 1. Filter
  const query = searchInput.value.toLowerCase().trim();
  let filtered = transactions.filter(t =>
    t.description.toLowerCase().includes(query) ||
    t.amount.toString().includes(query) ||
    t.category.toLowerCase().includes(query)
  );

  // 2. Sort
  const sortValue = sortSelect.value;
  filtered.sort((a, b) => {
    if (sortValue === 'date-desc') return new Date(b.date) - new Date(a.date);
    if (sortValue === 'date-asc') return new Date(a.date) - new Date(b.date);
    if (sortValue === 'amount-desc') return b.amount - a.amount;
    if (sortValue === 'amount-asc') return a.amount - b.amount;
    return 0;
  });

  // 3. Update DOM
  renderTransactions(filtered, {
    searchRegex: null,
    editingId: editingId
  });
  updateDashboard(transactions);
}

/**
 * Theme Management
 */
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

/**
 * Action Handlers
 */
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

  const updatedData = {
    description: newDesc,
    amount: newAmount,
    date: newDate,
    category: newCat
  };

  const validation = validateTransaction(updatedData);

  if (!validation.isValid) {
    const errorMsg = Object.values(validation.errors).join('\n');
    showNotification(`Validation Error:\n${errorMsg}`, 'error');
    return;
  }

  // Update transaction
  const index = transactions.findIndex(t => t.id === id);
  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...updatedData };
    save(transactions);
    editingId = null;
    renderApp();
    showNotification('Transaction updated!', 'success');
  }
}

/**
 * Event Listeners
 */
function setupEventListeners() {
  // Navigation
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.dataset.target;
      switchPage(target);
    });
  });

  // Mobile Menu
  mobileMenuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  // Theme Toggle
  themeToggleBtn.addEventListener('click', toggleTheme);

  // Delete All Data
  deleteAllBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete ALL data? This cannot be undone.')) {
      transactions = [];
      save(transactions);
      renderApp();
      showNotification('All data deleted.', 'info');
    }
  });

  // Real-time validation for description
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

  // Form Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('DEBUG: Submit handler triggered');
    const formData = new FormData(form);
    const newTxn = {
      description: formData.get('description').trim(),
      amount: parseFloat(formData.get('amount')),
      date: formData.get('date'),
      category: formData.get('category'),
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

    // Add ID
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

  // Search & Sort
  searchInput.addEventListener('input', renderApp);
  sortSelect.addEventListener('change', renderApp);

  // Click Delegation for Table Actions
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

// Start
document.addEventListener('DOMContentLoaded', init);
