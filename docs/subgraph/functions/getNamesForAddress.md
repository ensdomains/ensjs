[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [subgraph](../api.md) / getNamesForAddress

# Function: getNamesForAddress()

> **getNamesForAddress**(`client`, `parameters`): `Promise`\<`GetNamesForAddressReturnType`\>

Defined in: packages/ensjs/src/actions/subgraph/getNamesForAddress.ts:152

Gets the names for an address from the subgraph.

## Parameters

### client

ClientWithEns

#### chain

`ChainWithSubgraph`

### parameters

`GetNamesForAddressParameters`

GetNamesForAddressParameters

## Returns

`Promise`\<`GetNamesForAddressReturnType`\>

Name array. GetNamesForAddressReturnType

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsL1Contracts } from '@ensdomains/ensjs'
import { getNamesForAddress } from '@ensdomains/ensjs/subgraph'

const client = createPublicClient({
  chain: addEnsL1Contracts(mainnet),
  transport: http(),
})
const result = await getNamesForAddress(client, { address: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7' })
```
