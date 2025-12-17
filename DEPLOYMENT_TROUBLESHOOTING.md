# Deployment Troubleshooting Guide

## Connection Timeout Errors

### Error: `ConnectTimeoutError` or `UND_ERR_CONNECT_TIMEOUT`

**Causes:**
- RPC endpoint is slow or unreachable
- Network connectivity issues
- Firewall/proxy blocking connections
- RPC endpoint is temporarily down

**Solutions:**

1. **Test RPC Endpoints First**:
   ```bash
   npm run contracts:test-rpc
   ```
   This will test all available endpoints and show which ones work.

2. **Use a Different RPC Endpoint**:
   Update `contracts/.env`:
   ```env
   POLYGON_MUMBAI_RPC_URL=https://rpc-mumbai.matic.today
   ```
   
   See `RPC_ENDPOINTS.md` for a complete list.

3. **Check Network Connection**:
   - Ensure you have internet access
   - Try accessing the RPC URL in a browser
   - Check if you're behind a corporate firewall

4. **Use Premium RPC Services** (Free signup):
   - **Alchemy**: https://www.alchemy.com/
   - **Infura**: https://www.infura.io/
   - These offer better reliability and performance

## Automatic Fallback

The deployment script now automatically tries multiple RPC endpoints if one fails. It will:
1. Test your custom RPC (if set in .env)
2. Try fallback public endpoints
3. Show which endpoint is being used
4. Provide clear error messages if all fail

## Manual RPC Testing

Test a specific RPC endpoint:
```bash
cd contracts
node scripts/test-rpc.js
```

## Common Issues

### Issue: "All RPC endpoints failed"
- Check internet connection
- Try disabling VPN/proxy
- Wait a few minutes and retry (RPC might be temporarily down)

### Issue: "Transaction timeout"
- RPC endpoint is slow
- Network congestion
- Try a premium RPC service (Alchemy/Infura)

### Issue: "Insufficient funds"
- Ensure you have MATIC on Mumbai testnet
- Get testnet MATIC from: https://faucet.polygon.technology/

## Best Practices

1. **Always test RPC before deploying**:
   ```bash
   npm run contracts:test-rpc
   ```

2. **Use environment variables**:
   - Don't hardcode RPC URLs
   - Use `.env` files for configuration

3. **Have fallback options**:
   - Keep multiple RPC endpoints ready
   - Consider using premium services for production

4. **Monitor deployment**:
   - Watch for timeout errors
   - Check transaction status on Polygonscan

## Getting Help

If issues persist:
1. Check `RPC_ENDPOINTS.md` for endpoint options
2. Test connectivity: `npm run contracts:test-rpc`
3. Try a premium RPC service (Alchemy/Infura)
4. Check Polygonscan for network status

