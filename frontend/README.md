# Frontend Application

React application for blockchain file sharing.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables (see `.env.example`)

## Running

Development mode:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Features

- Wallet connection (MetaMask)
- File upload with client-side encryption
- File sharing with access control
- Audit trail visualization
- Time-limited access management

## Components

- **WalletConnect**: Wallet connection component
- **FileUpload**: File upload with encryption
- **FileList**: Display user's files
- **FileShare**: Share files with recipients
- **AuditTrail**: View access history

