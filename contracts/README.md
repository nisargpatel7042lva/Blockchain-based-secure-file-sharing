# Smart Contracts

This directory contains the smart contracts for the blockchain file sharing system.

## Contract: FileRegistry

The main contract that handles:
- File metadata storage
- Access control (grant/revoke)
- Time-limited access
- Audit trail events

## Deployment

### Local Network (Hardhat)

```bash
npm run deploy:local
```

### Polygon Mumbai Testnet

1. Set up your `.env` file with:
   ```
   POLYGON_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
   PRIVATE_KEY=your_private_key_here
   ```

2. Deploy:
   ```bash
   npm run deploy:mumbai
   ```

3. Copy the contract address from `deployment.json` to your backend and frontend `.env` files.

## Contract Functions

### uploadFile(ipfsHash, encryptedKeyHash)
Registers a new file on the blockchain.

### grantAccess(fileId, recipient, expiration)
Grants access to a file. Expiration is a Unix timestamp (0 for no expiration).

### revokeAccess(fileId, recipient)
Revokes access to a file.

### checkAccess(fileId, user)
Checks if a user has access to a file (returns bool).

### getFile(fileId)
Retrieves file metadata.

## Events

- `FileUploaded` - Emitted when a file is uploaded
- `AccessGranted` - Emitted when access is granted
- `AccessRevoked` - Emitted when access is revoked
- `AccessAttempt` - Emitted when access is attempted
- `FileShared` - Emitted when a file is shared
- `AccessExpired` - Emitted when access expires

