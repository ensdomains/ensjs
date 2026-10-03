[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [public/v2](../api.md) / getSubregistryHistory

# Function: getSubregistryHistory()

> **getSubregistryHistory**(`client`, `parameters`): `Promise`\<`GetSubregistryHistoryReturnType`\>

Defined in: packages/ensjs/src/actions/public/v2/registry/getSubregistryHistory.ts:51

Get the subregistry update history for a name.

## Parameters

### client

`Client`

Client

### parameters

`GetSubregistryHistoryParameters`

GetSubregistryHistoryParameters

## Returns

`Promise`\<`GetSubregistryHistoryReturnType`\>

Array of subregistry history entries. GetSubregistryHistoryReturnType

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { getSubregistryHistory } from '@ensdomains/ensjs/public/v2'

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})
const history = await getSubregistryHistory(client, {
  registryAddress: '0x...',
  label: 'example',
  fromBlock: 0n,
})
// [{ tokenId: 456n, subregistry: '0x...' }]
```
