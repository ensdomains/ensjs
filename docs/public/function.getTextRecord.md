[**@ensdomains/ensjs**](../README.md)

---

> [public](README.md) > getTextRecord

# Function: getTextRecord()

> **getTextRecord**(`client`, `parameters`): `Promise`\< `GetTextRecordReturnType` \>

Gets a text record for a name.

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { getTextRecord } from '@ensdomains/ensjs/public'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})
const result = await getTextRecord(client, {
  name: 'ens.eth',
  key: 'com.twitter',
})
// ensdomains
```

## Parameters

| Parameter         | Type            | Description                 |
| :---------------- | :-------------- | :-------------------------- |
| `client`          | `ClientWithEns` | ClientWithEns               |
| `parameters`      | `object`        | GetTextRecordParameters     |
| `parameters.key`  | `string`        | Text record key to get      |
| `parameters.name` | `string`        | Name to get text record for |

## Returns

`Promise`\< `GetTextRecordReturnType` \>

Text record string, or null if none is found. GetTextRecordReturnType

## Source

[packages/ensjs/src/functions/public/getTextRecord.ts:60](https://github.com/ensdomains/ensjs-v3/blob/1b90b888/packages/ensjs/src/functions/public/getTextRecord.ts#L60)

---

Generated using [TypeDoc](https://typedoc.org/) and [typedoc-plugin-markdown](https://www.npmjs.com/package/typedoc-plugin-markdown)
