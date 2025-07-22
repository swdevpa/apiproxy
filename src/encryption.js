// Encryption utilities for secure secrets management
export class EncryptionManager {
  constructor(env) {
    this.env = env;
    this.ENCRYPTION_KEY = env.ENCRYPTION_KEY; // 32-byte base64 encoded key
  }

  // Import encryption key
  async getKey() {
    const keyData = Uint8Array.from(atob(this.ENCRYPTION_KEY), c => c.charCodeAt(0));
    return await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Encrypt sensitive data
  async encrypt(plaintext) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    const key = await this.getKey();
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    // Combine iv and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return btoa(String.fromCharCode(...combined));
  }

  // Decrypt sensitive data
  async decrypt(encryptedData) {
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const key = await this.getKey();
    
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }
}