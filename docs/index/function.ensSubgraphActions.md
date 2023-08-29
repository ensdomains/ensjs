[**@ensdomains/ensjs**](../README.md)

---

> [index](README.md) > ensSubgraphActions

# Function: ensSubgraphActions()

> **ensSubgraphActions**\<`TTransport`, `TChain`, `TAccount`\>(`client`): `EnsSubgraphActions`

Extends the viem client with ENS subgraph actions

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts, ensSubgraphActions } from '@ensdomains/ensjs'

const clientWithEns = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
}).extend(ensSubgraphActions)
```

## Type parameters

| Parameter                                     | Default                  |
| :-------------------------------------------- | :----------------------- |
| `TTransport` _extends_ `Transport`            | `Transport`              |
| `TChain` _extends_ `ChainWithEns`             | `ChainWithEns`           |
| `TAccount` _extends_ `undefined` \| `Account` | `undefined` \| `Account` |

## Parameters

| Parameter | Type                                             | Description                                               |
| :-------- | :----------------------------------------------- | :-------------------------------------------------------- |
| `client`  | `Client`\< `TTransport`, `TChain`, `TAccount` \> | The viem Client object to add the ENS subgraph actions to |

## Returns

`EnsSubgraphActions`

## Source

[packages/ensjs/src/clients/decorators/subgraph.ts:181](https://github.com/ensdomains/ensjs-v3/blob/1b90b888/packages/ensjs/src/clients/decorators/subgraph.ts#L181)

---

Generated using [TypeDoc](https://typedoc.org/) and [typedoc-plugin-markdown](https://www.npmjs.com/package/typedoc-plugin-markdown)
