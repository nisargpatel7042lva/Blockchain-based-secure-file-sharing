import { ethers } from "ethers";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load contract ABI
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
let FileRegistryABI;

try {
  // Try to load from backend artifacts (after setup script)
  const abiPath = join(__dirname, "../../artifacts/contracts/FileRegistry.sol/FileRegistry.json");
  const abiFile = readFileSync(abiPath, "utf8");
  FileRegistryABI = JSON.parse(abiFile);
} catch (error) {
  // Fallback: try root artifacts (if running from root)
  try {
    const rootAbiPath = join(__dirname, "../../../artifacts/contracts/FileRegistry.sol/FileRegistry.json");
    const abiFile = readFileSync(rootAbiPath, "utf8");
    FileRegistryABI = JSON.parse(abiFile);
  } catch (fallbackError) {
    console.error("Error loading contract ABI. Please compile contracts and run setup script:");
    console.error("  cd contracts && npm run compile");
    console.error("  node scripts/setup-contracts.js");
    throw new Error("Contract ABI not found. Please compile contracts first.");
  }
}

class BlockchainService {
  constructor() {
    // Use Ethereum Sepolia (default) or legacy Polygon networks
    const rpcUrl = process.env.ALCHEMY_SEPOLIA_URL || 
                   process.env.ETHEREUM_SEPOLIA_RPC_URL || 
                   process.env.POLYGON_AMOY_RPC_URL || 
                   process.env.POLYGON_MUMBAI_RPC_URL || 
                   "https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY";
    const privateKey = process.env.PRIVATE_KEY;
    const contractAddress = process.env.FILE_REGISTRY_CONTRACT_ADDRESS;

    if (!privateKey) {
      console.warn("⚠️  PRIVATE_KEY not set in environment variables");
      console.warn("   Blockchain features will be disabled. Set PRIVATE_KEY in backend/.env to enable.");
      this.initialized = false;
      return;
    }

    if (!contractAddress) {
      console.warn("⚠️  FILE_REGISTRY_CONTRACT_ADDRESS not set in environment variables");
      console.warn("   Deploy contracts first and set the address in backend/.env");
      this.initialized = false;
      return;
    }

    // Initialize provider and signer
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.signer = new ethers.Wallet(privateKey, this.provider);
    
    // Initialize contract
    this.contract = new ethers.Contract(
      contractAddress,
      FileRegistryABI.abi,
      this.signer
    );

    this.initialized = true;
    console.log("✓ Blockchain service initialized");
    console.log("  Contract address:", contractAddress);
    console.log("  Signer address:", this.signer.address);
  }

  _checkInitialized() {
    if (!this.initialized) {
      throw new Error("Blockchain service not initialized. Please set PRIVATE_KEY and FILE_REGISTRY_CONTRACT_ADDRESS in backend/.env");
    }
  }

  /**
   * Upload file metadata to blockchain
   * @param {string} ipfsHash - IPFS hash of the file
   * @param {string} encryptedKeyHash - Hash of the encrypted encryption key
   * @returns {Promise<{fileId: string, txHash: string}>}
   */
  async uploadFileMetadata(ipfsHash, encryptedKeyHash) {
    this._checkInitialized();
    try {
      const tx = await this.contract.uploadFile(ipfsHash, encryptedKeyHash);
      const receipt = await tx.wait();

      // Get fileId from events
      const fileUploadedEvent = receipt.logs.find(
        (log) => {
          try {
            const parsed = this.contract.interface.parseLog(log);
            return parsed && parsed.name === "FileUploaded";
          } catch {
            return false;
          }
        }
      );

      let fileId = null;
      if (fileUploadedEvent) {
        const parsed = this.contract.interface.parseLog(fileUploadedEvent);
        fileId = parsed.args.id.toString();
      } else {
        // Fallback: get file count
        const fileCount = await this.contract.getFileCount();
        fileId = fileCount.toString();
      }

      return {
        fileId,
        txHash: receipt.hash,
      };
    } catch (error) {
      console.error("Error uploading file metadata:", error);
      throw new Error(`Blockchain upload failed: ${error.message}`);
    }
  }

