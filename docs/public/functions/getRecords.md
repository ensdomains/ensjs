[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [public](../api.md) / getRecords

# Function: getRecords()

> **getRecords**\<`chain`, `texts`, `coins`, `contentHash`, `abi`\>(`client`, `parameters`): `Promise`\<\{ \[key in string \| number \| symbol\]: ((contentHash extends true ? WithContentHashResult : \{\}) & (abi extends true ? WithAbiResult : \{\}) & (texts extends readonly string\[\] ? WithTextsResult : \{\}) & (coins extends readonly (string \| number)\[\] ? WithCoinsResult : \{\}) & \{ resolverAddress: \`0x$\{string\}\` \})\[key\] \}\>

Defined in: packages/ensjs/src/actions/public/resolver/getRecords.ts:332

Gets arbitrary records for a name

## Type Parameters

### chain

`chain` *extends* `Chain`

### texts

`texts` *extends* readonly `string`[] \| `undefined` = `undefined`

### coins

`coins` *extends* readonly (`string` \| `number`)[] \| `undefined` = `undefined`

### contentHash

`contentHash` *extends* `boolean` \| `undefined` = `undefined`

### abi

`abi` *extends* `boolean` \| `undefined` = `undefined`

## Parameters

### client

[`RequireClientContracts`](../../chain/type-aliases/RequireClientContracts.md)\<`chain`, `"ensUniversalResolver"` \| `"multicall3"`\>

Client

### parameters

`GetRecordsParameters`\<`texts`, `coins`, `contentHash`, `abi`\>

GetRecordsParameters

## Returns

`Promise`\<\{ \[key in string \| number \| symbol\]: ((contentHash extends true ? WithContentHashResult : \{\}) & (abi extends true ? WithAbiResult : \{\}) & (texts extends readonly string\[\] ? WithTextsResult : \{\}) & (coins extends readonly (string \| number)\[\] ? WithCoinsResult : \{\}) & \{ resolverAddress: \`0x$\{string\}\` \})\[key\] \}\>

Records data object. GetRecordsReturnType

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { getRecords } from '@ensdomains/ensjs/public'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})
const result = await getRecords(client, {
  name: 'ens.eth',
  texts: ['com.twitter', 'com.github'],
  coins: ['ETH'],
  contentHash: true,
})
// { texts: [{ key: 'com.twitter', value: 'ensdomains' }, { key: 'com.github', value: 'ensdomains' }], coins: [{ id: 60, name: 'ETH', value: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7' }], contentHash: { protocolType: 'ipns', decoded: 'k51qzi5uqu5djdczd6zw0grmo23j2vkj9uzvujencg15s5rlkq0ss4ivll8wqw' } }
```
