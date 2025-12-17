import { createConfig, http } from "wagmi";
import { defineChain } from "viem";
import { injected, metaMask } from "wagmi/connectors";

// Define Polygon Amoy chain (Chain ID: 80002)
// Note: If polygonAmoy becomes available in wagmi/chains, use that instead
const polygonAmoy = defineChain({
  id: 80002,
  name: "Polygon Amoy",
  nativeCurrency: {
    decimals: 18,
    name: "MATIC",
    symbol: "MATIC",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.ankr.com/polygon_amoy"],
    },
  },
  blockExplorers: {
    default: {
      name: "PolygonScan",
      url: "https://amoy.polygonscan.com",
    },
  },
  testnet: true,
});

export const config = createConfig({
  chains: [polygonAmoy],
  connectors: [injected(), metaMask()],
  transports: {
    [polygonAmoy.id]: http(import.meta.env.VITE_POLYGON_AMOY_RPC_URL || import.meta.env.VITE_POLYGON_MUMBAI_RPC_URL || "https://rpc.ankr.com/polygon_amoy"),
  },
});

