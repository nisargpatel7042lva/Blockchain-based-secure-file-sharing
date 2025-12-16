#!/usr/bin/env node

/**
 * Setup script to copy contract ABI to backend after compilation
 */

const fs = require("fs");
const path = require("path");

const contractsArtifactsPath = path.join(__dirname, "../artifacts/contracts/FileRegistry.sol/FileRegistry.json");
const backendArtifactsDir = path.join(__dirname, "../backend/artifacts/contracts/FileRegistry.sol");
const backendArtifactsPath = path.join(backendArtifactsDir, "FileRegistry.json");

try {
  // Check if source exists
  if (!fs.existsSync(contractsArtifactsPath)) {
    console.error("Error: Contract artifacts not found. Please compile contracts first:");
    console.error("  cd contracts && npm run compile");
    process.exit(1);
  }

  // Create backend artifacts directory if it doesn't exist
  if (!fs.existsSync(backendArtifactsDir)) {
    fs.mkdirSync(backendArtifactsDir, { recursive: true });
  }

  // Copy the ABI file
  fs.copyFileSync(contractsArtifactsPath, backendArtifactsPath);
  console.log("✓ Contract ABI copied to backend");
  console.log(`  From: ${contractsArtifactsPath}`);
  console.log(`  To: ${backendArtifactsPath}`);
} catch (error) {
  console.error("Error copying contract ABI:", error.message);
  process.exit(1);
}

