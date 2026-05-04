# Contributing to ENSjs

Thanks for taking the time to contribute. This guide covers how the codebase is laid out
and the conventions you should follow when adding new actions, ABI snippets, or contract
addresses.

## Repo basics

- Monorepo managed with **pnpm** workspaces (`pnpm-workspace.yaml`).
- **Biome** for formatting and linting (`pnpm lint`).
- **Vitest** for tests, run against a local Anvil node with deployed ENS contracts
  (`pnpm -F @ensdomains/ensjs denv` to start the test environment).
- **Changesets** for versioning — every user-visible change to a published package needs a
  changeset (`pnpm chgset:run`).

```sh
pnpm install
pnpm -r build
pnpm lint
pnpm -F @ensdomains/ensjs test
```

## Packages

- `packages/ensjs` — the main library
- `packages/ensjs-abi` — ABI snippets, no runtime logic
- `packages/react` — React hooks
- `packages/query-core` — `@wagmi/core` integration

ABI snippets always live in `@ensdomains/ensjs-abi`. The main `ensjs` package re-exports
them from `src/contracts/index.ts` and consumes them inside actions.

---

## Adding a new ABI snippet

ABIs live in `packages/ensjs-abi/src`, split by version:

```
packages/ensjs-abi/src/
├── registry.ts                # version-neutral
├── universalResolver.ts
├── ...
├── v1/
│   ├── ethRegistrarController.ts
│   ├── nameWrapper.ts
│   └── ...
└── v2/
    ├── permissionedRegistry.ts
    ├── permissionedResolver.ts
    └── ...
```

### Steps

1. **Pick the right file.** Group snippets by contract (e.g. all PermissionedRegistry
   functions go into `v2/permissionedRegistry.ts`). Create a new file only when adding a
   new contract; in that case mirror the existing layout.

2. **Export each function as its own snippet.** One named export per function or error
   group, typed `as const` so viem can infer it. Naming convention:

   - Function: `{contract}{FunctionName}Snippet`, e.g.
     `permissionedRegistryGetStateSnippet`, `ethRegistrarControllerRegisterSnippet`.
   - Errors group: `{contract}Errors`, e.g. `nameWrapperErrors`.

   Keep snippets minimal — only the function fragments an action actually needs. Don't
   paste full ABIs.

   ```ts
   export const permissionedRegistryGetStateSnippet = [
     {
       type: 'function',
       name: 'getState',
       inputs: [{ name: 'anyId', type: 'uint256' }],
       outputs: [
         /* ... */
       ],
       stateMutability: 'view',
     },
   ] as const
   ```

3. **Wire up the subpath export** in `packages/ensjs-abi/package.json` if you created a new
   file. Each contract has its own export path (e.g. `./v2/permissionedRegistry`). If you
   added a brand-new file you must also add it here so consumers can import it directly.

4. **Re-export from the umbrella index.** Add a line to
   `packages/ensjs-abi/src/v1/index.ts` or `v2/index.ts` (or the top-level `index.ts` for
   version-neutral contracts) so the snippet is reachable via `@ensdomains/ensjs-abi`.

5. **Re-export from `ensjs/contracts`.** In
   `packages/ensjs/src/contracts/index.ts` add the snippet to the appropriate
   `export { … } from '@ensdomains/ensjs-abi/...'` block, keeping the alphabetical order
   already used. This is what action files import from.

6. **Build the ABI package** before consuming the snippet from `ensjs`:
   `pnpm -F @ensdomains/ensjs-abi build`. (CI runs the full `pnpm -r build`.)

---

## Adding a new action

Actions live in `packages/ensjs/src/actions/`:

```
src/actions/
├── public/             # version-neutral / cross-cutting reads
│   ├── v1/             # legacy Registry / NameWrapper reads
│   └── v2/             # PermissionedRegistry / PermissionedResolver reads
├── wallet/             # writes
│   └── v2/             # v2 writes
├── dns/
└── subgraph/
```

### Where does it go?

- **Write** = `wallet/`, **read** = `public/`.
- v1-only contract? `…/v1/`. v2-only? `…/v2/`. Works against the universal resolver or
  shared infrastructure? Top-level `public/` or `wallet/`.
- Subgraph queries → `subgraph/`. DNS-related → `dns/`.

### Action shape

Each action ships **two** layers:

1. **`get{ActionName}ReadParameters` / `{actionName}WriteParameters`** — a pure helper
   that builds the full call payload (`ReadContractParameters` for reads,
   `WriteContractParameters` for writes: address + abi + functionName + args, plus
   `chain` / `account` for writes) without actually hitting the chain.
2. **`{actionName}` action** — a thin convenience wrapper that calls the parameters
   helper and forwards the result to viem's `readContract` / `multicall` /
   `writeContract`.

