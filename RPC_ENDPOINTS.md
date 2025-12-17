# Polygon Testnet RPC Endpoints

## ⚠️ IMPORTANT: Mumbai is Deprecated

Polygon Mumbai testnet has been deprecated. Use **Polygon Amoy** testnet instead.

See `MIGRATION_TO_AMOY.md` for migration instructions.

## Polygon Amoy Testnet (Current)

### Public Endpoints (No API Key Required)

1. **Ankr** (Recommended - Current Default)
   ```
   https://rpc.ankr.com/polygon_amoy
   ```
   - Most reliable public endpoint
   - Good latency
   - No authentication required

2. **Polygon Official**
   ```
   https://rpc-amoy.polygon.technology
   ```
   - Official Polygon endpoint
   - Good performance

3. **dRPC**
   ```
   https://polygon-amoy.drpc.org
   ```
   - Reliable alternative
   - Free tier available

4. **PublicNode**
   ```
   https://polygon-amoy-bor.publicnode.com
   ```
   - Public RPC service
   - Free tier available

## Polygon Mumbai Testnet (Deprecated - Do Not Use)

⚠️ Mumbai testnet is deprecated. These endpoints may not work:

## Endpoints Requiring API Keys

These require free signup but offer better reliability:

### Alchemy
1. Sign up at https://www.alchemy.com/
2. Create a new app on Polygon Mumbai
3. Get your API key
4. Use: `https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY`

### Infura
1. Sign up at https://www.infura.io/
2. Create a new project
3. Get your project ID
4. Use: `https://polygon-mumbai.infura.io/v3/YOUR_PROJECT_ID`

### QuickNode
1. Sign up at https://www.quicknode.com/
2. Create an endpoint for Polygon Mumbai
3. Use your provided endpoint URL

## Configuration

Update your `.env` files with your chosen RPC URL:

**contracts/.env:**
```env
POLYGON_AMOY_RPC_URL=https://rpc.ankr.com/polygon_amoy
```

**backend/.env:**
```env
POLYGON_AMOY_RPC_URL=https://rpc.ankr.com/polygon_amoy
```

**frontend/.env:**
```env
VITE_POLYGON_AMOY_RPC_URL=https://rpc.ankr.com/polygon_amoy
```

**Note**: The code supports both `POLYGON_AMOY_RPC_URL` (preferred) and `POLYGON_MUMBAI_RPC_URL` (legacy) for backward compatibility.

## Troubleshooting

### Error: "API key is not allowed to access blockchain"
- You're using an endpoint that requires authentication
- Switch to a public endpoint or add your API key to the URL

### Error: "getaddrinfo ENOTFOUND"
- The RPC endpoint is down or unreachable
- Try a different endpoint from the list above

### Slow Response Times
- Public endpoints can be slower during peak times
- Consider using Alchemy or Infura for better performance

