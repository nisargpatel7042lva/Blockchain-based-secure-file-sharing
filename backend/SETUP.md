# Backend Setup Notes

## Contract ABI Requirement

The backend requires the compiled contract ABI to interact with the smart contract.

### Steps to get the ABI:

1. **Compile the contracts**:
   ```bash
   cd ../contracts
   npm run compile
   ```

2. **Copy the ABI file**:
   After compilation, the ABI will be in:
   ```
   ../artifacts/contracts/FileRegistry.sol/FileRegistry.json
   ```

3. **Ensure the path is correct**:
   The `blockchainService.js` imports from:
   ```javascript
   import FileRegistryABI from "../../artifacts/contracts/FileRegistry.sol/FileRegistry.json"
   ```

   This path assumes the artifacts folder is at the project root level. If you're running from the backend directory, you may need to adjust the path or copy the file.

### Alternative: Manual ABI Setup

If you prefer, you can:
1. Extract just the ABI from the compiled JSON
2. Create a separate ABI file in the backend
3. Update the import path in `blockchainService.js`

The ABI is the `abi` property from the compiled contract JSON file.

