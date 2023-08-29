[**@ensdomains/ensjs**](../README.md)

---

> [subgraph](README.md) > getSubgraphRegistrant

# Function: getSubgraphRegistrant()

> **getSubgraphRegistrant**(`client`, `parameters`): `Promise`\< `GetSubgraphRegistrantReturnType` \>

Gets the name registrant from the subgraph.

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { getSubgraphRegistrant } from '@ensdomains/ensjs/subgraph'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})
const result = await getSubgraphRegistrant(client, { name: 'ens.eth' })
// 0xb6E040C9ECAaE172a89bD561c5F73e1C48d28cd9
```

## Parameters

| Parameter    | Type                              | Description                     |
| :----------- | :-------------------------------- | :------------------------------ |
| `client`     | `ClientWithEns`                   | ClientWithEns                   |
| `parameters` | `GetSubgraphRegistrantParameters` | GetSubgraphRegistrantParameters |

## Returns

`Promise`\< `GetSubgraphRegistrantReturnType` \>

Registrant address, or null if name was not found. GetSubgraphRegistrantReturnType

## Source

[packages/ensjs/src/functions/subgraph/getSubgraphRegistrant.ts:52](https://github.com/ensdomains/ensjs-v3/blob/1b90b888/packages/ensjs/src/functions/subgraph/getSubgraphRegistrant.ts#L52)

---

Generated using [TypeDoc](https://typedoc.org/) and [typedoc-plugin-markdown](https://www.npmjs.com/package/typedoc-plugin-markdown)
