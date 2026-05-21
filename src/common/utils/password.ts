import { compare, hash } from 'bcryptjs';

export const PASSWORD_SALT_ROUNDS = 12;

export function hashPassword(password: string) {
  return hash(password, PASSWORD_SALT_ROUNDS);
}

export function verifyPassword(
  password: string,
  passwordHash?: string | null,
) {
  if (!passwordHash) {
    return false;
  }

  return compare(password, passwordHash);
}
