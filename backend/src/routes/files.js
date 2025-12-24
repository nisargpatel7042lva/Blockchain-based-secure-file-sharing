import express from "express";
import multer from "multer";
import { appendFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import ipfsService from "../services/ipfsService.js";
import blockchainService from "../services/blockchainService.js";
import {
  generateKey,
  encryptFile,
  decryptFile,
  hashString,
} from "../utils/encryption.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const LOG_PATH = join(__dirname, "../../../.cursor/debug.log");

function logDebug(location, message, data, hypothesisId) {
  try {
    const logEntry = JSON.stringify({
      location,
      message,
      data,
      timestamp: Date.now(),
      sessionId: "debug-session",
      runId: "run1",
      hypothesisId,
    }) + "\n";
    appendFileSync(LOG_PATH, logEntry, "utf8");
  } catch (e) {
    // Ignore logging errors
  }
}

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /api/files/upload
 * Upload a file: encrypt, store on IPFS, register on blockchain
 */
router.post("/upload", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const ownerAddress = req.body.ownerAddress;
    if (!ownerAddress) {
      return res.status(400).json({ error: "ownerAddress is required" });
    }

    // Generate encryption key
    const encryptionKey = generateKey();
    
    // Encrypt file
    const encryptedFile = encryptFile(req.file.buffer, encryptionKey);
    
    // Upload to IPFS
    let ipfsHash;
    try {
      ipfsHash = await ipfsService.uploadToIPFS(encryptedFile);
    } catch (ipfsError) {
      // Return a user-friendly error for IPFS issues
      return res.status(500).json({ 
        error: "File upload failed",
        message: ipfsError.message,
        details: "Please configure IPFS credentials in backend/.env. See server logs for details."
      });
    }
    
    // Hash the encrypted key (for blockchain storage)
    const encryptedKeyHash = hashString(encryptionKey);
    
    // Register on blockchain
    const { fileId, txHash } = await blockchainService.uploadFileMetadata(
      ipfsHash,
      encryptedKeyHash
    );

    // Return response (NOTE: In production, encryption key should be encrypted for owner)
    res.json({
      success: true,
      fileId,
      ipfsHash,
      txHash,
      encryptionKey, // In production, this should be encrypted and returned securely
      message: "File uploaded successfully",
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/files/:fileId
 * Get file metadata
 */
router.get("/:fileId", async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const fileMetadata = await blockchainService.getFileMetadata(fileId);
    
    res.json({
      success: true,
      file: fileMetadata,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/files/:fileId/grant-access
 * Grant access to a file
 */
router.post("/:fileId/grant-access", async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const { recipient, expiration } = req.body;

    if (!recipient) {
      return res.status(400).json({ error: "recipient address is required" });
    }

    // Convert expiration to timestamp if provided (in days)
    let expirationTimestamp = 0;
    if (expiration && expiration > 0) {
      expirationTimestamp = Math.floor(Date.now() / 1000) + (expiration * 24 * 60 * 60);
    }

    const { txHash } = await blockchainService.grantAccess(
      fileId,
      recipient,
      expirationTimestamp
    );

    res.json({
      success: true,
      txHash,
      expiration: expirationTimestamp > 0 ? new Date(expirationTimestamp * 1000).toISOString() : null,
      message: "Access granted successfully",
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/files/:fileId/revoke-access
 * Revoke access to a file
 */
router.post("/:fileId/revoke-access", async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const { recipient } = req.body;

    if (!recipient) {
      return res.status(400).json({ error: "recipient address is required" });
    }

    const { txHash } = await blockchainService.revokeAccess(fileId, recipient);

    res.json({
      success: true,
      txHash,
      message: "Access revoked successfully",
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/files/:fileId/check-access/:userAddress
 * Check if a user has access to a file
 */
router.get("/:fileId/check-access/:userAddress", async (req, res, next) => {
  try {
    const { fileId, userAddress } = req.params;
    
    const hasAccess = await blockchainService.checkAccess(fileId, userAddress);
    
    // Log the access attempt
    await blockchainService.logAccess(fileId, userAddress, hasAccess);

    res.json({
      success: true,
      hasAccess,
      fileId,
      userAddress,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/files/:fileId/download
 * Download a file (if authorized)
 */
router.get("/:fileId/download", async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const userAddress = req.query.userAddress;
    const encryptionKey = req.query.encryptionKey;

    if (!userAddress) {
      return res.status(400).json({ error: "userAddress is required" });
    }

    if (!encryptionKey) {
      return res.status(400).json({ error: "encryptionKey is required" });
    }

    // Check access
    const hasAccess = await blockchainService.checkAccess(fileId, userAddress);
    
    if (!hasAccess) {
      await blockchainService.logAccess(fileId, userAddress, false);
      return res.status(403).json({ error: "Access denied" });
    }

    // Get file metadata
    const fileMetadata = await blockchainService.getFileMetadata(fileId);
    
    // Retrieve from IPFS
    const encryptedFile = await ipfsService.getFromIPFS(fileMetadata.ipfsHash);
    
    // Decrypt file
    const decryptedFile = decryptFile(encryptedFile, encryptionKey);

    // Log successful access
    await blockchainService.logAccess(fileId, userAddress, true);

    // Send file
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="file-${fileId}"`);
    res.send(decryptedFile);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/files/:fileId/audit
 * Get audit trail for a file
 */
router.get("/:fileId/audit", async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const fromBlock = req.query.fromBlock ? parseInt(req.query.fromBlock) : 0;
    
    const auditTrail = await blockchainService.getAuditTrail(fileId, fromBlock);

    res.json({
      success: true,
      fileId,
      events: auditTrail,
      count: auditTrail.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/files/owner/:ownerAddress
 * Get all files owned by an address
 */
router.get("/owner/:ownerAddress", async (req, res, next) => {
  // #region agent log
  logDebug("files.js:238", "GET /owner/:ownerAddress called", { ownerAddress: req.params.ownerAddress }, "A");
  // #endregion
  try {
    const { ownerAddress } = req.params;
    
    // #region agent log
    logDebug("files.js:242", "Validating ownerAddress", { ownerAddress, isValid: !!ownerAddress && ownerAddress.match(/^0x[a-fA-F0-9]{40}$/) }, "B");
    // #endregion
    
    if (!ownerAddress || !ownerAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ 
        error: "Invalid wallet address format",
        ownerAddress 
      });
    }
    
    // #region agent log
    logDebug("files.js:250", "Checking blockchainService initialization", { ownerAddress, blockchainServiceInitialized: blockchainService.initialized }, "C");
    // #endregion
    
    // Handle uninitialized blockchain service gracefully
    if (!blockchainService.initialized) {
      // #region agent log
      logDebug("files.js:261", "Returning empty list (blockchain not initialized)", { ownerAddress }, "D");
      // #endregion
      return res.json({
        success: true,
        owner: ownerAddress,
        files: [],
        count: 0,
        message: "Blockchain service not initialized. Set PRIVATE_KEY and FILE_REGISTRY_CONTRACT_ADDRESS in backend/.env"
      });
    }
    
    // #region agent log
    logDebug("files.js:299", "Calling blockchainService.getFilesByOwner", { ownerAddress }, "E");
    // #endregion
    
    const fileIds = await blockchainService.getFilesByOwner(ownerAddress);
    
    // #region agent log
    logDebug("files.js:302", "getFilesByOwner returned", { fileIds: fileIds ? fileIds.length : 0, fileIdsArray: fileIds }, "F");
    // #endregion
    
    if (!fileIds || fileIds.length === 0) {
      return res.json({
        success: true,
        owner: ownerAddress,
        files: [],
        count: 0,
      });
    }
    
    // #region agent log
    logDebug("files.js:312", "Fetching metadata for files", { fileCount: fileIds.length }, "G");
    // #endregion
    
    // Get metadata for each file
    const files = await Promise.all(
      fileIds.map(async (fileId) => {
        try {
          // #region agent log
          logDebug("files.js:318", "Fetching metadata for fileId", { fileId }, "H");
          // #endregion
          const metadata = await blockchainService.getFileMetadata(fileId);
          // #region agent log
          logDebug("files.js:321", "Metadata fetched successfully", { fileId, hasMetadata: !!metadata }, "I");
          // #endregion
          return metadata;
        } catch (error) {
          // #region agent log
          logDebug("files.js:324", "Error fetching file metadata", { fileId, error: error.message }, "J");
          // #endregion
          console.error(`Error fetching file ${fileId}:`, error);
          return null;
        }
      })
    );

    // #region agent log
    logDebug("files.js:332", "All metadata fetched, sending response", { filesCount: files.length, validFilesCount: files.filter((f) => f !== null).length }, "K");
    // #endregion

    res.json({
      success: true,
      owner: ownerAddress,
      files: files.filter((f) => f !== null),
      count: files.filter((f) => f !== null).length,
    });
  } catch (error) {
    // #region agent log
    logDebug("files.js:342", "Error in /owner/:ownerAddress route", { error: error.message, ownerAddress: req.params.ownerAddress }, "L");
    // #endregion
    console.error("Error in /owner/:ownerAddress:", error);
    next(error);
  }
});

export default router;

