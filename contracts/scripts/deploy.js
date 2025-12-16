const hre = require("hardhat");

async function main() {
  console.log("Deploying FileRegistry contract...");

  const FileRegistry = await hre.ethers.getContractFactory("FileRegistry");
  const fileRegistry = await FileRegistry.deploy();

  await fileRegistry.waitForDeployment();

  const address = await fileRegistry.getAddress();
  console.log("FileRegistry deployed to:", address);

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

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

