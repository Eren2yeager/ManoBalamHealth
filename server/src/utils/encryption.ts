import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const TAG_POSITION = SALT_LENGTH + IV_LENGTH;
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH;

/**
 * Get encryption key from environment
 * In production, this should use a proper key management system
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is required for data encryption');
  }
  // Use PBKDF2 to derive a proper key from the environment variable
  return crypto.pbkdf2Sync(key, 'manobalam-salt', 100000, KEY_LENGTH, 'sha256');
}

/**
 * Encrypt sensitive data (e.g., bank account numbers)
 * Returns a base64-encoded string containing salt, iv, tag, and encrypted data
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) {
    throw new Error('Cannot encrypt empty string');
  }

  const key = getEncryptionKey();
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  const buffer = Buffer.concat([salt, iv, tag, encrypted]);
  return buffer.toString('base64');
}

/**
 * Decrypt sensitive data
 * Takes a base64-encoded string and returns the original plaintext
 */
export function decrypt(encryptedData: string): string {
  if (!encryptedData) {
    throw new Error('Cannot decrypt empty string');
  }

  const key = getEncryptionKey();
  const buffer = Buffer.from(encryptedData, 'base64');

  const salt = buffer.subarray(0, SALT_LENGTH);
  const iv = buffer.subarray(SALT_LENGTH, TAG_POSITION);
  const tag = buffer.subarray(TAG_POSITION, ENCRYPTED_POSITION);
  const encrypted = buffer.subarray(ENCRYPTED_POSITION);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

/**
 * Mask sensitive data for display (e.g., •••• 1234)
 * Shows only the last 4 characters by default
 */
export function maskAccountNumber(accountNumber: string, visibleChars: number = 4): string {
  if (!accountNumber) {
    return '';
  }
  const lastChars = accountNumber.slice(-visibleChars);
  return `•••• ${lastChars}`;
}
