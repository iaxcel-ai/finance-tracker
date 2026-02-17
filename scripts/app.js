/**
 * Main Application Logic
 */

import { load, save } from './storage.js';
import { renderTransactions, updateDashboard, showNotification } from './ui.js'; // Assumes ui.js handles DOM updates
import { generateID } from './utils.js';

// Global State
let transactions = [];

// DOM Elements
const form = document.querySelector('.entry-form');
const searchInput = document.getElementById('search');
const sortSelect = document.getElementById('sort-by');
const tableBody = document.querySelector('.records-table tbody'); // Ensure this selector matches HTML
const cardsContainer = document.querySelector('.records-cards');

// Navigation Elements
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.page-section');
const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
const sidebar = document.getElementById('sidebar');

// Settings Elements
const themeToggleBtn = document.getElementById('theme-toggle');
const deleteAllBtn = document.getElementById('delete-all-btn');

/**
 * Initialization
 */
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

/**
 * Render App
 */
function renderApp() {
  // Simplified rendering logic
  // 1. Filter
  const query = searchInput.value.toLowerCase().trim();
  let filtered = transactions.filter(t =>
    t.description.toLowerCase().includes(query) ||
    t.amount.toString().includes(query)
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
  // Note: We need to make sure renderTransactions accepts "filtered"
  // If renderTransactions is imported, check its definition. 
  // For safety, I will rely on the imported functions but ensure they work with the new IDs if changed.
  // The HTML IDs have been updated slightly (e.g. table body id), let's ensure ui.js is compatible or I should update it too.
  // Since I can't see ui.js right now in this turn, I'll assume standard DOM references or pass elements.
  // The imported `renderTransactions` likely selects elements inside itself.
  // To be safe, let's look at `ui.js` in the next step, but for now I'll call it.

  renderTransactions(filtered);
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

  // Form Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const newTxn = {
      id: generateID(),
      description: formData.get('description').trim(),
      amount: parseFloat(formData.get('amount')),
      date: formData.get('date'),
      category: formData.get('category'),
    };

    transactions.push(newTxn);
    save(transactions);
    renderApp();
    form.reset();

    // Reset date to today
    document.getElementById('date').valueAsDate = new Date();

    showNotification('Transaction added!', 'success');

    // Auto-switch to records view to see it (optional, but nice)
    switchPage('records');
  });

  // Search & Sort used input/change events
  searchInput.addEventListener('input', renderApp);
  sortSelect.addEventListener('change', renderApp);

  // Table Actions (Delegation)
  // We need to listen on the table container or body
  // Defining a helper to handle delete commands from the UI
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-icon'); // Assuming delete buttons have this class and data-id
    if (!btn) return;

    const id = btn.dataset.id;
    if (btn.classList.contains('danger') || btn.getAttribute('aria-label') === 'Delete transaction') { // Check explicit class or label
      if (confirm('Delete this transaction?')) {
        transactions = transactions.filter(t => t.id !== id);
        save(transactions);
        renderApp();
        showNotification('Transaction deleted.', 'info');
      }
    }
  });
}

// Start
document.addEventListener('DOMContentLoaded', init);
