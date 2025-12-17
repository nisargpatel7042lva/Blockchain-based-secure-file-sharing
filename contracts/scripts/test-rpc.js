const hre = require("hardhat");

// Polygon Amoy Testnet (Mumbai is deprecated)
const AMOY_RPC_URLS = [
  "https://rpc.ankr.com/polygon_amoy",
  "https://polygon-amoy.drpc.org",
  "https://rpc-amoy.polygon.technology",
  "https://polygon-amoy-bor.publicnode.com",
];

// Legacy Mumbai endpoints (deprecated but kept for reference)
const MUMBAI_RPC_URLS = [
  "https://rpc-mumbai.matic.today",
  "https://matic-mumbai.chainstacklabs.com",
  "https://polygon-mumbai-bor.publicnode.com",
  "https://rpc.ankr.com/polygon_mumbai",
];

const RPC_URLS = [...AMOY_RPC_URLS, ...MUMBAI_RPC_URLS];

async function testRPC(rpcUrl) {
  try {
    console.log(`Testing: ${rpcUrl}`);
    const provider = new hre.ethers.JsonRpcProvider(rpcUrl);
    const startTime = Date.now();
    
    const blockNumber = await Promise.race([
      provider.getBlockNumber(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout after 10s")), 10000)
      )
    ]);
    
    const latency = Date.now() - startTime;
    console.log(`  ✓ Success! Block: ${blockNumber}, Latency: ${latency}ms\n`);
    return { success: true, latency, blockNumber };
  } catch (error) {
    console.log(`  ✗ Failed: ${error.message}\n`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log("Testing Polygon Testnet RPC Endpoints\n");
  console.log("⚠️  NOTE: Mumbai testnet is deprecated. Using Amoy testnet.\n");
  console.log("=" .repeat(60) + "\n");

  const results = [];
  
  for (const rpcUrl of RPC_URLS) {
    const result = await testRPC(rpcUrl);
    results.push({ rpcUrl, ...result });
  }

  console.log("=" .repeat(60));
  console.log("\nSummary:\n");
  
  const working = results.filter(r => r.success);
  if (working.length > 0) {
    console.log("✅ Working endpoints:");
    working.forEach(r => {
      console.log(`   ${r.rpcUrl} (${r.latency}ms)`);
    });
    console.log(`\n💡 Recommended: ${working[0].rpcUrl}`);
  } else {
    console.log("❌ No working endpoints found!");
    console.log("   Check your internet connection.");
  }

  const failed = results.filter(r => !r.success);
  if (failed.length > 0) {
    console.log("\n❌ Failed endpoints:");
    failed.forEach(r => {
      console.log(`   ${r.rpcUrl}`);
    });
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

