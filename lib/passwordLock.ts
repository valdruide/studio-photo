import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export async function hashLockPassword(password: string) {
    return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyLockPassword(password: string, passwordHash: string) {
    return bcrypt.compare(password, passwordHash);
}

export function sanitizeLockedRecord<T extends Record<string, any>>(record: T) {
    const clone = { ...record };
    delete clone.password;
    delete clone.passwordHash;
    return clone;
}