**Consumers should be steered toward the parameters helpers.** Pair them with viem's
`readContract` / `writeContract` (or with `multicall`, `simulateContract`,
`estimateContractGas`, `resolverMulticallParameters`, etc.) so they keep full control
over batching, simulation, gas estimation, and transaction inspection. The action is
just there for the simple end-to-end case.

JSDoc `@example`s on **new** actions should demonstrate the parameters helper — the
action itself is the obvious one-liner.

#### Read action skeleton

```ts
// 1. ReadParameters helper — pure, builds the read payload.
export type Get{ActionName}ReadParametersParameters = { /* on-chain inputs */ }
export type Get{ActionName}ReadParametersReturnType =
  ReturnType<typeof get{ActionName}ReadParameters>
export type Get{ActionName}ReadParametersErrorType = /* coder errors */

export const get{ActionName}ReadParameters = (
  params: Get{ActionName}ReadParametersParameters,
) => {
  return {
    address,
    ...{coder}Parameters(params), // delegate abi/functionName/args to a coder
  } as const satisfies ReadContractParameters</* abi */>
}

// 2. Action — wraps ReadParameters + readContract (or multicall).
export type {ActionName}Parameters = Get{ActionName}ReadParametersParameters
export type {ActionName}ReturnType = /* decoded result */
export type {ActionName}ErrorType =
  | Get{ActionName}ReadParametersErrorType
  | ReadContractErrorType

export async function {actionName}(
  client: Client,
  params: {ActionName}Parameters,
): Promise<{ActionName}ReturnType> {
  ASSERT_NO_TYPE_ERROR(client)
  const readContractAction = getAction(client, readContract, 'readContract')
  const result = await readContractAction(get{ActionName}ReadParameters(params))
  return decode{X}Result(result)
}
```

A handful of older actions (e.g. `src/actions/public/v2/getOwner.ts`) call `readContract`
inline without exporting a `ReadParameters` helper. **Don't follow that pattern for new
code** — extract a `get{ActionName}ReadParameters` helper, even if the action is small.

#### Write action skeleton

```ts
// 1. WriteParameters helper — pure, builds the tx payload.
export type {ActionName}WriteParametersParameters = { /* on-chain inputs */ }
export type {ActionName}WriteParametersReturnType =
  ReturnType<typeof {actionName}WriteParameters>
export type {ActionName}WriteParametersErrorType = /* coder errors */

export const {actionName}WriteParameters = <chain extends Chain, account extends Account>(
  client: Client<Transport, chain, account>,
  params: {ActionName}WriteParametersParameters,
) => {
  return {
    address,
    chain: client.chain,
    account: client.account,
    ...{coder}Parameters(params), // delegate abi/functionName/args to a coder
  } as const satisfies WriteContractParameters</* abi */>
}

// 2. Action — wraps WriteParameters + writeContract.
export type {ActionName}Parameters<chain, account, chainOverride> =
  Prettify<{ActionName}WriteParametersParameters & WriteTransactionParameters<…>>
export type {ActionName}ReturnType = WriteContractReturnType
export type {ActionName}ErrorType =
  | {ActionName}WriteParametersErrorType
  | ClientWithOverridesErrorType
  | WriteContractErrorType

export async function {actionName}(client, { …params, ...txArgs }) {
  const writeParameters = {actionName}WriteParameters(
    clientWithOverrides(client, txArgs),
    params,
  )
  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({ ...writeParameters, ...txArgs } as WriteContractParameters)
}
```

`src/actions/wallet/setTextRecord.ts` is the canonical write example. For reads, build the
helper the same way using `ReadContractParameters` (no `chain` / `account`) — the action
just calls `readContract` (or `multicall`) on the result.

Conventions:

- Always go through `getAction(client, viemAction, 'viemAction')` so user-supplied action
  overrides are respected.
- Read actions that hit multiple calls should use `multicall` for batching.
- Import ABIs from `@ensdomains/ensjs-abi/...`, **not** by hand-rolling them inside the
  action file.
- If the action requires specific contracts on the chain, type the `client` parameter with
  `RequireClientContracts<…>` (see `clients/shared.ts`) so misconfigured chains fail at
  compile time instead of runtime.
- Keep parameter and return types `Prettify`-wrapped where it helps DX.
- Every public type, parameter, and return value should be exported so downstream apps can
  build wrappers.
- Add a JSDoc block on the function with a one-line description and a usage `@example`. The
  `generateDocs` script depends on these.

### Coders: preparing read/write parameters for actions

Most actions don't talk to viem directly — they delegate the work of *preparing the
read or write call* to a coder in `packages/ensjs/src/utils/coders/`. A coder is a small
module that produces the `{ abi, functionName, args }` payload an action (or a user
hand-rolling a batched call) feeds into `readContract`, `writeContract`, `multicall`, or
`encodeFunctionData`. This is the layer that lets users compose calls themselves via
`resolveNameData`, `resolverMulticallParameters`, etc., without re-implementing the action.

The convention for each coder file (e.g. `getText.ts`, `setAddr.ts`, `getAbi.ts`):

