[**@ensdomains/ensjs**](../README.md)

---

> [public](README.md) > batch

# Function: batch()

> **batch**\<`I`\>(`client`, ...`args`): `Promise`\< `BatchReturnType`\< `I` \> \>

Batches multiple read functions into a single call.

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import {
  batch,
  getTextRecord,
  getAddressRecord,
} from '@ensdomains/ensjs/public'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})
const result = await batch(
  client,
  getTextRecord.batch({ name: 'ens.eth', key: 'com.twitter' }),
  getAddressRecord.batch({ name: 'ens.eth', coin: 'ETH' }),
)
// ['ensdomains', { id: 60, name: 'ETH', value: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7 }]
```

## Type parameters

| Parameter                             |
| :------------------------------------ |
| `I` _extends_ `BatchFunctionResult`[] |

## Parameters

| Parameter | Type            | Description   |
| :-------- | :-------------- | :------------ |
| `client`  | `ClientWithEns` | ClientWithEns |
| ...`args` | `I`             | -             |

## Returns

`Promise`\< `BatchReturnType`\< `I` \> \>

Array of return values from each function

## Source

[packages/ensjs/src/functions/public/batch.ts:95](https://github.com/ensdomains/ensjs-v3/blob/62fd2c82/packages/ensjs/src/functions/public/batch.ts#L95)

> **batch**(`client`, ...`args`): `Promise`\< `null` \| `any`[] \>

Batches multiple read functions into a single call.

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import {
  batch,
  getTextRecord,
  getAddressRecord,
} from '@ensdomains/ensjs/public'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})
const result = await batch(
  client,
  getTextRecord.batch({ name: 'ens.eth', key: 'com.twitter' }),
  getAddressRecord.batch({ name: 'ens.eth', coin: 'ETH' }),
)
// ['ensdomains', { id: 60, name: 'ETH', value: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7 }]
```

## Parameters

| Parameter | Type                    | Description   |
| :-------- | :---------------------- | :------------ |
| `client`  | `ClientWithEns`         | ClientWithEns |
| ...`args` | `BatchFunctionResult`[] | -             |

## Returns

`Promise`\< `null` \| `any`[] \>

Array of return values from each function

## Source

[packages/ensjs/src/utils/generateFunction.ts:41](https://github.com/ensdomains/ensjs-v3/blob/62fd2c82/packages/ensjs/src/utils/generateFunction.ts#L41)

---

Generated using [TypeDoc](https://typedoc.org/) and [typedoc-plugin-markdown](https://www.npmjs.com/package/typedoc-plugin-markdown)
