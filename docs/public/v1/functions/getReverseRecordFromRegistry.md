[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [public/v1](../api.md) / getReverseRecordFromRegistry

# Function: getReverseRecordFromRegistry()

> **getReverseRecordFromRegistry**\<`chain`\>(`client`, `parameters`): `Promise`\<`GetReverseRecordFromRegistryReturnType`\>

Defined in: packages/ensjs/src/actions/public/v1/registry/getReverseRecordFromRegistry.ts:61

Gets the reverse record (primary name) for an address by reading directly from
the L1 ENS registry and resolver, bypassing the Universal Resolver and CCIP-read.

Useful as a fallback when `getName` returns null due to Universal Resolver
errors, but the reverse record still exists on-chain.

## Type Parameters

### chain

`chain` *extends* `Chain`

## Parameters

### client

[`RequireClientContracts`](../../../chain/type-aliases/RequireClientContracts.md)\<`chain`, `"ensLegacyRegistry"`\>

Client

### parameters

`GetReverseRecordFromRegistryParameters`

GetReverseRecordFromRegistryParameters

## Returns

`Promise`\<`GetReverseRecordFromRegistryReturnType`\>

Name and reverse resolver address, or `null` if no reverse record is set. GetReverseRecordFromRegistryReturnType

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { getReverseRecordFromRegistry } from '@ensdomains/ensjs/public/v1'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})
const result = await getReverseRecordFromRegistry(client, { address: '0xb8c2C29ee19D8307cb7255e1Cd9CbDE883A267d5' })
// { name: 'nick.eth', reverseResolverAddress: '0xa2c122be93b0074270ebee7f6b7292c7deb45047' }
```
