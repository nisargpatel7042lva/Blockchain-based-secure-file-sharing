import { createConfig, http } from "wagmi";
import { polygonMumbai } from "wagmi/chains";
import { injected, metaMask } from "wagmi/connectors";

export const config = createConfig({
  chains: [polygonMumbai],
  connectors: [injected(), metaMask()],
  transports: {
    [polygonMumbai.id]: http(import.meta.env.VITE_POLYGON_MUMBAI_RPC_URL || "https://rpc-mumbai.maticvigil.com"),
  },
});

