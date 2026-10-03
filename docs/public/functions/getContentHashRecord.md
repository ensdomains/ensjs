[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [public](../api.md) / getContentHashRecord

# Function: getContentHashRecord()

> **getContentHashRecord**\<`chain`\>(`client`, `parameters`): `Promise`\<`GetContentHashReturnType`\>

Defined in: packages/ensjs/src/actions/public/resolver/getContentHashRecord.ts:53

Gets the content hash record for a name

## Type Parameters

### chain

`chain` *extends* `Chain`

## Parameters

### client

[`RequireClientContracts`](../../chain/type-aliases/RequireClientContracts.md)\<`chain`, `"ensUniversalResolver"`\>

Client

### parameters

GetContentHashRecordParameters

#### gatewayUrls?

`string`[]

Batch gateway URLs to use for resolving CCIP-read requests.

#### name

`string`

Name to get content hash record for

#### strict?

`boolean`

Whether or not to throw decoding errors

## Returns

`Promise`\<`GetContentHashReturnType`\>

Content hash object, or `null` if not found. GetContentHashRecordReturnType

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsL1Contracts } from '@ensdomains/ensjs'
import { getContentHashRecord } from '@ensdomains/ensjs/public'

const client = createPublicClient({
  chain: addEnsL1Contracts(mainnet),
  transport: http(),
})
const result = await getContentHashRecord(client, { name: 'ens.eth' })
// { protocolType: 'ipfs', decoded: 'k51qzi5uqu5djdczd6zw0grmo23j2vkj9uzvujencg15s5rlkq0ss4ivll8wqw' }
```
