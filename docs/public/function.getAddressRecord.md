[**@ensdomains/ensjs**](../README.md)

---

> [public](README.md) > getAddressRecord

# Function: getAddressRecord()

> **getAddressRecord**(`client`, `parameters`): `Promise`\< `GetAddressRecordReturnType` \>

Gets an address record for a name and specified coin

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts, getAddressRecord } from '@ensdomains/ensjs'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})
const result = await getAddressRecord(client, { name: 'ens.eth', coin: 'ETH' })
// { id: 60, name: 'ETH , value: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7' }
```

## Parameters

| Parameter                  | Type                 | Description                                                                                          |
| :------------------------- | :------------------- | :--------------------------------------------------------------------------------------------------- |
| `client`                   | `Object`             | ClientWithEns                                                                                        |
| `parameters`               | `object`             | GetAddressRecordParameters                                                                           |
| `parameters.bypassFormat`? | `boolean`            | Optionally return raw bytes value of address record (default: false)                                 |
| `parameters.coin`?         | `string` \| `number` | Coin to get the address record for, can be either symbol (string) or coinId (number) (default: `60`) |
| `parameters.name`          | `string`             | Name to get the address record for                                                                   |

## Returns

`Promise`\< `GetAddressRecordReturnType` \>

Coin value object, or `null` if not found. GetAddressRecordReturnType

## Source

[packages/ensjs/src/functions/public/getAddressRecord.ts:56](https://github.com/ensdomains/ensjs-v3/blob/278f5349/packages/ensjs/src/functions/public/getAddressRecord.ts#L56)

---

Generated using [TypeDoc](https://typedoc.org/) and [typedoc-plugin-markdown](https://www.npmjs.com/package/typedoc-plugin-markdown)
