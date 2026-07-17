export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
export const urlRegex = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-./?%&=]*)?$/;
export const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;

export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Invalid email address';
  return true;
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter';
  if (!/\d/.test(password)) return 'Password must contain a number';
  if (!/[@$!%*?&]/.test(password)) return 'Password must contain a special character';
  return true;
};

export const validateConfirmPassword = (confirmPassword, password) => {
  if (!confirmPassword) return 'Please confirm your password';
  if (confirmPassword !== password) return 'Passwords do not match';
  return true;
};

export const validateName = (name) => {
  if (!name) return 'Name is required';
  if (name.length < 2) return 'Name must be at least 2 characters';
  if (name.length > 50) return 'Name must be less than 50 characters';
  return true;
};

export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: 'None', color: 'bg-dark-300' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&]/.test(password)) score++;
  let label = 'Weak';
  let color = 'bg-red-500';
  if (score >= 4) { label = 'Good'; color = 'bg-yellow-500'; }
  if (score >= 5) { label = 'Strong'; color = 'bg-green-500'; }
  if (score >= 6) { label = 'Very Strong'; color = 'bg-emerald-500'; }
  return { score: (score / 6) * 100, label, color };
};
