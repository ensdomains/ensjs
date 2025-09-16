# Contract Mismatch Issue

## Problem
The tests for `registerName` and `renewNames` are failing with transaction reverts because of a contract version mismatch:

1. **Code expects new contracts**: The PR code uses the new ENS contract ABIs that include a `referrer` parameter in the registration tuple
2. **Test environment deploys legacy contracts**: The `ens-test-env` deploys legacy ENS contracts that don't support the referrer parameter

## Failing Tests
- `src/functions/wallet/registerName.test.ts` - Transaction reverts when trying to register with new ABI format
- `src/functions/wallet/renewNames.test.ts` - Transaction reverts when trying to renew with referrer parameter

## Root Cause
The new registration format expects a tuple with these fields:
```solidity
struct Registration {
    string label;
    address owner;
    uint256 duration;
    bytes32 secret;
    address resolver;
    bytes[] data;
    uint16 reverseRecord;
    bytes32 referrer;  // NEW FIELD
}
```

But the deployed test contracts only support the old format without `referrer`.

## Solution Required
Update `ens-test-env` to deploy the new ENS contracts that support the referrer parameter. This requires:

1. Updating the contract deployments in the test environment
2. Ensuring the new contracts are available and compiled
3. Updating any deployment scripts to use the new contract versions

## Temporary Workaround (Not Recommended)
Adding backward compatibility to detect contract versions and use appropriate ABIs was explicitly rejected by the maintainers. The proper solution is to update the test environment.