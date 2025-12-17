#!/usr/bin/env node

/**
 * Generate a test private key for development
 * WARNING: This is for testing only. Never use in production!
 */

const crypto = require("crypto");

// Generate a random 32-byte private key
const privateKey = crypto.randomBytes(32).toString("hex");

console.log("\n🔑 Generated Test Private Key (for development only!):");
console.log("=" .repeat(64));
console.log(privateKey);
console.log("=" .repeat(64));
console.log("\n⚠️  WARNING: This is a test key. Do NOT use in production!");
console.log("\nAdd this to your .env files:");
console.log(`PRIVATE_KEY=${privateKey}`);
console.log("\nOr with 0x prefix:");
console.log(`PRIVATE_KEY=0x${privateKey}`);
console.log("\n");

