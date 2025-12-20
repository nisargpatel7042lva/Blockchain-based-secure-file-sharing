const hre = require("hardhat");

// Ethereum Sepolia testnet RPC endpoints (Alchemy recommended)
const ETHEREUM_SEPOLIA_RPC_URLS = [
  process.env.ALCHEMY_SEPOLIA_URL || process.env.ETHEREUM_SEPOLIA_RPC_URL, // User's Alchemy URL
  "https://eth-sepolia.g.alchemy.com/v2/demo", // Alchemy demo (may have rate limits)
  "https://sepolia.infura.io/v3/", // Infura (requires API key)
  "https://rpc.sepolia.org", // Public Sepolia RPC
  "https://ethereum-sepolia-rpc.publicnode.com", // PublicNode
].filter(Boolean); // Remove undefined values

// Legacy Polygon fallback RPCs (for backward compatibility)
const FALLBACK_RPC_URLS = [
  "https://polygon-amoy.drpc.org",
  "https://rpc-amoy.polygon.technology",
  "https://rpc.ankr.com/polygon_amoy",
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
  // Check network type and use appropriate RPC endpoints
  const networkName = hre.network.name.toLowerCase();
  
  if (networkName === "sepolia" || networkName === "mainnet") {
    // Ethereum network - use Alchemy or custom RPC
    const customRPC = process.env.ALCHEMY_SEPOLIA_URL || process.env.ETHEREUM_SEPOLIA_RPC_URL || 
                      (networkName === "mainnet" ? process.env.ALCHEMY_MAINNET_URL || process.env.ETHEREUM_MAINNET_RPC_URL : null);
    
    if (customRPC && customRPC.includes("alchemy.com")) {
      console.log(`Using Alchemy RPC: ${customRPC.split('/v2/')[0]}...`);
      if (await testRPCConnection(customRPC)) {
        console.log("✓ Alchemy RPC is working");
        return customRPC;
      }
    }
    
    // Try fallback Ethereum RPCs
    for (const rpcUrl of ETHEREUM_SEPOLIA_RPC_URLS) {
      if (rpcUrl && await testRPCConnection(rpcUrl)) {
        console.log(`✓ Found working Ethereum RPC: ${rpcUrl}`);
        return rpcUrl;
      }
    }
  }
  
  // Legacy Polygon networks
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
  
  const networkName = hre.network.name.toLowerCase();
  
  if (networkName === "sepolia") {
    console.log("✓ Deploying to Ethereum Sepolia testnet");
    console.log("  Chain ID: 11155111");
    console.log("  Explorer: https://sepolia.etherscan.io\n");
  } else if (networkName === "mainnet") {
    console.log("⚠️  WARNING: Deploying to Ethereum MAINNET!");
    console.log("   This will cost real ETH. Make sure you want to proceed.\n");
  } else if (networkName === "mumbai") {
    console.log("⚠️  WARNING: Mumbai testnet is deprecated!");
    console.log("   Consider switching to Ethereum Sepolia testnet");
    console.log("   Use: npm run deploy:sepolia\n");
  }
  
  console.log("");

  // Test RPC connection
  let workingRPC = null;
  try {
    workingRPC = await findWorkingRPC();
    const envRPC = networkName === "sepolia" || networkName === "mainnet"
      ? (process.env.ALCHEMY_SEPOLIA_URL || process.env.ETHEREUM_SEPOLIA_RPC_URL || process.env.ALCHEMY_MAINNET_URL || process.env.ETHEREUM_MAINNET_RPC_URL)
      : (process.env.POLYGON_AMOY_RPC_URL || process.env.POLYGON_MUMBAI_RPC_URL);
    
    if (workingRPC !== envRPC) {
      console.log(`\n⚠️  Found working RPC: ${workingRPC}`);
      console.log(`   Your .env has: ${envRPC || "not set"}`);
      if (networkName === "sepolia" || networkName === "mainnet") {
        console.log(`\n💡 Update your contracts/.env file:`);
        console.log(`   ALCHEMY_SEPOLIA_URL=${workingRPC}`);
        console.log(`   Or: ETHEREUM_SEPOLIA_RPC_URL=${workingRPC}\n`);
      } else {
        console.log(`\n💡 Update your contracts/.env file:`);
        console.log(`   POLYGON_AMOY_RPC_URL=${workingRPC}\n`);
      }
      
      // Update the network config dynamically
      const networkConfig = hre.config.networks[hre.network.name];
      if (networkConfig) {
        networkConfig.url = workingRPC;
        console.log(`✓ Updated network config to use: ${workingRPC}\n`);
      }
    }
  } catch (error) {
    console.error("\n❌ RPC Connection Error:", error.message);
    console.error("\nTroubleshooting:");
    console.error("1. Check your internet connection");
    console.error("2. Try using Alchemy or Infura (free signup, more reliable)");
    console.error("   See: https://www.alchemy.com/ or https://www.infura.io/");
    console.error("3. Check if you're behind a firewall/proxy");
    console.error("4. Update contracts/.env with a working RPC URL");
    process.exit(1);
  }

  try {
    // Use the working RPC if we found one
    if (workingRPC) {
      const networkConfig = hre.config.networks[hre.network.name];
      if (networkConfig && networkConfig.url !== workingRPC) {
        console.log(`Using tested RPC: ${workingRPC}`);
        networkConfig.url = workingRPC;
      }
    }
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/1d1c5cf2-4df9-4817-9e51-4488e33ebde7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'deploy.js:95',message:'Starting deployment attempt',data:{network:hre.network.name,workingRPC:workingRPC||'none'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    console.log("Getting contract factory...");
    const FileRegistry = await hre.ethers.getContractFactory("FileRegistry");
    
    // Get signer and check balance
    const signers = await hre.ethers.getSigners();
    const signer = signers[0];
    const signerAddress = await signer.getAddress();
    const balance = await hre.ethers.provider.getBalance(signerAddress);
    const balanceFormatted = hre.ethers.formatEther(balance);
    const isEthereum = networkName === "sepolia" || networkName === "mainnet";
    const currencySymbol = isEthereum ? "ETH" : "MATIC";
    
    console.log(`\nDeployer Address: ${signerAddress}`);
    console.log(`Balance: ${balanceFormatted} ${currencySymbol}`);
    
    if (balance === 0n) {
      console.error(`\n❌ ERROR: Wallet has zero ${currencySymbol} balance!`);
      console.error("\n💡 Solution:");
      if (networkName === "sepolia") {
        console.error("1. Go to: https://sepoliafaucet.com/ or https://faucet.quicknode.com/ethereum/sepolia");
        console.error(`2. Enter your wallet address: ${signerAddress}`);
        console.error("3. Request testnet ETH");
        console.error("4. Wait a few minutes for the transaction to confirm");
        console.error("5. Try deploying again\n");
      } else if (networkName === "mainnet") {
        console.error("⚠️  You need real ETH on mainnet!");
        console.error("   Transfer ETH to your wallet address\n");
      } else {
        console.error("1. Go to: https://faucet.polygon.technology/");
        console.error("2. Select 'Amoy' testnet (not Mumbai)");
        console.error(`3. Enter your wallet address: ${signerAddress}`);
        console.error("4. Request testnet MATIC");
        console.error("5. Wait a few minutes for the transaction to confirm");
        console.error("6. Try deploying again\n");
      }
      process.exit(1);
    }
    
    // Estimate gas
    const deploymentData = FileRegistry.bytecode;
    let gasEstimate;
    try {
      gasEstimate = await hre.ethers.provider.estimateGas({
        data: deploymentData,
        from: signerAddress,
      });
      const gasPrice = await hre.ethers.provider.getFeeData();
      const estimatedCost = gasEstimate * (gasPrice.gasPrice || 0n);
      const estimatedCostMatic = hre.ethers.formatEther(estimatedCost);
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/1d1c5cf2-4df9-4817-9e51-4488e33ebde7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'deploy.js:125',message:'Gas estimation',data:{gasEstimate:gasEstimate.toString(),gasPrice:gasPrice.gasPrice?.toString()||'null',estimatedCostWei:estimatedCost.toString(),estimatedCostMatic:estimatedCostMatic},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
      console.log(`Estimated Gas: ${gasEstimate.toString()}`);
      console.log(`Estimated Cost: ${estimatedCostMatic} ${currencySymbol}`);
      
      if (balance < estimatedCost) {
        console.error(`\n❌ ERROR: Insufficient balance!`);
        console.error(`   Balance: ${balanceFormatted} ${currencySymbol}`);
        console.error(`   Required: ${estimatedCostMatic} ${currencySymbol}`);
        console.error(`   Shortfall: ${hre.ethers.formatEther(estimatedCost - balance)} ${currencySymbol}`);
        if (networkName === "sepolia") {
          console.error("\n💡 Get more testnet ETH from: https://sepoliafaucet.com/");
        } else {
          console.error("\n💡 Get more testnet MATIC from: https://faucet.polygon.technology/");
        }
        process.exit(1);
      }
    } catch (gasError) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/1d1c5cf2-4df9-4817-9e51-4488e33ebde7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'deploy.js:140',message:'Gas estimation failed',data:{error:gasError.message,code:gasError.code},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      console.warn("⚠️  Could not estimate gas, proceeding anyway...");
    }
    
    console.log("\nDeploying contract (this may take a while)...");
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/1d1c5cf2-4df9-4817-9e51-4488e33ebde7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'deploy.js:148',message:'Attempting contract deployment',data:{signerAddress:signerAddress,balanceFormatted:balanceFormatted,currencySymbol:currencySymbol},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    
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
  } catch (error) {
    console.error("\n❌ Deployment Error:");
    if (error.code === "UND_ERR_CONNECT_TIMEOUT" || error.code === "ETIMEDOUT" || error.message.includes("timeout")) {
      console.error("Connection timeout. This usually means:");
      console.error("1. RPC endpoint is slow or unreachable");
      console.error("2. Network connectivity issues");
      console.error("3. Firewall/proxy blocking connections");
      console.error("\n💡 RECOMMENDED SOLUTION:");
      console.error("   Use Alchemy or Infura (free, more reliable):");
      console.error("   1. Sign up at https://www.alchemy.com/ (free)");
      console.error("   2. Create app for Polygon Amoy");
      console.error("   3. Copy API key");
      console.error("   4. Update contracts/.env:");
      console.error("      POLYGON_AMOY_RPC_URL=https://polygon-amoy.g.alchemy.com/v2/YOUR_KEY");
      console.error("\n   See SOLVE_TIMEOUT.md for detailed instructions");
      console.error("\nAlternative:");
      console.error("- Check your internet connection");
      console.error("- Try: npm run contracts:test-rpc (to test endpoints)");
      console.error("- Update contracts/.env with a working RPC URL");
    } else if (error.code === "ENETUNREACH") {
      console.error("Network unreachable. Check:");
      console.error("1. Internet connection");
      console.error("2. VPN/firewall settings");
      console.error("3. Try using Alchemy/Infura (see SOLVE_TIMEOUT.md)");
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

