[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [subgraph](../api.md) / getNameHistory

# Function: getNameHistory()

> **getNameHistory**(`client`, `parameters`): `Promise`\<`GetNameHistoryReturnType`\>

Defined in: packages/ensjs/src/actions/subgraph/getNameHistory.ts:93

Gets the history of a name from the subgraph.

## Parameters

### client

ClientWithEns

#### chain

`ChainWithSubgraph`

### parameters

`GetNameHistoryParameters`

GetNameHistoryParameters

## Returns

`Promise`\<`GetNameHistoryReturnType`\>

History object, or null if name could not be found. GetNameHistoryReturnType

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { getNameHistory } from '@ensdomains/ensjs/subgraph'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})
const result = await getNameHistory(client, { name: 'ens.eth' })
```
