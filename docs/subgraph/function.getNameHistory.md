[**@ensdomains/ensjs**](../README.md)

---

> [subgraph](README.md) > getNameHistory

# Function: getNameHistory()

> **getNameHistory**(`client`, `parameters`): `Promise`\< `GetNameHistoryReturnType` \>

Gets the history of a name from the subgraph.

> [!NOTE]
> It's recommended to use an API key from TheGraph to avoid rate limiting. Learn more in [Custom Subgraph URIs](../basics/custom-subgraph-uris.md).

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { getNameHistory } from '@ensdomains/ensjs/subgraph'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})
const result = await getNameHistory(client, { name: 'ens.eth' })
```

## Parameters

| Parameter    | Type                       | Description              |
| :----------- | :------------------------- | :----------------------- |
| `client`     | `ClientWithEns`            | ClientWithEns            |
| `parameters` | `GetNameHistoryParameters` | GetNameHistoryParameters |

## Returns

`Promise`\< `GetNameHistoryReturnType` \>

History object, or null if name could not be found. GetNameHistoryReturnType

## Source

[packages/ensjs/src/functions/subgraph/getNameHistory.ts:83](https://github.com/ensdomains/ensjs/blob/1b90b888/packages/ensjs/src/functions/subgraph/getNameHistory.ts#L83)

---

Generated using [TypeDoc](https://typedoc.org/) and [typedoc-plugin-markdown](https://www.npmjs.com/package/typedoc-plugin-markdown)
