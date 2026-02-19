/**
 * storage module
 handles localStorage and import/export logic.*/

const STORAGE_KEY = 'finance_tracker_data';

// default seed data (used if storage is empty)
const SEED_DATA = [
  {
    id: "txn_1",
    description: "Lunch at cafeteria",
    amount: 12.50,
    category: "Food",
    date: "2025-09-25",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "txn_2",
    description: "Chemistry Textbook",
    amount: 89.99,
    category: "Books",
    date: "2025-09-23",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

/**
 * loads transactions from localStorage.
 * @returns {Array} list of transactions.
 */
export function load() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : SEED_DATA;
  } catch (e) {
    console.error('Error loading data:', e);
    return [];
  }
}

/**
 * saves transactions to localStorage.
 * @param {Array} transactions 
 */
export function save(transactions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (e) {
    console.error('Error saving data:', e);
    // could dispatch an event or throw error if quota exceeded
  }
}

/**
 * exports data as a JSON blob URL.
 * @param {Array} transactions 
 * @returns {string} URL for the blob
 */
export function exportData(transactions) {
  const json = JSON.stringify(transactions, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  return URL.createObjectURL(blob);
}

/**
 * parses and validates imported JSON data.
 * @param {string} jsonString 
 * @returns {Array|null} validated data or null if invalid.
 */
export function importData(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (!Array.isArray(data)) throw new Error('Root must be an array');

    // basic schema validation for each item
    const isValid = data.every(item =>
      item.id &&
      item.description &&
      !isNaN(Number(item.amount)) &&
      item.category &&
      item.date
    );

    if (!isValid) throw new Error('Data structure invalid');

    return data;
  } catch (e) {
    console.error('Import failed:', e);
    return null;
  }
}

/**
 * gets the monthly budget.
 * @returns {number}
 */
export function getBudget() {
  return parseFloat(localStorage.getItem('monthly_budget')) || 0;
}

/**
 * sets the monthly budget.
 * @param {number} amount 
 */
export function setBudget(amount) {
  localStorage.setItem('monthly_budget', amount);
}
