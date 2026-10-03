[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [subgraph](../api.md) / getSubgraphRegistrant

# Function: getSubgraphRegistrant()

> **getSubgraphRegistrant**\<`_chain`\>(`client`, `parameters`): `Promise`\<`GetSubgraphRegistrantReturnType`\>

Defined in: packages/ensjs/src/actions/subgraph/getSubgraphRegistrant.ts:58

Gets the name registrant from the subgraph.

## Type Parameters

### _chain

`_chain` *extends* `ChainWithSubgraph`

## Parameters

### client

ClientWithEns

#### chain

`_chain`

### parameters

`GetSubgraphRegistrantParameters`

GetSubgraphRegistrantParameters

## Returns

`Promise`\<`GetSubgraphRegistrantReturnType`\>

Registrant address, or null if name was not found. GetSubgraphRegistrantReturnType

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsL1Contracts } from '@ensdomains/ensjs'
import { getSubgraphRegistrant } from '@ensdomains/ensjs/subgraph'

const client = createPublicClient({
  chain: addEnsL1Contracts(mainnet),
  transport: http(),
})
const result = await getSubgraphRegistrant(client, { name: 'ens.eth' })
// 0xb6E040C9ECAaE172a89bD561c5F73e1C48d28cd9
```
