[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [public](../api.md) / getResolver

# Function: getResolver()

> **getResolver**\<`chain`\>(`client`, `parameters`): `Promise`\<`GetResolverReturnType`\>

Defined in: packages/ensjs/src/actions/public/resolver/getResolver.ts:67

Gets the resolver address for a name.

Returns the address records should be read from and written to. The Universal
Resolver locates the resolver bound to the name; when that resolver is a
composite resolver (it delegates to an underlying resolver, such as the ENSv1
mirror used for unmigrated v1 names), the underlying resolver is returned so
callers get a writable resolver. A plain (non-composite) resolver is already
final and is returned as-is.

## Type Parameters

### chain

`chain` *extends* `Chain`

## Parameters

### client

[`RequireClientContracts`](../../chain/type-aliases/RequireClientContracts.md)\<`chain`, `"ensUniversalResolver"`\>

Client

### parameters

`GetResolverParameters`

GetResolverParameters

## Returns

`Promise`\<`GetResolverReturnType`\>

Resolver address, or null if none is found. GetResolverReturnType

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsL1Contracts } from '@ensdomains/ensjs'
import { getResolver } from '@ensdomains/ensjs/public'

const client = createPublicClient({
  chain: addEnsL1Contracts(mainnet),
  transport: http(),
})
const result = await getResolver(client, { name: 'ens.eth' })
// 0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41
```
