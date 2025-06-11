import { isValidEmail, isValidCPF } from '../utils/validators.js';

describe('isValidEmail', () => {
  it('returns true for a valid email', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
  });

  it('returns false for an invalid email', () => {
    expect(isValidEmail('invalid-email')).toBe(false);
  });
});

describe('isValidCPF', () => {
  it('returns true for a valid CPF', () => {
    expect(isValidCPF('52998224725')).toBe(true);
  });

  it('returns false for an invalid CPF', () => {
    expect(isValidCPF('12345678900')).toBe(false);
  });
});
