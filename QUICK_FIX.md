# Quick Fix: Switch to Polygon Amoy Testnet

## The Problem

Polygon Mumbai testnet is **deprecated**. All Mumbai RPC endpoints are failing.

## The Solution

Switch to **Polygon Amoy** testnet (the replacement).

## Quick Steps

### 1. Update Environment Variables

**contracts/.env:**
```env
POLYGON_AMOY_RPC_URL=https://rpc.ankr.com/polygon_amoy
PRIVATE_KEY=your_private_key_here
```

**backend/.env:**
```env
POLYGON_AMOY_RPC_URL=https://rpc.ankr.com/polygon_amoy
FILE_REGISTRY_CONTRACT_ADDRESS=
```

**frontend/.env:**
```env
VITE_POLYGON_AMOY_RPC_URL=https://rpc.ankr.com/polygon_amoy
VITE_FILE_REGISTRY_CONTRACT_ADDRESS=
```

### 2. Test RPC Endpoints

```bash
npm run contracts:test-rpc
```

This will test Amoy endpoints and show which ones work.

### 3. Deploy to Amoy

```bash
cd contracts
npm run deploy:amoy
```

Or from root:
```bash
npm run contracts:deploy:amoy
```

### 4. Update MetaMask

Add Polygon Amoy network to MetaMask:
- **Network Name**: Polygon Amoy
- **RPC URL**: `https://rpc.ankr.com/polygon_amoy`
- **Chain ID**: `80002`
- **Currency Symbol**: `MATIC`
- **Block Explorer**: `https://amoy.polygonscan.com`

### 5. Get Testnet MATIC

Visit: https://faucet.polygon.technology/
- Select **Amoy** testnet (not Mumbai)
- Enter your wallet address
- Request testnet MATIC

## What Changed

- ✅ Added Amoy network support (Chain ID: 80002)
- ✅ Updated default RPC to Amoy endpoints
- ✅ Added `deploy:amoy` script
- ✅ Updated frontend to use Amoy chain
- ✅ Backward compatible with Mumbai (shows warnings)

## Network Comparison

| Property | Mumbai (Deprecated) | Amoy (Current) |
|----------|---------------------|----------------|
| Chain ID | 80001 | 80002 |
| Status | Deprecated ❌ | Active ✅ |
| RPC | Not working | Working ✅ |

## Need Help?

See `MIGRATION_TO_AMOY.md` for detailed migration guide.

