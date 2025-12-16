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
 * @param {ArrayBuffer} fileBuffer - The file buffer to encrypt
 * @param {string} key - Encryption key (hex string)
 * @returns {Promise<Blob>} Encrypted file blob
 */
export async function encryptFile(fileBuffer, key) {
  try {
    // Convert ArrayBuffer to WordArray
    const wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(fileBuffer));
    const keyHex = CryptoJS.enc.Hex.parse(key);
    
    const encrypted = CryptoJS.AES.encrypt(wordArray, keyHex, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    // Convert ciphertext to blob
    const encryptedHex = encrypted.ciphertext.toString(CryptoJS.enc.Hex);
    const encryptedBytes = new Uint8Array(
      encryptedHex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
    );
    
    return new Blob([encryptedBytes], { type: "application/octet-stream" });
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

/**
 * Decrypt a file blob with AES-256
 * @param {Blob} encryptedBlob - The encrypted file blob
 * @param {string} key - Encryption key (hex string)
 * @returns {Promise<Blob>} Decrypted file blob
 */
export async function decryptFile(encryptedBlob, key) {
  try {
    const arrayBuffer = await encryptedBlob.arrayBuffer();
    const encryptedHex = Array.from(new Uint8Array(arrayBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    
    const keyHex = CryptoJS.enc.Hex.parse(key);
    
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Hex.parse(encryptedHex),
    });

    const decrypted = CryptoJS.AES.decrypt(cipherParams, keyHex, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const decryptedWordArray = decrypted;
    const decryptedBytes = CryptoJS.enc.Utf8.parse(decryptedWordArray.toString(CryptoJS.enc.Utf8));
    
    return new Blob([decryptedBytes], { type: "application/octet-stream" });
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

/**
 * Convert file to ArrayBuffer
 * @param {File} file - File object
 * @returns {Promise<ArrayBuffer>}
 */
export async function fileToArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

