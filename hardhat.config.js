require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Helper function to validate private key
function getValidPrivateKey() {
  const privateKey = process.env.PRIVATE_KEY;
  
  if (!privateKey) {
    return [];
  }
  
  // Remove 0x prefix if present
  const cleanKey = privateKey.startsWith("0x") ? privateKey.slice(2) : privateKey;
  
  // Check if it's a valid hex string with correct length (64 hex chars = 32 bytes)
  const isValid = /^[0-9a-fA-F]{64}$/.test(cleanKey);
  
  if (!isValid) {
    console.warn("⚠️  Invalid PRIVATE_KEY format. Expected 64 hex characters (32 bytes).");
    console.warn("   Network accounts will be empty. Set a valid PRIVATE_KEY to deploy.");
    return [];
  }
  
  return [privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`];
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    mumbai: {
      url: process.env.POLYGON_MUMBAI_RPC_URL || "https://rpc-mumbai.matic.today",
      accounts: getValidPrivateKey(),
      chainId: 80001,
      timeout: 120000, // 120 seconds
      gas: "auto",
      gasPrice: "auto",
    },
    amoy: {
      url: process.env.POLYGON_AMOY_RPC_URL || "https://rpc.ankr.com/polygon_amoy",
      accounts: getValidPrivateKey(),
      chainId: 80002,
      timeout: 120000, // 120 seconds
      gas: "auto",
      gasPrice: "auto",
    },
    polygon: {
      url: process.env.POLYGON_MAINNET_RPC_URL || "https://polygon-rpc.com",
      accounts: getValidPrivateKey(),
      chainId: 137,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

