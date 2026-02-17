/**
 * Storage Module
 * Handles localStorage and Import/Export logic.
 */

const STORAGE_KEY = 'finance_tracker_data';

// Default Seed Data (used if storage is empty)
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
 * Loads transactions from localStorage.
 * @returns {Array} List of transactions.
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
 * Saves transactions to localStorage.
 * @param {Array} transactions 
 */
export function save(transactions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (e) {
    console.error('Error saving data:', e);
    // Could dispatch an event or throw error if quota exceeded
  }
}

/**
 * Exports data as a JSON blob URL.
 * @param {Array} transactions 
 * @returns {string} URL for the blob
 */
export function exportData(transactions) {
  const json = JSON.stringify(transactions, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  return URL.createObjectURL(blob);
}

/**
 * Parses and validates imported JSON data.
 * @param {string} jsonString 
 * @returns {Array|null} Validated data or null if invalid.
 */
export function importData(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (!Array.isArray(data)) throw new Error('Root must be an array');

    // Basic schema validation for each item
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
