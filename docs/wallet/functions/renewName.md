[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [wallet](../api.md) / renewName

# Function: renewName()

> **renewName**\<`chain`, `account`, `chainOverride`\>(`client`, `options`): `Promise`\<`` `0x${string}` ``\>

Defined in: packages/ensjs/src/actions/wallet/registrar/renewName.ts:178

Renews a `.eth` 2LD via the given renewer contract: the v2 `ETHRegistrar`
(`contract: 'ensEthRegistrar'`) for names registered on v2, or `ETHRenewerV1`
(`contract: 'ensEthRenewerV1'`) for unmigrated legacy (v1) names. Both expose
the same `renew((label,duration,referrer),paymentToken)` ERC-20 interface, so
`contract` only selects the target address — resolve it from your data source
(indexer) or an on-chain owner lookup (getOwner).

Legacy `ETHRegistrarController`s were revoked at the v2 migration cutover, so an
unmigrated v1 name can only be renewed through `ETHRenewerV1`, which renews it
and syncs the underlying v1 BaseRegistrar. It renews a name while it still holds
its pre-migration `RESERVED` slot (throughout the name's active life), or — once
that slot has lapsed to `AVAILABLE` — while it is still unclaimed and within the
v2 grace window; a name that was never reserved, has already migrated to v2, or
has lapsed past grace reverts `NameNotRenewable`.

Renews a single name. Both renewers also expose
`renewBatch(RenewData[],paymentToken)`, which this action does not wrap.

## Type Parameters

### chain

`chain` *extends* `Chain`

### account

`account` *extends* `Account`

### chainOverride

`chainOverride` *extends* [`ChainWithContracts`](../../chain/type-aliases/ChainWithContracts.md)\<`RenewerContract`\> \| `undefined`

## Parameters

### client

[`RequireClientContracts`](../../chain/type-aliases/RequireClientContracts.md)\<`chain`, `RenewerContract`, `account`\>

Client

### options

RenewNameParameters

#### contract

`RenewerContract`

Renewer contract to use: `ensEthRegistrar` for names registered on v2,
`ensEthRenewerV1` for unmigrated legacy (v1) names.

#### duration

`bigint`

Renewal duration in seconds

#### name

`string`

Full 2LD .eth name to renew (e.g. example.eth)

#### paymentToken

`` `0x${string}` ``

ERC-20 token used for payment (must be approved for the renewer)

#### referrer?

`` `0x${string}` ``

Referrer id (bytes32). Defaults to zero bytes32 when omitted.

## Returns

`Promise`\<`` `0x${string}` ``\>

Transaction hash. RenewNameReturnType

## Example

```ts
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsL1Contracts } from '@ensdomains/ensjs'
import { renewName } from '@ensdomains/ensjs/wallet'

const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
const wallet = createWalletClient({
  account,
  chain: addEnsL1Contracts(mainnet),
  transport: custom(window.ethereum),
})

const hash = await renewName(wallet, {
  name: 'example.eth',
  duration: 31536000n, // 1 year
  paymentToken: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  contract: 'ensEthRegistrar',
})
// 0x...
```
