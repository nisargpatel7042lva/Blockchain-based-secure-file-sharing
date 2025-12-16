import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Upload a file
 * @param {File} file - File to upload
 * @param {string} ownerAddress - Wallet address of the owner
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} Upload response
 */
export async function uploadFile(file, ownerAddress, onProgress) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("ownerAddress", ownerAddress);

  const response = await api.post("/api/files/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });

  return response.data;
}

/**
 * Get file metadata
 * @param {string} fileId - File ID
 * @returns {Promise<Object>} File metadata
 */
export async function getFileMetadata(fileId) {
  const response = await api.get(`/api/files/${fileId}`);
  return response.data;
}

/**
 * Grant access to a file
 * @param {string} fileId - File ID
 * @param {string} recipient - Recipient address
 * @param {number} expirationDays - Expiration in days (0 for no expiration)
 * @returns {Promise<Object>} Response
 */
export async function grantAccess(fileId, recipient, expirationDays = 0) {
  const response = await api.post(`/api/files/${fileId}/grant-access`, {
    recipient,
    expiration: expirationDays,
  });
  return response.data;
}

/**
 * Revoke access to a file
 * @param {string} fileId - File ID
 * @param {string} recipient - Recipient address
 * @returns {Promise<Object>} Response
 */
export async function revokeAccess(fileId, recipient) {
  const response = await api.post(`/api/files/${fileId}/revoke-access`, {
    recipient,
  });
  return response.data;
}

/**
 * Check access to a file
 * @param {string} fileId - File ID
 * @param {string} userAddress - User address
 * @returns {Promise<Object>} Access status
 */
export async function checkAccess(fileId, userAddress) {
  const response = await api.get(`/api/files/${fileId}/check-access/${userAddress}`);
  return response.data;
}

/**
 * Download a file
 * @param {string} fileId - File ID
 * @param {string} userAddress - User address
 * @param {string} encryptionKey - Encryption key
 * @returns {Promise<Blob>} File blob
 */
export async function downloadFile(fileId, userAddress, encryptionKey) {
  const response = await api.get(`/api/files/${fileId}/download`, {
    params: {
      userAddress,
      encryptionKey,
    },
    responseType: "blob",
  });
  return response.data;
}

/**
 * Get audit trail for a file
 * @param {string} fileId - File ID
 * @param {number} fromBlock - Starting block number
 * @returns {Promise<Object>} Audit trail
 */
export async function getAuditTrail(fileId, fromBlock = 0) {
  const response = await api.get(`/api/files/${fileId}/audit`, {
    params: { fromBlock },
  });
  return response.data;
}

/**
 * Get files owned by an address
 * @param {string} ownerAddress - Owner address
 * @returns {Promise<Object>} Files list
 */
export async function getFilesByOwner(ownerAddress) {
  const response = await api.get(`/api/files/owner/${ownerAddress}`);
  return response.data;
}

export default api;

