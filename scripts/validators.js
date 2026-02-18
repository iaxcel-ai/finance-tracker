/**
 * Validators & Regex Patterns
 */

const PATTERNS = {
  description: /^[A-Za-z]+(?: [A-Za-z]+)*$/,

  amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/,

  category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,

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
  console.log('Running validateTransaction for:', data.description);

  // Description Validation
  if (!data.description) {
    errors.description = 'Description is required.';
  } else if (/\d/.test(data.description)) {
    console.log('Digit detected in description!');
    errors.description = 'Description cannot contain numbers.';
  } else if (!PATTERNS.description.test(data.description)) {
    console.log('Regex PATTERNS.description test failed!');
    errors.description = 'Description must contain only letters and single spaces.';
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
