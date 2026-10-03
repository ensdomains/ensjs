[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [public](../api.md) / getAddressRecord

# Function: getAddressRecord()

> **getAddressRecord**\<`chain`, `coin`\>(`client`, `parameters`): `Promise`\<`GetAddressRecordReturnType`\<`coin`\>\>

Defined in: packages/ensjs/src/actions/public/resolver/getAddressRecord.ts:59

Gets an address record for a name and specified coin

## Type Parameters

### chain

`chain` *extends* `Chain`

### coin

`coin` *extends* `string` \| `number` \| `undefined` = `undefined`

## Parameters

### client

[`RequireClientContracts`](../../chain/type-aliases/RequireClientContracts.md)\<`chain`, `"ensUniversalResolver"`\>

Client

### parameters

GetAddressRecordParameters

#### bypassFormat?

`boolean`

Optionally return raw bytes value of address record (default: false)

#### coin?

`coin`

Coin to get the address record for, can be either symbol (string) or coinId (number) (default: `60`)

#### gatewayUrls?

`string`[]

Batch gateway URLs to use for resolving CCIP-read requests.

#### ignoreInvalidCoinTypes?

`boolean`

Ignore invalid coinTypes

#### name

`string`

Name to get the address record for

#### strict?

`boolean`

Whether or not to throw decoding errors

## Returns

`Promise`\<`GetAddressRecordReturnType`\<`coin`\>\>

Coin value object, or `null` if not found. GetAddressRecordReturnType

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { getAddressRecord } from '@ensdomains/ensjs/public'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})
const result = await getAddressRecord(client, { name: 'ens.eth', coin: 'ETH' })
// { id: 60, name: 'ETH , value: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7' }
```
