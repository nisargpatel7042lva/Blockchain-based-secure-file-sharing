# Quick Start Guide

## Fixing Common Setup Errors

### Error 1: PRIVATE_KEY not set or invalid

**Error**: `Error: PRIVATE_KEY not set in environment variables` or `private key too short, expected 32 bytes`

**Solution**: 

1. **Generate a test private key** (for development only):
   ```bash
   npm run generate:test-key
   ```
   This will generate a random private key you can use for testing.

2. **Or use an existing wallet's private key**:
   - Export from MetaMask (Settings → Security & Privacy → Show Private Key)
   - **WARNING**: Never use your main wallet's private key! Create a test account.

3. **Add to your `.env` files**:
   
   In `contracts/.env`:
   ```env
   PRIVATE_KEY=your_64_character_hex_string_here
   ```
   
   In `backend/.env`:
   ```env
   PRIVATE_KEY=your_64_character_hex_string_here
   ```

**Note**: 
- Private key must be 64 hex characters (32 bytes)
- Can optionally include `0x` prefix
- The config now validates the key format automatically

### Error 2: RPC URL Issues

**Error**: `getaddrinfo ENOTFOUND` or `API key is not allowed to access blockchain`

**Solution**: 

1. **Current Default** (Public, no API key needed):
   - `https://matic-mumbai.chainstacklabs.com` ✅

2. **Alternative Public Endpoints**:
   - `https://rpc-mumbai.matic.today`
   - `https://polygon-mumbai-bor.publicnode.com`

3. **For Better Performance** (requires free signup):
   - **Alchemy**: `https://polygon-mumbai.g.alchemy.com/v2/YOUR-API-KEY`
   - **Infura**: `https://polygon-mumbai.infura.io/v3/YOUR-PROJECT-ID`

Update in:
- `contracts/.env` → `POLYGON_MUMBAI_RPC_URL`
- `backend/.env` → `POLYGON_MUMBAI_RPC_URL`
- `frontend/.env` → `VITE_POLYGON_MUMBAI_RPC_URL`

See `RPC_ENDPOINTS.md` for a complete list of options.

## Complete Setup Steps

1. **Install dependencies**:
   ```bash
   npm run install:all
   ```

2. **Set up backend environment**:
   ```bash
   cd backend
   # Create .env file manually or copy from example
   ```
   
   Create `backend/.env`:
   ```env
   PORT=3001
   NODE_ENV=development
   IPFS_API_URL=http://localhost:5001
   POLYGON_MUMBAI_RPC_URL=https://matic-mumbai.chainstacklabs.com
   PRIVATE_KEY=your_test_private_key_here
   FILE_REGISTRY_CONTRACT_ADDRESS=
   FRONTEND_URL=http://localhost:3000
   ```

3. **Generate and set up private key**:
   ```bash
   # Generate a test key
   npm run generate:test-key
   ```
   
   Create `contracts/.env`:
   ```env
   POLYGON_MUMBAI_RPC_URL=https://matic-mumbai.chainstacklabs.com
   PRIVATE_KEY=0x... # Use the generated key (64 hex characters)
   ```
   
   **Important**: The private key must be exactly 64 hex characters (32 bytes). It can optionally start with `0x`.

4. **Test RPC connection** (optional but recommended):
   ```bash
   npm run contracts:test-rpc
   ```
   This will test all available RPC endpoints and show which ones are working.

5. **Compile and deploy contracts**:
   ```bash
   cd contracts
   npm run compile
   npm run setup:contracts  # Copy ABI to backend
   npm run deploy:mumbai
   ```
   
   **Note**: The deployment script will automatically try multiple RPC endpoints if one fails.

5. **Update contract address**:
   After deployment, copy the contract address from `deployment.json` to:
   - `backend/.env` → `FILE_REGISTRY_CONTRACT_ADDRESS`
   - `frontend/.env` → `VITE_FILE_REGISTRY_CONTRACT_ADDRESS`

6. **Start IPFS** (if using local node):
   ```bash
   ipfs daemon
   ```

7. **Start backend**:
   ```bash
   cd backend
   npm run dev
   ```

8. **Start frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

## Getting Testnet MATIC

1. Visit [Polygon Faucet](https://faucet.polygon.technology/)
2. Select Mumbai testnet
3. Enter your wallet address
4. Request testnet MATIC

## Testing Without Blockchain (Development)

The backend will now start even without `PRIVATE_KEY` set, but blockchain features will be disabled. You'll see warnings in the console. This allows you to test IPFS and other features independently.

