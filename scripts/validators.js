/**
 * validators & regex patterns
 */

const PATTERNS = {
  description: /^[A-Za-z]+(?: [A-Za-z]+)*$/,

  amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/,

  category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,

  currency: /^\S(?:.*\S)?$/,

  // date: YYYY-MM-DD
  date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,

  // advanced: back-reference to catch duplicate words
  duplicateWords: /\b(\w+)\s+\1\b/i
};

// allowed categories
const ALLOWED_CATEGORIES = ['Food', 'Books', 'Transport', 'Entertainment', 'Fees', 'Other'];

/**
 * validates transaction form data.
 * @param {Object} data - { description, amount, date, category }
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export function validateTransaction(data) {
  const errors = {};
  console.log('Running validateTransaction for:', data.description);

  // description validation
  if (!data.description) {
    errors.description = 'Description is required.';
  } else if (/\d/.test(data.description)) {
    console.log('Digit detected in description!');
    errors.description = 'Description cannot contain numbers.';
  } else if (!PATTERNS.description.test(data.description)) {
    console.log('Regex PATTERNS.description test failed!');
    errors.description = 'Description must contain only letters and single spaces.';
  } else if (PATTERNS.duplicateWords.test(data.description)) {
    console.log('Duplicate words detected!');
    errors.description = 'Description cannot contain duplicate consecutive words.';
  }

  // amount validation
  if (!data.amount || !PATTERNS.amount.test(String(data.amount))) {
    errors.amount = 'Invalid amount. Must be a positive number (max 2 decimals).';
  }

  // date validation
  if (!data.date || !PATTERNS.date.test(data.date)) {
    errors.date = 'Invalid date format (YYYY-MM-DD).';
  }

  // category validation
  if (data.type === 'expense' && !ALLOWED_CATEGORIES.includes(data.category)) {
     // strict check for expenses
     errors.category = 'Invalid category selected.';
  } else if (!data.category) {
      errors.category = 'Category is required.';
  }

  // type validation
  if (!['income', 'expense'].includes(data.type)) {
      errors.type = 'Invalid transaction type.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * safe regex compiler for search
 * @param {string} pattern the user input string
 * @returns {RegExp|null} compiled regex or null if invalid
 */
export function compileRegex(pattern) {
  try {
    return new RegExp(pattern, 'i');
  } catch (e) {
    return null;
  }
}
