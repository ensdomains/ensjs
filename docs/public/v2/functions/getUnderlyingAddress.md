[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [public/v2](../api.md) / getUnderlyingAddress

# Function: getUnderlyingAddress()

> **getUnderlyingAddress**(`client`, `parameters`): `Promise`\<`GetUnderlyingResolverReturnType`\>

Defined in: packages/ensjs/src/actions/public/v2/resolver/getUnderlyingResolver.ts:43

Finds the underlying non-mainnet resolver address via offchain lookup.

## Parameters

### client

`Client`

Client

### parameters

`GetUnderlyingResolverParameters`

GetUnderlyingResolverParameters

## Returns

`Promise`\<`GetUnderlyingResolverReturnType`\>

Resolver address, or null if none is found, and whether it's on mainnet or not. GetUnderlyingResolverReturnType

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { getUnderlyingAddress } from '@ensdomains/ensjs/public/v2'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})
const result = await getUnderlyingAddress(client, {
  resolverAddress: '0x...',
  name: 'ens.eth',
})
// ['0x352d7aA7a8bd0F6f31635BE5ceCb6Cebb6929A15', false]
```
