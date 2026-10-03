[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [public](../api.md) / getNames

# Function: getNames()

> **getNames**\<`chain`\>(`client`, `parameters`): `Promise`\<`GetNamesReturnType`\>

Defined in: packages/ensjs/src/actions/public/resolver/getNames.ts:62

Gets the ENSIP-19 default (chain-agnostic) primary names for a batch of
addresses by reading the `DefaultReverseResolver`'s `resolveNames`.

This is the ENSIP-19 `default.reverse` resolver from `ens-contracts` (not a
v2-specific contract — ENSv2 has no reverse resolver of its own). It is read
directly because [getName](getName.md) goes through the Universal Resolver's
per-coin reverse lookup (defaulting to coinType `60`, i.e. `addr.reverse`),
which does not surface the chain-agnostic `default.reverse` records this
resolver holds.

Note: results are NOT forward-verified. Callers that need a verified primary
name should check forward resolution themselves.

## Type Parameters

### chain

`chain` *extends* `Chain`

## Parameters

### client

[`RequireClientContracts`](../../chain/type-aliases/RequireClientContracts.md)\<`chain`, `"ensDefaultReverseResolver"`\>

Client

### parameters

`GetNamesParameters`

GetNamesParameters

## Returns

`Promise`\<`GetNamesReturnType`\>

Names aligned to `addresses` (`null` where no name is set). GetNamesReturnType

## Example

```ts
import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { getNames } from '@ensdomains/ensjs/public'

const client = createPublicClient({
  chain: addEnsContracts(sepolia),
  transport: http(),
})
const result = await getNames(client, {
  addresses: ['0xb8c2C29ee19D8307cb7255e1Cd9CbDE883A267d5'],
})
// ['nick.eth']
```
