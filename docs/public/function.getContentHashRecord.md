[**@ensdomains/ensjs**](../README.md)

---

> [public](README.md) > getContentHashRecord

# Function: getContentHashRecord()

> **getContentHashRecord**(`client`, `parameters`): `Promise`\< `GetContentHashRecordReturnType` \>

Gets the content hash record for a name

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts, getContentHashRecord } from '@ensdomains/ensjs'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})
const result = await getContentHashRecord(client, { name: 'ens.eth' })
// { protocolType: 'ipfs', decoded: 'k51qzi5uqu5djdczd6zw0grmo23j2vkj9uzvujencg15s5rlkq0ss4ivll8wqw' }
```

## Parameters

| Parameter         | Type     | Description                         |
| :---------------- | :------- | :---------------------------------- |
| `client`          | `Object` | ClientWithEns                       |
| `parameters`      | `object` | GetContentHashRecordParameters      |
| `parameters.name` | `string` | Name to get content hash record for |

## Returns

`Promise`\< `GetContentHashRecordReturnType` \>

Content hash object, or `null` if not found. GetContentHashRecordReturnType

## Source

[packages/ensjs/src/functions/public/getContentHashRecord.ts:57](https://github.com/ensdomains/ensjs-v3/blob/278f5349/packages/ensjs/src/functions/public/getContentHashRecord.ts#L57)

---

Generated using [TypeDoc](https://typedoc.org/) and [typedoc-plugin-markdown](https://www.npmjs.com/package/typedoc-plugin-markdown)
