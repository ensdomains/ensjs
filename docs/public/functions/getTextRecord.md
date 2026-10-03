[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [public](../api.md) / getTextRecord

# Function: getTextRecord()

> **getTextRecord**\<`chain`\>(`client`, `parameters`): `Promise`\<`DecodeTextResultReturnType`\>

Defined in: packages/ensjs/src/actions/public/resolver/getTextRecord.ts:55

Gets a text record for a name.

## Type Parameters

### chain

`chain` *extends* `Chain`

## Parameters

### client

[`RequireClientContracts`](../../chain/type-aliases/RequireClientContracts.md)\<`chain`, `"ensUniversalResolver"`\>

Client

### parameters

GetTextRecordParameters

#### gatewayUrls?

`string`[]

Batch gateway URLs to use for resolving CCIP-read requests.

#### key

`string`

Text record key to get

#### name

`string`

Name to get text record for

#### strict?

`boolean`

## Returns

`Promise`\<`DecodeTextResultReturnType`\>

Text record string, or null if none is found. GetTextRecordReturnType

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsL1Contracts } from '@ensdomains/ensjs'
import { getTextRecord } from '@ensdomains/ensjs/public'

const client = createPublicClient({
  chain: addEnsL1Contracts(mainnet),
  transport: http(),
})
const result = await getTextRecord(client, { name: 'ens.eth', key: 'com.twitter' })
// ensdomains
```
