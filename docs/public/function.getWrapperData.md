[**@ensdomains/ensjs**](../README.md)

---

> [public](README.md) > getWrapperData

# Function: getWrapperData()

> **getWrapperData**(`client`, `parameters`): `Promise`\< `GetWrapperDataReturnType` \>

Gets the wrapper data for a name.

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts, getWrapperData } from '@ensdomains/ensjs'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})
const result = await getWrapperData(client, { name: 'ilikelasagna.eth' })
```

## Parameters

| Parameter    | Type                       | Description              |
| :----------- | :------------------------- | :----------------------- |
| `client`     | `Object`                   | ClientWithEns            |
| `parameters` | `GetWrapperDataParameters` | GetWrapperDataParameters |

## Returns

`Promise`\< `GetWrapperDataReturnType` \>

Wrapper data object, or null if name is not wrapped. GetWrapperDataReturnType

## Source

[packages/ensjs/src/functions/public/getWrapperData.ts:105](https://github.com/ensdomains/ensjs-v3/blob/278f5349/packages/ensjs/src/functions/public/getWrapperData.ts#L105)

---

Generated using [TypeDoc](https://typedoc.org/) and [typedoc-plugin-markdown](https://www.npmjs.com/package/typedoc-plugin-markdown)
