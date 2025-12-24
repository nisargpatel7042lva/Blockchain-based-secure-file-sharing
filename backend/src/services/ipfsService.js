import { create } from "ipfs-http-client";

class IPFSService {
  constructor() {
    // Use Infura IPFS by default (no local installation needed)
    // Or use custom IPFS_API_URL if provided
    const ipfsUrl = process.env.IPFS_API_URL || "https://ipfs.infura.io:5001";
    
    // Configure IPFS client with Infura authentication
    const projectId = process.env.IPFS_PROJECT_ID || process.env.INFURA_PROJECT_ID;
    const projectSecret = process.env.IPFS_PROJECT_SECRET || process.env.INFURA_PROJECT_SECRET;
    
    const auth = projectId && projectSecret
      ? `Basic ${Buffer.from(`${projectId}:${projectSecret}`).toString("base64")}`
      : undefined;

    const config = {
      url: ipfsUrl,
      ...(auth && { headers: { authorization: auth } }),
    };

    try {
      this.ipfs = create(config);
      console.log("IPFS client initialized:", ipfsUrl.replace(/\/\/.*@/, "//***@") || ipfsUrl);
      if (!auth && ipfsUrl.includes("infura.io")) {
        console.warn("⚠️  IPFS_PROJECT_ID and IPFS_PROJECT_SECRET not set.");
        console.warn("   Using Infura IPFS without auth (may have rate limits).");
        console.warn("   Get free credentials at: https://infura.io/");
      }
    } catch (error) {
      console.error("Failed to initialize IPFS client:", error);
      throw error;
    }
  }

  /**
   * Upload a file buffer to IPFS
   * @param {Buffer} fileBuffer - The file buffer to upload
   * @returns {Promise<string>} IPFS hash (CID)
   */
  async uploadToIPFS(fileBuffer) {
    try {
      const result = await this.ipfs.add(fileBuffer, {
        pin: true, // Pin the file to ensure persistence
      });

      const ipfsHash = result.cid.toString();
      console.log("File uploaded to IPFS:", ipfsHash);
      return ipfsHash;
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      throw new Error(`IPFS upload failed: ${error.message}`);
    }
  }

  /**
   * Retrieve a file from IPFS
   * @param {string} ipfsHash - The IPFS hash (CID) of the file
   * @returns {Promise<Buffer>} The file buffer
   */
  async getFromIPFS(ipfsHash) {
    try {
      const chunks = [];
      for await (const chunk of this.ipfs.cat(ipfsHash)) {
        chunks.push(chunk);
      }

      const fileBuffer = Buffer.concat(chunks);
      console.log("File retrieved from IPFS:", ipfsHash);
      return fileBuffer;
    } catch (error) {
      console.error("Error retrieving from IPFS:", error);
      throw new Error(`IPFS retrieval failed: ${error.message}`);
    }
  }

  /**
   * Check if IPFS node is accessible
   * @returns {Promise<boolean>}
   */
  async isConnected() {
    try {
      const version = await this.ipfs.version();
      return !!version;
    } catch (error) {
      return false;
    }
  }
}

export default new IPFSService();

