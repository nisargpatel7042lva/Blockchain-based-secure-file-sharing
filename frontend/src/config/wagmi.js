import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected, metaMask } from "wagmi/connectors";

export const config = createConfig({
  chains: [sepolia],
  connectors: [injected(), metaMask()],
  transports: {
    [sepolia.id]: http(
      import.meta.env.VITE_ALCHEMY_SEPOLIA_URL || 
      import.meta.env.VITE_ETHEREUM_SEPOLIA_RPC_URL || 
      "https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY"
    ),
  },
});