- **`get{X}Parameters({ … })`** — prepares a **read** call. Returns
  `{ abi, functionName, args } as const`, ready to hand to `readContract`, `multicall`, or
  `encodeFunctionData`. Export the matching `Get{X}ParametersParameters`,
  `Get{X}ParametersReturnType`, and `Get{X}ParametersErrorType` types.
- **`set{X}Parameters({ … })`** — prepares a **write** call. Same shape, intended for
  `writeContract` / `encodeFunctionData`.
- **`decode{X}Result(data, { strict })`** — decodes the raw `Hex` returned by a read into
  the user-facing shape. Should respect `strict` (throw on decode error vs. return
  `null`).
- **`decode{X}ResultFromPrimitiveTypes({ decodedData })`** — pure transform from the ABI's
  decoded primitive into the final shape. Split out so callers that already decoded the
  result themselves (e.g. inside a multicall handler) can reuse the post-processing
  without re-running ABI decoding.

An action then composes the coder rather than hand-building ABI args:

```ts
// Read action: prepare params with the coder, send via resolver, decode the result.
const result = await resolveNameDataAction({
  name,
  data: encodeFunctionData(getAddressParameters({ name, coin })),
})
return decodeAddressResult(result.resolvedData, { strict, coin })
```

```ts
// Write action: prepare params with the coder, hand off to writeContract.
return writeContractAction({
  ...setTextParameters({ name, key, value }),
  address: resolverAddress,
})
```

When you add a new record type or on-chain call, **write the coder first**, then build the
action on top of it. Coders are exported from `@ensdomains/ensjs/utils` (or `/utils/v2`) —
add new ones to the relevant `src/utils/index.ts` so consumers can import them and build
their own batched calls.

### Wire it into the public API

Each action subpath has an entry-point file under `src/exports/` that re-exports
everything in that group. Add a line to the right one:

| Action location | Export file |
| --- | --- |
| `actions/public/*.ts` | `src/exports/public.ts` |
| `actions/public/v1/*.ts` | `src/exports/public/v1.ts` |
| `actions/public/v2/*.ts` | `src/exports/public/v2.ts` |
| `actions/wallet/*.ts` | `src/exports/wallet.ts` |
| `actions/wallet/v2/*.ts` | `src/exports/wallet/v2.ts` (also re-exported from `wallet.ts` if shared) |
| `actions/subgraph/*.ts` | `src/subgraph.ts` |
| `actions/dns/*.ts` | `src/dns.ts` |

Keep these export lists alphabetical.

### Tests

Co-locate the test next to the action: `getFoo.ts` → `getFoo.test.ts`. Use the helpers in
`src/test/`:

```ts
import { describe, expect, it } from 'vitest'
import {
  publicClient as client,
  deploymentAddresses,
} from '../../../test/addTestContracts.js'
import { getOwner } from './getOwner.js'

describe('getOwner', () => {
  it('returns the owner for a V2 name', async () => {
    const owner = await getOwner(client, {
      registryAddress: deploymentAddresses.ETHRegistry,
      label: 'example',
    })
    expect(owner).not.toEqual(zeroAddress)
  })
})
```

Run with `pnpm -F @ensdomains/ensjs test`. The local environment must be running
(`pnpm -F @ensdomains/ensjs denv`) for tests that hit deployed contracts.

---

## Adding or updating a contract address

Chain-pinned ENS addresses live in `packages/ensjs/src/clients/l1.ts`:

1. Add the contract name to the `supportedL1Contracts` tuple.
2. Add the address under each chain entry in `ensL1Contracts` (use `zeroAddress` if it
   isn't deployed on that chain yet — strict typing requires every entry to be present).
3. If the contract is part of a new ENS version or category, also extend `ChainWithEns` /
   `extendChainWithEns` typing as needed.

Subgraph URLs are next to the contract addresses in the same file (`ensL1Subgraphs`).

---

## Errors

Custom errors live in `packages/ensjs/src/errors/` and are re-exported from
`packages/ensjs/src/index.ts`. New error classes should:

- Extend `BaseError`.
- Have a stable `name` for `instanceof`-style discrimination.
- Be added to the appropriate file (`general.ts`, `public.ts`, `subgraph.ts`, `utils.ts`,
  `dns.ts`, `contracts.ts`) and re-exported from `index.ts`.

---

## Pull request checklist

- [ ] Code formatted and linted (`pnpm lint`).
- [ ] Tests added or updated, `pnpm -F @ensdomains/ensjs test` passes.
- [ ] Type-check passes (`pnpm -F @ensdomains/ensjs check:types`).
- [ ] New actions are re-exported from the relevant entry point.
- [ ] New ABI snippets are exported from `@ensdomains/ensjs-abi` and re-exported from
      `ensjs/contracts`.
- [ ] Changeset added (`pnpm chgset:run`) describing the user-visible change.
- [ ] JSDoc `@example` on any new public function.
