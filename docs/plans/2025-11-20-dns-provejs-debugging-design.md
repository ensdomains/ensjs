# DNS ProveJS Debugging Design

**Date**: 2025-11-20
**Branch**: feature/fet-2615-ensjs-dns-provejs-fix
**Purpose**: Add comprehensive logging to diagnose issues in DNS import functionality

## Overview

Add detailed logging to both ensjs's `getDnsImportData.ts` and dnsprovejs's internal operations to trace execution flow and inspect data values throughout the DNS import process.

## Architecture

### Two-Part Logging Approach

1. **ensjs logging** - Add console logs directly in `getDnsImportData.ts` to track the high-level flow
2. **dnsprovejs patching** - Use `pnpm patch` to add logging inside the dnsprovejs library itself

### Checkpoints Strategy

The implementation will be broken into clear checkpoints where logging output can be tested and verified before moving to the next phase.

## Logging Points

### In getDnsImportData.ts

Location: `packages/ensjs/src/functions/dns/getDnsImportData.ts`

1. **Entry point** - Log the input parameters (name, endpoint)
2. **DNS query initiation** - Before calling `prover.queryWithProof()`
3. **DNS query result** - The raw result object structure and key fields
4. **Proofs assembly** - The combined proofs array (count, types)
5. **Encoded rrsets** - The hex-encoded proof data before sending on-chain
6. **On-chain verification inputs/outputs** - What we send to `verifyRRSet` and what comes back
7. **Serial number comparison** - Both inception values being compared
8. **Final validation** - The proof wire format vs onchain data comparison
9. **Return value** - What rrsets are being returned

**Logging format**: Use structured console.log with prefixes like `[getDnsImportData]` for easy filtering, and log objects with `JSON.stringify` where helpful for readability.

### In dnsprovejs (via pnpm patch)

Location: `node_modules/@ensdomains/dnsprovejs/dist/prove.js`

1. **DNSProver.create()** - When the prover is initialized with an endpoint
2. **queryWithProof() entry** - The query type and name being requested
3. **DNS resolution steps** - Each DNS query made (showing query name, type)
4. **Response validation** - DNSSEC validation results for each response
5. **Proof chain building** - As proofs are collected and chained together
6. **SignedSet creation** - When signed sets are created with their signatures
7. **Error conditions** - Any validation failures or unexpected responses

**Key functions to instrument**: `DNSProver.create()`, `queryWithProof()`, `query()`, `verifyProof()`, and the `SignedSet` constructor/methods.

## Implementation Plan

### Checkpoint 1: Setup & ensjs Logging
- Add comprehensive console.log statements to getDnsImportData.ts
- Build the project to verify no syntax errors
- Test with a sample DNS name to see the logging output

### Checkpoint 2: Create dnsprovejs Patch
- Run `pnpm patch @ensdomains/dnsprovejs` to create editable copy
- Add logging to the key functions in dist/prove.js
- Commit the patch with `pnpm patch-commit`

### Checkpoint 3: Integration Test
- Run a full test with both logging layers active
- Verify logs show complete execution trace and data flow
- Identify any gaps in logging coverage

### Checkpoint 4: Refinement (Optional)
- Based on discoveries, add/adjust logging as needed
- Re-patch dnsprovejs if necessary
- Document findings

## Patching Workflow

Using pnpm's built-in patch system:

```bash
# Create editable copy
pnpm patch @ensdomains/dnsprovejs

# Edit files in the temporary directory shown
# Add console.log statements to dist/prove.js

# Commit the patch
pnpm patch-commit <temp-directory-path>
```

This creates a patch file in `patches/@ensdomains__dnsprovejs@0.5.2.patch` that will auto-apply on future `pnpm install`.

## Rollback Plan

- Keep all changes in git for easy reversion
- Remove getDnsImportData.ts logging by reverting the file
- Remove the patch by deleting the patch file and running `pnpm install`

## Current Environment

- **dnsprovejs version**: 0.5.2
- **Package manager**: pnpm
- **Existing patches**: hardhat-deploy.patch (unrelated)