  /**
   * Grant access to a file
   * @param {string} fileId - File ID
   * @param {string} recipient - Recipient address
   * @param {number} expiration - Expiration timestamp (0 for no expiration)
   * @returns {Promise<{txHash: string}>}
   */
  async grantAccess(fileId, recipient, expiration = 0) {
    this._checkInitialized();
    try {
      const tx = await this.contract.grantAccess(fileId, recipient, expiration);
      const receipt = await tx.wait();

      return {
        txHash: receipt.hash,
      };
    } catch (error) {
      console.error("Error granting access:", error);
      throw new Error(`Grant access failed: ${error.message}`);
    }
  }

  /**
   * Revoke access to a file
   * @param {string} fileId - File ID
   * @param {string} recipient - Recipient address
   * @returns {Promise<{txHash: string}>}
   */
  async revokeAccess(fileId, recipient) {
    this._checkInitialized();
    try {
      const tx = await this.contract.revokeAccess(fileId, recipient);
      const receipt = await tx.wait();

      return {
        txHash: receipt.hash,
      };
    } catch (error) {
      console.error("Error revoking access:", error);
      throw new Error(`Revoke access failed: ${error.message}`);
    }
  }

  /**
   * Check if a user has access to a file
   * @param {string} fileId - File ID
   * @param {string} userAddress - User address
   * @returns {Promise<boolean>}
   */
  async checkAccess(fileId, userAddress) {
    this._checkInitialized();
    try {
      const hasAccess = await this.contract.checkAccess(fileId, userAddress);
      return hasAccess;
    } catch (error) {
      console.error("Error checking access:", error);
      throw new Error(`Check access failed: ${error.message}`);
    }
  }

  /**
   * Get file metadata
   * @param {string} fileId - File ID
   * @returns {Promise<Object>} File metadata
   */
  async getFileMetadata(fileId) {
    this._checkInitialized();
    try {
      const file = await this.contract.getFile(fileId);
      return {
        id: file.id.toString(),
        owner: file.owner,
        ipfsHash: file.ipfsHash,
        encryptedKeyHash: file.encryptedKeyHash,
        timestamp: file.timestamp.toString(),
      };
    } catch (error) {
      console.error("Error getting file metadata:", error);
      throw new Error(`Get file metadata failed: ${error.message}`);
    }
  }

  /**
   * Log an access attempt
   * @param {string} fileId - File ID
   * @param {string} userAddress - User address
   * @param {boolean} success - Whether access was successful
   * @returns {Promise<{txHash: string}>}
   */
  async logAccess(fileId, userAddress, success) {
    if (!this.initialized) {
      // Don't throw for logging - just skip
      return { txHash: null };
    }
    try {
      const tx = await this.contract.logAccess(fileId, userAddress, success);
      const receipt = await tx.wait();

      return {
        txHash: receipt.hash,
      };
    } catch (error) {
      console.error("Error logging access:", error);
      // Don't throw - logging failures shouldn't break the flow
      return { txHash: null };
    }
  }

  /**
   * Get audit trail events for a file
   * @param {string} fileId - File ID
   * @param {number} fromBlock - Starting block number (optional)
   * @returns {Promise<Array>} Array of events
   */
  async getAuditTrail(fileId, fromBlock = 0) {
    this._checkInitialized();
    try {
      const filter = this.contract.filters.AccessAttempt(fileId);
      const events = await this.contract.queryFilter(filter, fromBlock);

      return events.map((event) => ({
        fileId: event.args.fileId.toString(),
        user: event.args.user,
        success: event.args.success,
        timestamp: event.args.timestamp.toString(),
        blockNumber: event.blockNumber,
        txHash: event.transactionHash,
      }));
    } catch (error) {
      console.error("Error getting audit trail:", error);
      throw new Error(`Get audit trail failed: ${error.message}`);
    }
  }

  /**
   * Get files owned by an address
   * @param {string} ownerAddress - Owner address
   * @returns {Promise<Array<string>>} Array of file IDs
   */
  async getFilesByOwner(ownerAddress) {
    this._checkInitialized();
    try {
      const fileIds = await this.contract.getFilesByOwner(ownerAddress);
      return fileIds.map((id) => id.toString());
    } catch (error) {
      console.error("Error getting files by owner:", error);
      throw new Error(`Get files by owner failed: ${error.message}`);
    }
  }
}

export default new BlockchainService();

