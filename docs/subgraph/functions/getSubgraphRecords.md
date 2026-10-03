[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [subgraph](../api.md) / getSubgraphRecords

# Function: getSubgraphRecords()

> **getSubgraphRecords**(`client`, `parameters`): `Promise`\<`GetSubgraphRecordsReturnType`\>

Defined in: packages/ensjs/src/actions/subgraph/getSubgraphRecords.ts:156

Gets the records for a name from the subgraph

## Parameters

### client

ClientWithEns

#### chain

`ChainWithSubgraph`

### parameters

`GetSubgraphRecordsParameters`

GetSubgraphRecordsParameters

## Returns

`Promise`\<`GetSubgraphRecordsReturnType`\>

Record object, or null if name was not found. GetSubgraphRecordsReturnType

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { getSubgraphRecords } from '@ensdomains/ensjs/subgraph'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})
const result = await getSubgraphRecords(client, { name: 'ens.eth' })
// {
//   isMigrated: true,
//   createdAt: { date: 2019-08-26T05:09:01.000Z, value: 1566796141000 },
//   texts: [ 'snapshot', 'url', 'avatar', 'com.twitter', 'com.github' ],
//   coins: [ '60' ]
// }
```
