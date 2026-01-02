# Blockchain-Based Secure File Sharing

A decentralized file sharing platform with end-to-end encryption, access control, audit trails, and time-limited access built on Polygon blockchain and IPFS.

## Features

- **End-to-End Encryption**: Files are encrypted client-side before upload using AES-256
- **Blockchain-Based Access Control**: Smart contracts manage file permissions on Polygon
- **Immutable Audit Trail**: All access attempts are logged on the blockchain
- **Time-Limited Access**: Set expiration dates for shared files
- **Decentralized Storage**: Files stored on IPFS (InterPlanetary File System)
- **Revocable Access**: File owners can revoke access at any time

## Architecture

```
┌─────────────┐
│ React App   │ (Frontend - Client-side encryption)
└──────┬──────┘
       │
       ├── Wallet (MetaMask)
       │
┌──────▼──────┐
│ Node.js API │ (Backend - IPFS & Blockchain interaction)
└──────┬──────┘
       │
   ┌───┴───┐
   │       │
┌──▼──┐ ┌─▼────────┐
│IPFS │ │Polygon   │
│     │ │Smart     │
│     │ │Contracts │
└─────┘ └──────────┘
```

## Tech Stack

- **Blockchain**: Polygon Mumbai (testnet)
- **Smart Contracts**: Solidity, Hardhat
- **Storage**: IPFS (via ipfs-http-client)
- **Backend**: Node.js, Express.js, ethers.js
- **Frontend**: React, Vite, wagmi, ethers.js
- **Encryption**: AES-256 (crypto-js)

## Prerequisites

- Node.js 18+ and npm
- MetaMask browser extension
- IPFS node (local or use Infura/Pinata)
- Polygon Mumbai testnet MATIC (for gas fees)

## Setup Instructions

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm run install:all
```

### 2. Configure IPFS (Recommended: Use Infura - No Installation Needed)

**Option A: Infura IPFS (Recommended)**
1. Sign up at [Infura](https://infura.io) (free)
2. Create a new project → Select "IPFS"
3. Copy Project ID and Project Secret
4. Update `backend/.env`:
   ```env
   IPFS_API_URL=https://ipfs.infura.io:5001
   IPFS_PROJECT_ID=your_project_id
   IPFS_PROJECT_SECRET=your_project_secret
   ```

**Option B: Pinata**
- Sign up at [Pinata](https://pinata.cloud)
- Get your API credentials
- Update `backend/.env` with Pinata credentials

**Option C: Local IPFS Node (Advanced)**
- Install IPFS Desktop: https://docs.ipfs.tech/install/ipfs-desktop/
- Or install CLI and run `ipfs daemon`
- Update `backend/.env`: `IPFS_API_URL=http://localhost:5001`

See `IPFS_SETUP.md` for detailed instructions.

### 3. Deploy Smart Contracts

1. Navigate to contracts directory:
```bash
cd contracts
```

2. Create `.env` file:
```env
POLYGON_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=your_private_key_here
```

3. Compile contracts:
```bash
npm run compile
```

4. Setup contract ABI for backend:
```bash
npm run setup:contracts
```

5. Deploy to Polygon Mumbai:
```bash
npm run deploy:mumbai
```

6. Copy the contract address from `deployment.json` to your backend and frontend `.env` files.

### 4. Configure Backend

1. Navigate to backend directory:
```bash
cd backend
```

2. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```env
PORT=3001
NODE_ENV=development

# IPFS Configuration
IPFS_API_URL=http://localhost:5001
# Or for Infura:
# IPFS_API_URL=https://ipfs.infura.io:5001
# IPFS_PROJECT_ID=your_project_id
# IPFS_PROJECT_SECRET=your_project_secret

# Blockchain Configuration
POLYGON_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=your_private_key_here
FILE_REGISTRY_CONTRACT_ADDRESS=0x... # From deployment.json

# CORS
FRONTEND_URL=http://localhost:3000
```

4. Copy contract ABI to backend:
```bash
# After compiling contracts, copy the ABI
cp ../artifacts/contracts/FileRegistry.sol/FileRegistry.json ./artifacts/contracts/FileRegistry.sol/
```

