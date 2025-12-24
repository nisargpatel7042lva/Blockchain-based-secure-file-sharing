import CryptoJS from "crypto-js";

/**
 * Generate a random encryption key
 * @returns {string} Hex-encoded encryption key
 */
export function generateKey() {
  return CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);
}

/**
 * Encrypt a file buffer with AES-256
 * @param {Buffer} fileBuffer - The file buffer to encrypt
 * @param {string} key - Encryption key (hex string)
 * @returns {Buffer} Encrypted file buffer
 */
export function encryptFile(fileBuffer, key) {
  try {
    const wordArray = CryptoJS.lib.WordArray.create(fileBuffer);
    const keyHex = CryptoJS.enc.Hex.parse(key);
    
    // Generate random IV for CBC mode (16 bytes = 128 bits)
    const iv = CryptoJS.lib.WordArray.random(16);
    
    const encrypted = CryptoJS.AES.encrypt(wordArray, keyHex, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    // Convert IV and ciphertext to hex
    const ivHex = iv.toString(CryptoJS.enc.Hex);
    const encryptedHex = encrypted.ciphertext.toString(CryptoJS.enc.Hex);
    
    // Combine IV (16 bytes = 32 hex chars) + encrypted data
    // Format: [IV (32 hex chars)][Encrypted Data]
    const combinedHex = ivHex + encryptedHex;
    
    return Buffer.from(combinedHex, "hex");
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

/**
 * Decrypt a file buffer with AES-256
 * @param {Buffer} encryptedBuffer - The encrypted file buffer
 * @param {string} key - Encryption key (hex string)
 * @returns {Buffer} Decrypted file buffer
 */
export function decryptFile(encryptedBuffer, key) {
  try {
    const encryptedBytes = new Uint8Array(encryptedBuffer);
    
    // Extract IV (first 16 bytes) and encrypted data (rest)
    const ivBytes = encryptedBytes.slice(0, 16);
    const ciphertextBytes = encryptedBytes.slice(16);
    
    // Convert to hex strings
    const ivHex = Array.from(ivBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const encryptedHex = Array.from(ciphertextBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    
    const keyHex = CryptoJS.enc.Hex.parse(key);
    const ivWordArray = CryptoJS.enc.Hex.parse(ivHex);
    
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Hex.parse(encryptedHex),
    });

    const decrypted = CryptoJS.AES.decrypt(cipherParams, keyHex, {
      iv: ivWordArray,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    // Convert decrypted WordArray back to bytes
    const decryptedWordArray = decrypted;
    const decryptedHex = decryptedWordArray.toString(CryptoJS.enc.Hex);
    const decryptedBytes = new Uint8Array(
      decryptedHex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
    );
    
    return Buffer.from(decryptedBytes);
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

/**
 * Encrypt a key for a recipient using their public key
 * Note: This is a simplified version. In production, use proper RSA/ECC encryption
 * @param {string} key - The encryption key to encrypt
 * @param {string} recipientPublicKey - Recipient's public key (for now, we'll use a simple hash)
 * @returns {string} Encrypted key (base64 encoded)
 */
export function encryptKeyForRecipient(key, recipientPublicKey) {
  // Simplified: In production, use proper public key encryption (RSA/ECC)
  // For MVP, we'll use AES with a derived key from the recipient's address
  const derivedKey = CryptoJS.SHA256(recipientPublicKey).toString();
  const encrypted = CryptoJS.AES.encrypt(key, derivedKey).toString();
  return encrypted;
}

/**
 * Decrypt a key using recipient's private key
 * @param {string} encryptedKey - Encrypted key (base64 encoded)
 * @param {string} recipientPrivateKey - Recipient's private key/address
 * @returns {string} Decrypted key
 */
export function decryptKeyForRecipient(encryptedKey, recipientPrivateKey) {
  // Simplified: Match the encryption method above
  const derivedKey = CryptoJS.SHA256(recipientPrivateKey).toString();
  const decrypted = CryptoJS.AES.decrypt(encryptedKey, derivedKey);
  return decrypted.toString(CryptoJS.enc.Utf8);
}

/**
 * Hash a string (for storing key hashes on blockchain)
 * @param {string} data - Data to hash
 * @returns {string} SHA-256 hash (hex)
 */
export function hashString(data) {
  return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
}

