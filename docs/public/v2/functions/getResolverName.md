[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [public/v2](../api.md) / getResolverName

# Function: getResolverName()

> **getResolverName**(`client`, `parameters`): `Promise`\<`GetResolverNameReturnType`\>

Defined in: packages/ensjs/src/actions/public/v2/resolver/getResolverName.ts:43

Gets the name of a permissioned resolver: the `name` record of its default
record (the one written against the root name), read through ENSIP-10
`resolve` since the post-audit-2 resolver has no direct `name(node)` getter.

## Parameters

### client

`Client`

Client

### parameters

`GetResolverNameParameters`

GetResolverNameParameters

## Returns

`Promise`\<`GetResolverNameReturnType`\>

Resolver address, or null if none is found. GetResolverNameReturnType

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { getResolverName } from '@ensdomains/ensjs/public/v2'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})
const result = await getResolverName(client, { resolverAddress: '0x123' })
// l2name.eth
```
