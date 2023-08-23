[**@ensdomains/ensjs**](../README.md)

---

> [subgraph](README.md) > getSubnames

# Function: getSubnames()

> **getSubnames**(`client`, `parameters`): `Promise`\< `GetSubnamesReturnType` \>

Gets the subnames for a name from the subgraph.

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { getSubnames } from '@ensdomains/ensjs/subgraph'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})
const result = await getSubnames(client, { name: 'ens.eth' })
```

## Parameters

| Parameter    | Type                    | Description           |
| :----------- | :---------------------- | :-------------------- |
| `client`     | `ClientWithEns`         | ClientWithEns         |
| `parameters` | `GetSubnamesParameters` | GetSubnamesParameters |

## Returns

`Promise`\< `GetSubnamesReturnType` \>

Subname array. GetSubnamesReturnType

## Source

[packages/ensjs/src/functions/subgraph/getSubnames.ts:129](https://github.com/ensdomains/ensjs-v3/blob/62fd2c82/packages/ensjs/src/functions/subgraph/getSubnames.ts#L129)

---

Generated using [TypeDoc](https://typedoc.org/) and [typedoc-plugin-markdown](https://www.npmjs.com/package/typedoc-plugin-markdown)
