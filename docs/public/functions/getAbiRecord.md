[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [public](../api.md) / getAbiRecord

# Function: getAbiRecord()

> **getAbiRecord**\<`chain`\>(`client`, `parameters`): `Promise`\<`GetAbiRecordReturnType`\>

Defined in: packages/ensjs/src/actions/public/resolver/getAbiRecord.ts:55

Gets the ABI record for a name

## Type Parameters

### chain

`chain` *extends* `Chain`

## Parameters

### client

[`RequireClientContracts`](../../chain/type-aliases/RequireClientContracts.md)\<`chain`, `"ensUniversalResolver"`\>

Client

### parameters

GetAbiRecordParameters

#### gatewayUrls?

`string`[]

Batch gateway URLs to use for resolving CCIP-read requests.

#### name

`string`

Name to get ABI record for

#### strict?

`boolean`

Whether or not to throw decoding errors

#### supportedContentTypes?

`bigint`

Supported content types as bitwise
ID 1: JSON
ID 2: zlib compressed JSON
ID 4: CBOR
ID 8: URI

## Returns

`Promise`\<`GetAbiRecordReturnType`\>

ABI record for the name, or `null` if not found. GetAbiRecordReturnType

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { getAbiRecord } from '@ensdomains/ensjs/public'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})
const result = await getAbiRecord(client, { name: 'ens.eth' })
// TODO: real example
```
