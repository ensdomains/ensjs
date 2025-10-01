[**@ensdomains/ensjs**](../README.md)

---

> [subgraph](README.md) > getDecodedName

# Function: getDecodedName()

> **getDecodedName**(`client`, `parameters`): `Promise`\< `GetDecodedNameReturnType` \>

Gets the full name for a name with unknown labels from the subgraph.

> [!NOTE]
> It's recommended to use an API key from TheGraph to avoid rate limiting. Learn more in [Custom Subgraph URIs](../basics/custom-subgraph-uris.md).

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { getDecodedName } from '@ensdomains/ensjs/subgraph'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})
const result = await getDecodedName(client, {
  name: '[5cee339e13375638553bdf5a6e36ba80fb9f6a4f0783680884d92b558aa471da].eth',
})
// ens.eth
```

## Parameters

| Parameter    | Type                       | Description              |
| :----------- | :------------------------- | :----------------------- |
| `client`     | `ClientWithEns`            | ClientWithEns            |
| `parameters` | `GetDecodedNameParameters` | GetDecodedNameParameters |

## Returns

`Promise`\< `GetDecodedNameReturnType` \>

Full name, or null if name was not found. GetDecodedNameReturnType

## Source

[packages/ensjs/src/functions/subgraph/getDecodedName.ts:45](https://github.com/ensdomains/ensjs-v3/blob/1b90b888/packages/ensjs/src/functions/subgraph/getDecodedName.ts#L45)

---

Generated using [TypeDoc](https://typedoc.org/) and [typedoc-plugin-markdown](https://www.npmjs.com/package/typedoc-plugin-markdown)
