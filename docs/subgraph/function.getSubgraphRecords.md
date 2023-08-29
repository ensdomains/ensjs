[**@ensdomains/ensjs**](../README.md)

---

> [subgraph](README.md) > getSubgraphRecords

# Function: getSubgraphRecords()

> **getSubgraphRecords**(`client`, `parameters`): `Promise`\< `GetSubgraphRecordsReturnType` \>

Gets the records for a name from the subgraph

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

## Parameters

| Parameter    | Type                           | Description                  |
| :----------- | :----------------------------- | :--------------------------- |
| `client`     | `ClientWithEns`                | ClientWithEns                |
| `parameters` | `GetSubgraphRecordsParameters` | GetSubgraphRecordsParameters |

## Returns

`Promise`\< `GetSubgraphRecordsReturnType` \>

Record object, or null if name was not found. GetSubgraphRecordsReturnType

## Source

[packages/ensjs/src/functions/subgraph/getSubgraphRecords.ts:154](https://github.com/ensdomains/ensjs-v3/blob/1b90b888/packages/ensjs/src/functions/subgraph/getSubgraphRecords.ts#L154)

---

Generated using [TypeDoc](https://typedoc.org/) and [typedoc-plugin-markdown](https://www.npmjs.com/package/typedoc-plugin-markdown)
