export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password: unknown): password is string {
  return typeof password === "string" && password.length >= 8 && password.length <= 200;
}
