// Utility to validate form fields
export function validateForm(fields: Record<string, any>): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  Object.entries(fields).forEach(([key, value]) => {
    if (typeof value === 'string' && !value.trim()) {
      errors[key] = 'This field is required.';
    }
    if (key.toLowerCase().includes('email') && value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
      errors[key] = 'Invalid email address.';
    }
    if (key.toLowerCase().includes('password') && value && value.length < 6) {
      errors[key] = 'Password must be at least 6 characters.';
    }
  });
  return { valid: Object.keys(errors).length === 0, errors };
}
