/**
 * Validators & Regex Patterns
 */

const PATTERNS = {
  // Description: No leading/trailing spaces, collapse doubles, must have content.
  description: /^\S+(?: \S+)*$/,

  // Amount: Positive number, optional 2 decimal places. 0 is allowed but standard says >0 generally involved in finance, but we allow 0.
  amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/,

  // Date: YYYY-MM-DD (Basic format check, valid date logic is mostly browser handled but good to enforce).
  date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,

  // Category: Letters, spaces, hyphens.
  category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,

  // Advanced: Duplicate word detection (case-insensitive).
  // Matches a word boundary, a word, space, then the same word again.
  duplicateWords: /\b(\w+)\s+\1\b/i
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
    errors.description = 'Invalid description. No leading/trailing spaces.';
  } else if (PATTERNS.duplicateWords.test(data.description)) {
    errors.description = 'Description contains duplicate words (e.g., "coffee coffee").';
  }

  // Amount Validation
  if (!data.amount || !PATTERNS.amount.test(String(data.amount)) || parseFloat(data.amount) < 0) {
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
