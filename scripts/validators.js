/**
 * Validators & Regex Patterns
 */

const PATTERNS = {
  // descriptionRegex: /^\S(?:.*\S)?$/
  description: /^\S(?:.*\S)?$/,

  // amountRegex: /^(0|[1-9]\d*)(\.\d{1,2})?$/
  amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/,

  // categoryRegex: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/
  category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,

  // currencyRegex: /^\S(?:.*\S)?$/
  currency: /^\S(?:.*\S)?$/,

  // Date: YYYY-MM-DD
  date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/
};

// Allowed categories (Could be dynamic, but hardcoded for now based on spec)
const ALLOWED_CATEGORIES = ['Food', 'Books', 'Transport', 'Entertainment', 'Fees', 'Other'];

/**
 * Validates transaction form data.
 * @param {Object} data - { description, amount, date, category }
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export function validateTransaction(data) {
  const errors = {};

  // Description Validation
  if (!data.description || !PATTERNS.description.test(data.description)) {
    errors.description = 'Invalid description. Check format.';
  }

  // Amount Validation
  if (!data.amount || !PATTERNS.amount.test(String(data.amount))) {
    errors.amount = 'Invalid amount. Must be a positive number (max 2 decimals).';
  }

  // Date Validation
  if (!data.date || !PATTERNS.date.test(data.date)) {
    errors.date = 'Invalid date format (YYYY-MM-DD).';
  }

  // Category Validation
  if (!ALLOWED_CATEGORIES.includes(data.category)) {
    errors.category = 'Invalid category selected.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Safe Regex Compiler for Search
 * @param {string} pattern - The user input string
 * @returns {RegExp|null} - Compiled regex or null if invalid
 */
export function compileRegex(pattern) {
  try {
    return new RegExp(pattern, 'i');
  } catch (e) {
    return null;
  }
}
