[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [subgraph](../api.md) / getDecodedName

# Function: getDecodedName()

> **getDecodedName**(`client`, `parameters`): `Promise`\<`GetDecodedNameReturnType`\>

Defined in: packages/ensjs/src/actions/subgraph/getDecodedName.ts:47

Gets the full name for a name with unknown labels from the subgraph.

## Parameters

### client

ClientWithEns

#### chain

`ChainWithSubgraph`

### parameters

`GetDecodedNameParameters`

GetDecodedNameParameters

## Returns

`Promise`\<`GetDecodedNameReturnType`\>

Full name, or null if name was could not be filled. GetDecodedNameReturnType

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { getDecodedName } from '@ensdomains/ensjs/subgraph'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})
const result = await getDecodedName(client, { name: '[5cee339e13375638553bdf5a6e36ba80fb9f6a4f0783680884d92b558aa471da].eth' })
// ens.eth
```
