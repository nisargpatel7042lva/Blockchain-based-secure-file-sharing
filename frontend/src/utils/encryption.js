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
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/1d1c5cf2-4df9-4817-9e51-4488e33ebde7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'encryption.js:17',message:'encryptFile called',data:{fileBufferType:fileBuffer?.constructor?.name,fileBufferLength:fileBuffer?.byteLength,keyLength:key?.length,hasKey:!!key},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'K'})}).catch(()=>{});
  // #endregion
  try {
    if (!fileBuffer || !key) {
      throw new Error("fileBuffer and key are required");
    }
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/1d1c5cf2-4df9-4817-9e51-4488e33ebde7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'encryption.js:22',message:'Creating WordArray from fileBuffer',data:{fileBufferLength:fileBuffer.byteLength},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'L'})}).catch(()=>{});
    // #endregion
    
    // Convert ArrayBuffer to WordArray
    const wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(fileBuffer));
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/1d1c5cf2-4df9-4817-9e51-4488e33ebde7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'encryption.js:26',message:'Parsing encryption key',data:{keyLength:key.length,keyType:typeof key},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'M'})}).catch(()=>{});
    // #endregion
    
    // Parse key as hex string (64 chars = 32 bytes)
    const keyHex = CryptoJS.enc.Hex.parse(key);
    
    // Generate random IV for CBC mode (16 bytes = 128 bits)
    const iv = CryptoJS.lib.WordArray.random(16);
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/1d1c5cf2-4df9-4817-9e51-4488e33ebde7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'encryption.js:32',message:'Encrypting with AES',data:{wordArrayLength:wordArray.words?.length,hasIV:!!iv,keyLength:keyHex.words?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'N'})}).catch(()=>{});
    // #endregion
    
    const encrypted = CryptoJS.AES.encrypt(wordArray, keyHex, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/1d1c5cf2-4df9-4817-9e51-4488e33ebde7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'encryption.js:35',message:'Encryption complete, converting to hex',data:{hasCiphertext:!!encrypted.ciphertext,hasSalt:!!encrypted.salt},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'O'})}).catch(()=>{});
    // #endregion

    // Convert ciphertext and IV to hex
    const encryptedHex = encrypted.ciphertext.toString(CryptoJS.enc.Hex);
    const ivHex = iv.toString(CryptoJS.enc.Hex);
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/1d1c5cf2-4df9-4817-9e51-4488e33ebde7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'encryption.js:42',message:'Encrypted hex string created',data:{encryptedHexLength:encryptedHex?.length,hasEncryptedHex:!!encryptedHex,ivHexLength:ivHex?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'P'})}).catch(()=>{});
    // #endregion
    
    if (!encryptedHex || encryptedHex.length === 0) {
      throw new Error("Encryption produced empty result");
    }
    
    // Combine IV (16 bytes = 32 hex chars) + encrypted data
    // Format: [IV (32 hex chars)][Encrypted Data]
    const combinedHex = ivHex + encryptedHex;
    const hexPairs = combinedHex.match(/.{1,2}/g);
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/1d1c5cf2-4df9-4817-9e51-4488e33ebde7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'encryption.js:52',message:'Parsing hex pairs',data:{hexPairsLength:hexPairs?.length,hasHexPairs:!!hexPairs,combinedHexLength:combinedHex.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'Q'})}).catch(()=>{});
    // #endregion
    
    if (!hexPairs || hexPairs.length === 0) {
      throw new Error("Failed to parse encrypted data");
    }
    
    const encryptedBytes = new Uint8Array(
      hexPairs.map((byte) => parseInt(byte, 16))
    );
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/1d1c5cf2-4df9-4817-9e51-4488e33ebde7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'encryption.js:62',message:'Creating blob from encrypted bytes',data:{encryptedBytesLength:encryptedBytes.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'R'})}).catch(()=>{});
    // #endregion
    
    return new Blob([encryptedBytes], { type: "application/octet-stream" });
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/1d1c5cf2-4df9-4817-9e51-4488e33ebde7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'encryption.js:59',message:'Encryption error',data:{error:error.message,errorStack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'S'})}).catch(()=>{});
    // #endregion
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
    const encryptedBytes = new Uint8Array(arrayBuffer);
    
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

