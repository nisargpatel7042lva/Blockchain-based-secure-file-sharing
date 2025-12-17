# Migration to Polygon Amoy Testnet

## Important: Mumbai Testnet is Deprecated

Polygon Mumbai testnet has been deprecated. The new testnet is **Polygon Amoy**.

## Quick Migration Guide

### 1. Update Environment Variables

**contracts/.env:**
```env
POLYGON_AMOY_RPC_URL=https://rpc.ankr.com/polygon_amoy
PRIVATE_KEY=your_private_key_here
```

**backend/.env:**
```env
POLYGON_AMOY_RPC_URL=https://rpc.ankr.com/polygon_amoy
FILE_REGISTRY_CONTRACT_ADDRESS=0x... # After deploying to Amoy
```

**frontend/.env:**
```env
VITE_POLYGON_AMOY_RPC_URL=https://rpc.ankr.com/polygon_amoy
VITE_FILE_REGISTRY_CONTRACT_ADDRESS=0x... # After deploying to Amoy
```

### 2. Update MetaMask Network

Add Polygon Amoy to MetaMask:
- **Network Name**: Polygon Amoy
- **RPC URL**: `https://rpc.ankr.com/polygon_amoy`
- **Chain ID**: `80002`
- **Currency Symbol**: `MATIC`
- **Block Explorer**: `https://amoy.polygonscan.com`

### 3. Deploy to Amoy

```bash
cd contracts
npm run deploy:amoy
```

Or use the root command:
```bash
npm run contracts:deploy:amoy
```

### 4. Get Testnet MATIC

Visit the Polygon Amoy faucet:
- https://faucet.polygon.technology/
- Select "Amoy" testnet
- Enter your wallet address

## Network Details

| Property | Mumbai (Deprecated) | Amoy (Current) |
|----------|---------------------|----------------|
| Chain ID | 80001 | 80002 |
| RPC URL | Various (deprecated) | https://rpc.ankr.com/polygon_amoy |
| Explorer | https://mumbai.polygonscan.com | https://amoy.polygonscan.com |
| Status | Deprecated | Active |

## Available Amoy RPC Endpoints

1. **Ankr** (Recommended)
   ```
   https://rpc.ankr.com/polygon_amoy
   ```

2. **Polygon Official**
   ```
   https://rpc-amoy.polygon.technology
   ```

3. **dRPC**
   ```
   https://polygon-amoy.drpc.org
   ```

4. **PublicNode**
   ```
   https://polygon-amoy-bor.publicnode.com
   ```

## Testing RPC Endpoints

Test which endpoints work from your location:
```bash
npm run contracts:test-rpc
```

## Backward Compatibility

The code still supports Mumbai for legacy deployments, but you'll see warnings. For new deployments, always use Amoy.

## Troubleshooting

### Error: "Network not found"
- Ensure MetaMask is connected to Amoy (Chain ID: 80002)
- Check that RPC URL is correct in your .env files

### Error: "Insufficient funds"
- Get testnet MATIC from the Amoy faucet
- Make sure you're requesting from the Amoy network, not Mumbai

### Error: "Contract not found"
- Redeploy contracts to Amoy
- Update contract addresses in backend/frontend .env files

