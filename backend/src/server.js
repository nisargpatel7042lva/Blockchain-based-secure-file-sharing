// CRITICAL: Load .env FIRST before any other imports that use environment variables
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync } from "fs";

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from root directory (two levels up from backend/src/)
const rootEnvPath = join(__dirname, "../../.env");
dotenv.config({ path: rootEnvPath });

// Debug: Log if .env file was loaded
console.log("🔍 DEBUG - Loading .env from root:", rootEnvPath);
console.log("🔍 DEBUG - .env file exists:", existsSync(rootEnvPath));
if (!existsSync(rootEnvPath)) {
  console.error("❌ ERROR: .env file not found at:", rootEnvPath);
  console.error("   Please create .env file in the root directory (C:\\dev\\Tgen\\.env)");
} else {
  console.log("✅ .env file loaded successfully");
  console.log("🔍 DEBUG - IPFS_API_URL:", process.env.IPFS_API_URL || "(not set)");
  console.log("🔍 DEBUG - PINATA_API_KEY:", process.env.PINATA_API_KEY ? "SET" : "NOT SET");
}

// NOW import other modules (they will have access to environment variables)
import express from "express";
import cors from "cors";
import fileRoutes from "./routes/files.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/files", fileRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

