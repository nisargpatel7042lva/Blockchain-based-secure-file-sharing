# Backend API

Express.js backend for blockchain file sharing system.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables (see `.env.example`)

3. Ensure contract ABI is available:
   - After compiling contracts, copy `FileRegistry.json` from `../artifacts/contracts/FileRegistry.sol/` to `./artifacts/contracts/FileRegistry.sol/`

## Running

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Routes

See main README.md for API documentation.

## Services

- **ipfsService**: Handles IPFS uploads and retrievals
- **blockchainService**: Interacts with smart contracts on Polygon
- **encryption**: AES-256 encryption utilities

