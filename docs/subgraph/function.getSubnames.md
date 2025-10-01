[**@ensdomains/ensjs**](../README.md)

---

> [subgraph](README.md) > getSubnames

# Function: getSubnames()

> **getSubnames**(`client`, `parameters`): `Promise`\< `GetSubnamesReturnType` \>

Gets the subnames for a name from the subgraph.

> [!NOTE]
> It's recommended to use an API key from TheGraph to avoid rate limiting. Learn more in [Custom Subgraph URIs](../basics/custom-subgraph-uris.md).

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

[packages/ensjs/src/functions/subgraph/getSubnames.ts:129](https://github.com/ensdomains/ensjs-v3/blob/1b90b888/packages/ensjs/src/functions/subgraph/getSubnames.ts#L129)

---

Generated using [TypeDoc](https://typedoc.org/) and [typedoc-plugin-markdown](https://www.npmjs.com/package/typedoc-plugin-markdown)
