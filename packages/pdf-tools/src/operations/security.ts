/**
 * Security and Password Operations
 */

export interface PasswordGeneratorOptions {
  length?: number;
  includeSpecial?: boolean;
  includeNumbers?: boolean;
}

export function generateSecurePassword(options: PasswordGeneratorOptions = {}): string {
  const { length = 20, includeSpecial = true, includeNumbers = true } = options;

  let charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  if (includeNumbers) charset += '0123456789';
  if (includeSpecial) charset += '!@#$%^&*()-_=+[]{}|;:,.<>?';

  const randomValues = new Uint32Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomValues);
  } else {
    for (let i = 0; i < length; i++) {
      randomValues[i] = Math.floor(Math.random() * 1000000000);
    }
  }

  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset[randomValues[i] % charset.length];
  }

  return result;
}
