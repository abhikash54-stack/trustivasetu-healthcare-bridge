export const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
export const validatePassword = (password: string) => password.length >= 8;

export const validateStrongPassword = (password: string) => {
  if (password.length < 8) return false;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  return hasUppercase && hasLowercase && hasNumber;
};

export const PASSWORD_POLICY_MESSAGE =
  'Use at least 8 characters and include uppercase, lowercase, and a number.';
