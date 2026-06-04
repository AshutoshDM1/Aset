import crypto from 'crypto';

// The key used for encrypting API secrets in the DB.
// In production, configure API_KEY_ENCRYPTION_KEY in your .env as a 32-byte secret.
const ENCRYPTION_KEY =
  process.env.API_KEY_ENCRYPTION_KEY || 'aset-default-dev-key-32-bytes-!'; // fallback key

const IV_LENGTH = 16;

/**
 * Encrypts a plaintext string using AES-256-CBC.
 */
export function encryptSecret(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  // Ensure encryption key is exactly 32 bytes
  const key = Buffer.from(ENCRYPTION_KEY.slice(0, 32).padEnd(32, '0'));

  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypts an encrypted string using AES-256-CBC.
 */
export function decryptSecret(encryptedText: string): string {
  try {
    const textParts = encryptedText.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encrypted = Buffer.from(textParts.join(':'), 'hex');
    const key = Buffer.from(ENCRYPTION_KEY.slice(0, 32).padEnd(32, '0'));

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  } catch (err) {
    throw new Error(
      'Failed to decrypt API Secret. Ensure API_KEY_ENCRYPTION_KEY matches.',
    );
  }
}
