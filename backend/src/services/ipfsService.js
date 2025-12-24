import { create } from "ipfs-http-client";

class IPFSService {
  constructor() {
    // Debug: Log environment variables
    console.log("🔍 DEBUG - Environment variables:");
    console.log("  IPFS_API_URL:", process.env.IPFS_API_URL || "(not set - using default Infura)");
    console.log("  PINATA_API_KEY:", process.env.PINATA_API_KEY ? "SET (" + process.env.PINATA_API_KEY.substring(0, 8) + "...)" : "NOT SET");
    console.log("  PINATA_SECRET_KEY:", process.env.PINATA_SECRET_KEY ? "SET (" + process.env.PINATA_SECRET_KEY.substring(0, 8) + "...)" : "NOT SET");
    console.log("  IPFS_PROJECT_ID:", process.env.IPFS_PROJECT_ID ? "SET" : "NOT SET");
    console.log("  IPFS_PROJECT_SECRET:", process.env.IPFS_PROJECT_SECRET ? "SET" : "NOT SET");
    
    // Use Infura IPFS by default (no local installation needed)
    // Or use custom IPFS_API_URL if provided
    const ipfsUrl = process.env.IPFS_API_URL || "https://ipfs.infura.io:5001";
    
    // Detect Pinata vs Infura
    this.isPinata = ipfsUrl.includes("pinata.cloud");
    console.log("  Detected provider:", this.isPinata ? "Pinata" : "Infura/Standard");
    
    if (this.isPinata) {
      // Pinata uses REST API, not standard IPFS HTTP API
      this.pinataApiKey = process.env.IPFS_PROJECT_ID || process.env.PINATA_API_KEY;
      this.pinataSecretKey = process.env.IPFS_PROJECT_SECRET || process.env.PINATA_SECRET_KEY;
      
      if (!this.pinataApiKey || !this.pinataSecretKey) {
        console.warn("⚠️  Pinata API credentials not set.");
        console.warn("   Set PINATA_API_KEY and PINATA_SECRET_KEY in backend/.env");
        console.warn("   Get credentials at: https://pinata.cloud/");
        console.warn("   Note: The IPFS_API_URL just needs to contain 'pinata.cloud' for detection");
      } else {
        console.log("✓ IPFS client initialized: Pinata (REST API)");
        console.log("  Endpoint: https://api.pinata.cloud/pinning/pinFileToIPFS");
        console.log("  API Key:", this.pinataApiKey.substring(0, 8) + "...");
      }
    } else {
      // Infura or standard IPFS HTTP API
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
  }

  /**
   * Upload a file buffer to IPFS
   * @param {Buffer} fileBuffer - The file buffer to upload
   * @returns {Promise<string>} IPFS hash (CID)
   */
  async uploadToIPFS(fileBuffer) {
    try {
      if (this.isPinata) {
        // Use Pinata REST API
        if (!this.pinataApiKey || !this.pinataSecretKey) {
          throw new Error(
            "Pinata API credentials not set. Please set PINATA_API_KEY and PINATA_SECRET_KEY in backend/.env\n" +
            "Get credentials at: https://pinata.cloud/"
          );
        }

        // Use form-data package for Node.js compatibility
        const FormDataModule = await import("form-data");
        const FormData = FormDataModule.default || FormDataModule;
        const formData = new FormData();
        
        formData.append("file", fileBuffer, {
          filename: "file",
          contentType: "application/octet-stream",
        });

        const headers = {
          pinata_api_key: this.pinataApiKey,
          pinata_secret_api_key: this.pinataSecretKey,
          ...formData.getHeaders(),
        };

        const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
          method: "POST",
          headers: headers,
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Pinata API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();
        const ipfsHash = result.IpfsHash;
        console.log("File uploaded to IPFS (Pinata):", ipfsHash);
        return ipfsHash;
      } else {
        // Use standard IPFS HTTP API (Infura, local, etc.)
        const result = await this.ipfs.add(fileBuffer, {
          pin: true, // Pin the file to ensure persistence
        });

        const ipfsHash = result.cid.toString();
        console.log("File uploaded to IPFS:", ipfsHash);
        return ipfsHash;
      }
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      
      // Provide helpful error messages for common issues
      if (error.response?.status === 401 || error.message?.includes("401")) {
        const ipfsUrl = process.env.IPFS_API_URL || "https://ipfs.infura.io:5001";
        if (ipfsUrl.includes("infura.io")) {
          throw new Error(
            "IPFS authentication failed. Please set IPFS_PROJECT_ID and IPFS_PROJECT_SECRET in backend/.env\n" +
            "Get free credentials at: https://infura.io/\n" +
            "Or use an alternative IPFS service like Pinata (https://pinata.cloud/) or Web3.Storage (https://web3.storage/)"
          );
        }
      }
      
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
      if (this.isPinata) {
        // Use Pinata gateway
        const gatewayUrl = process.env.PINATA_GATEWAY_URL || "https://gateway.pinata.cloud";
        const response = await fetch(`${gatewayUrl}/ipfs/${ipfsHash}`);
        
        if (!response.ok) {
          throw new Error(`Failed to retrieve file from Pinata: ${response.status} ${response.statusText}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);
        console.log("File retrieved from IPFS (Pinata):", ipfsHash);
        return fileBuffer;
      } else {
        // Use standard IPFS HTTP API
        const chunks = [];
        for await (const chunk of this.ipfs.cat(ipfsHash)) {
          chunks.push(chunk);
        }

        const fileBuffer = Buffer.concat(chunks);
        console.log("File retrieved from IPFS:", ipfsHash);
        return fileBuffer;
      }
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

