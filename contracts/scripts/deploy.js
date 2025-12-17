const hre = require("hardhat");

// List of fallback RPC endpoints (Polygon Amoy - Mumbai is deprecated)
const FALLBACK_RPC_URLS = [
  "https://rpc.ankr.com/polygon_amoy",
  "https://polygon-amoy.drpc.org",
  "https://rpc-amoy.polygon.technology",
  "https://polygon-amoy-bor.publicnode.com",
];

async function testRPCConnection(rpcUrl) {
  try {
    const provider = new hre.ethers.JsonRpcProvider(rpcUrl);
    await Promise.race([
      provider.getBlockNumber(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), 10000)
      )
    ]);
    return true;
  } catch (error) {
    return false;
  }
}

async function findWorkingRPC() {
  // Check for Amoy first (new testnet), then Mumbai (deprecated)
  const customRPC = process.env.POLYGON_AMOY_RPC_URL || process.env.POLYGON_MUMBAI_RPC_URL;
  
  if (customRPC) {
    console.log(`Testing custom RPC: ${customRPC}`);
    if (await testRPCConnection(customRPC)) {
      console.log("✓ Custom RPC is working");
      return customRPC;
    }
    console.log("✗ Custom RPC failed, trying fallbacks...");
  }

  console.log("Testing fallback RPC endpoints...");
  for (const rpcUrl of FALLBACK_RPC_URLS) {
    console.log(`  Testing: ${rpcUrl}`);
    if (await testRPCConnection(rpcUrl)) {
      console.log(`✓ Found working RPC: ${rpcUrl}`);
      return rpcUrl;
    }
    console.log(`  ✗ Failed`);
  }
  
  throw new Error("All RPC endpoints failed. Check your internet connection.");
}

async function main() {
  console.log("Deploying FileRegistry contract...");
  console.log(`Network: ${hre.network.name}`);
  
  if (hre.network.name === "mumbai") {
    console.log("⚠️  WARNING: Mumbai testnet is deprecated!");
    console.log("   Consider switching to Amoy testnet (chainId: 80002)");
    console.log("   Use: npm run deploy:amoy\n");
  }
  
  console.log("");

  // Test RPC connection
  try {
    const rpcUrl = await findWorkingRPC();
    if (rpcUrl !== process.env.POLYGON_MUMBAI_RPC_URL) {
      console.log(`\n⚠️  Using fallback RPC: ${rpcUrl}`);
      console.log("   Consider updating POLYGON_MUMBAI_RPC_URL in your .env file\n");
    }
  } catch (error) {
    console.error("\n❌ RPC Connection Error:", error.message);
    console.error("\nTroubleshooting:");
    console.error("1. Check your internet connection");
    console.error("2. Try a different RPC endpoint (see RPC_ENDPOINTS.md)");
    console.error("3. Check if you're behind a firewall/proxy");
    process.exit(1);
  }

  try {
    console.log("Getting contract factory...");
    const FileRegistry = await hre.ethers.getContractFactory("FileRegistry");
    
    console.log("Deploying contract (this may take a while)...");
    const fileRegistry = await FileRegistry.deploy();

    console.log("Waiting for deployment confirmation...");
    await fileRegistry.waitForDeployment();

    const address = await fileRegistry.getAddress();
    console.log("\n✅ FileRegistry deployed successfully!");
    console.log("Contract address:", address);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: address,
    deployer: (await hre.ethers.getSigners())[0].address,
    timestamp: new Date().toISOString(),
  };

  console.log("\nDeployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Export for use in backend/frontend
  const fs = require("fs");
  const path = require("path");
  
  const exportPath = path.join(__dirname, "../../deployment.json");
  fs.writeFileSync(exportPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\nDeployment info saved to: ${exportPath}`);
}

  } catch (error) {
    console.error("\n❌ Deployment Error:");
    if (error.code === "UND_ERR_CONNECT_TIMEOUT" || error.message.includes("timeout")) {
      console.error("Connection timeout. Possible causes:");
      console.error("1. RPC endpoint is slow or unreachable");
      console.error("2. Network connectivity issues");
      console.error("3. Firewall blocking the connection");
      console.error("\nTry:");
      console.error("- Using a different RPC endpoint");
      console.error("- Checking your internet connection");
      console.error("- Running: npm run deploy:mumbai");
    } else {
      console.error(error);
    }
    throw error;
  }
}

main()
  .then(() => {
    console.log("\n✅ Deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed!");
    process.exit(1);
  });