### 5. Configure Frontend

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

3. Update `.env`:
```env
VITE_API_URL=http://localhost:3001
VITE_POLYGON_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
VITE_FILE_REGISTRY_CONTRACT_ADDRESS=0x... # From deployment.json
```

## Running the Application

### Start Backend

```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:3001`

### Start Frontend

```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:3000`

### Start IPFS (if using local node)

```bash
ipfs daemon
```

## Usage

1. **Connect Wallet**: Open the app and connect your MetaMask wallet (ensure it's connected to Polygon Mumbai testnet)

2. **Upload File**: 
   - Drag and drop or select a file
   - File is encrypted client-side before upload
   - Save your encryption key (displayed after upload)

3. **Share File**:
   - Select a file from your list
   - Enter recipient's wallet address
   - Set expiration (in days, 0 for no expiration)
   - Grant access

4. **View Audit Trail**:
   - Select a file to view its access history
   - See all access attempts with timestamps

5. **Revoke Access**:
   - Use the revoke access function in the API or smart contract

## API Endpoints

### POST `/api/files/upload`
Upload a file (encrypted, stored on IPFS, registered on blockchain)

**Body**: `multipart/form-data`
- `file`: File to upload
- `ownerAddress`: Wallet address of owner

**Response**:
```json
{
  "success": true,
  "fileId": "1",
  "ipfsHash": "Qm...",
  "txHash": "0x...",
  "encryptionKey": "..."
}
```

### GET `/api/files/:fileId`
Get file metadata

### POST `/api/files/:fileId/grant-access`
Grant access to a file

**Body**:
```json
{
  "recipient": "0x...",
  "expiration": 7
}
```

### POST `/api/files/:fileId/revoke-access`
Revoke access to a file

**Body**:
```json
{
  "recipient": "0x..."
}
```

### GET `/api/files/:fileId/check-access/:userAddress`
Check if a user has access

### GET `/api/files/:fileId/download`
Download a file (if authorized)

**Query Params**:
- `userAddress`: User's wallet address
- `encryptionKey`: Encryption key for the file

### GET `/api/files/:fileId/audit`
Get audit trail for a file

### GET `/api/files/owner/:ownerAddress`
Get all files owned by an address

## Smart Contract Functions

### `uploadFile(ipfsHash, encryptedKeyHash)`
Register a new file on the blockchain

### `grantAccess(fileId, recipient, expiration)`
Grant access to a file. Expiration is Unix timestamp (0 for no expiration)

### `revokeAccess(fileId, recipient)`
Revoke access to a file

### `checkAccess(fileId, user)`
Check if a user has access (returns bool)

### `getFile(fileId)`
Retrieve file metadata

### `logAccess(fileId, user, success)`
Log an access attempt

## Security Considerations

1. **Encryption Keys**: Always save encryption keys securely. Without the key, files cannot be decrypted.

2. **Private Keys**: Never share your private keys. Keep them secure.

3. **Access Control**: The smart contract enforces access control. Only file owners can grant/revoke access.

4. **Time-Limited Access**: Access automatically expires based on the timestamp set in the smart contract.

5. **IPFS Pinning**: Ensure files are pinned to IPFS to prevent garbage collection.

## Development

### Compile Contracts
```bash
cd contracts
npm run compile
```

### Test Contracts
```bash
cd contracts
npm test
```

### Deploy to Local Network
```bash
cd contracts
npm run deploy:local
```

## Troubleshooting

### IPFS Connection Issues
- Ensure IPFS daemon is running (if using local node)
- Check IPFS_API_URL in backend `.env`
- Verify Infura/Pinata credentials if using their service

### Blockchain Transaction Failures
- Ensure you have MATIC on Polygon Mumbai testnet
- Check RPC URL is correct
- Verify contract address is set correctly

### Wallet Connection Issues
- Ensure MetaMask is installed
- Connect to Polygon Mumbai testnet
- Check network ID: 80001

## Getting Testnet MATIC

1. Visit [Polygon Faucet](https://faucet.polygon.technology/)
2. Select Mumbai testnet
3. Enter your wallet address
4. Request testnet MATIC

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
