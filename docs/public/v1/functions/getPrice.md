[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [public/v1](../api.md) / getPrice

# Function: getPrice()

> **getPrice**\<`chain`\>(`client`, `parameters`): `Promise`\<`GetPriceReturnType`\>

Defined in: packages/ensjs/src/actions/public/v1/registrar/getPrice.ts:76

Gets the registration price of a name, or array of names, for a given duration.

Calls `ETHRegistrarController.rentPrice(label, duration)` on the legacy v1 controller.
Pricing is ETH-native (no payment token), and `premium` reflects the post-expiry
exponential-decay premium curve on the legacy price oracle.

When given an array of names, the reads are batched into a single Multicall3
round-trip and the returned `base`/`premium` are summed across all names (atomic
against one block).

## Type Parameters

### chain

`chain` *extends* `Chain`

## Parameters

### client

[`RequireClientContracts`](../../../chain/type-aliases/RequireClientContracts.md)\<`chain`, `"ensEthRegistrarController"`\>

Client

### parameters

`GetPriceParameters`

GetPriceParameters

## Returns

`Promise`\<`GetPriceReturnType`\>

Price data object. GetPriceReturnType

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsL1Contracts } from '@ensdomains/ensjs'
import { getPrice } from '@ensdomains/ensjs/public/v1'

const client = createPublicClient({
  chain: addEnsL1Contracts(mainnet),
  transport: http(),
})
const result = await getPrice(client, { nameOrNames: 'ens.eth', duration: 31536000 })
// { base: 352828971668930335n, premium: 0n }
```
