# Analysis of CI Failures After Merging 4.0.3-alpha.12-branch

## Key Changes from the Merge
The merge introduced significant new functionality:
1. **Legacy ETH Registrar Controller support** - Added a complete implementation for legacy name registration
2. **New contract addresses** - Added `LegacyETHRegistrarController` and `LegacyPublicResolver` 
3. **New test utilities** - Added legacy name generators and helpers
4. **New wallet functions** - Added `legacyCommitName` and `legacyRegisterName`

## Identified Issues

### 1. Nonce Management Problems
- Recent commits show attempts to fix nonce management in concurrent transactions
- The deploy script runs multiple transactions in parallel which can cause nonce conflicts
- Both legacy and wrapped name generators share the same nonce manager

### 2. Gas Estimation Failures
- The error logs indicate "EthEstimateGas" failures
- This typically happens when transactions revert during gas estimation
- Could be caused by incorrect contract state or timing issues

### 3. Test Environment Issues
- The tests are failing with AbortSignal errors (though you said to skip this)
- The deploy script manipulates time and mining which could cause race conditions

## Recommended Fixes

### 1. Fix Nonce Management
- Ensure nonce allocation happens atomically before any async operations
- Consider using separate nonce managers for legacy vs wrapped transactions
- Add proper error handling for failed transactions to prevent nonce gaps

### 2. Debug Gas Estimation
- Add detailed logging to identify which specific transactions are failing
- Check if legacy controller has proper permissions/setup
- Verify contract deployment order and dependencies

### 3. Stabilize Test Environment
- Ensure proper transaction ordering in concurrent scenarios
- Add delays between commit and register phases if needed
- Verify all required contracts are deployed before tests run

### 4. Contract Integration
- Verify legacy controller is properly initialized
- Check if there are any missing configurations or permissions
- Ensure compatibility between legacy and new contract interfaces