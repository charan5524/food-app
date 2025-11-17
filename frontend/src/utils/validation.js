// Email validation
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Phone validation (basic)
export const validatePhone = (phone) => {
  const re = /^[\d\s\-\+\(\)]+$/;
  return re.test(phone) && phone.replace(/\D/g, "").length >= 10;
};

// Password validation
export const validatePassword = (password) => {
  // At least 6 characters
  if (password.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters" };
  }
  // At least one number
  if (!/\d/.test(password)) {
    return { valid: false, message: "Password must contain at least one number" };
  }
  return { valid: true, message: "" };
};

// Required field validation
export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

// Form validation helper
export const validateForm = (fields, rules) => {
  const errors = {};
  let isValid = true;

  Object.keys(rules).forEach((field) => {
    const value = fields[field];
    const fieldRules = rules[field];

    if (fieldRules.required && !validateRequired(value)) {
      errors[field] = `${fieldRules.label || field} is required`;
      isValid = false;
    } else if (value) {
      if (fieldRules.email && !validateEmail(value)) {
        errors[field] = "Please enter a valid email address";
        isValid = false;
      }
      if (fieldRules.phone && !validatePhone(value)) {
        errors[field] = "Please enter a valid phone number";
        isValid = false;
      }
      if (fieldRules.password) {
        const passwordValidation = validatePassword(value);
        if (!passwordValidation.valid) {
          errors[field] = passwordValidation.message;
          isValid = false;
        }
      }
      if (fieldRules.minLength && value.length < fieldRules.minLength) {
        errors[field] = `Must be at least ${fieldRules.minLength} characters`;
        isValid = false;
      }
      if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
        errors[field] = `Must be no more than ${fieldRules.maxLength} characters`;
        isValid = false;
      }
    }
  });

  return { isValid, errors };
};

// Sanitize input (basic XSS prevention)
export const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

