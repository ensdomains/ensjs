[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [subgraph](../api.md) / getSubnames

# Function: getSubnames()

> **getSubnames**\<`_chain`\>(`client`, `parameters`): `Promise`\<`GetSubnamesReturnType`\>

Defined in: packages/ensjs/src/actions/subgraph/getSubnames.ts:109

Gets the subnames for a name from the subgraph.

## Type Parameters

### _chain

`_chain` *extends* `ChainWithSubgraph`

## Parameters

### client

ClientWithEns

#### chain

`_chain`

### parameters

`GetSubnamesParameters`

GetSubnamesParameters

## Returns

`Promise`\<`GetSubnamesReturnType`\>

Subname array. GetSubnamesReturnType

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { getSubnames } from '@ensdomains/ensjs/subgraph'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})
const result = await getSubnames(client, { name: 'ens.eth' })
```
