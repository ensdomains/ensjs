[**@ensdomains/ensjs**](../README.md)

---

> [subgraph](README.md) > getNamesForAddress

# Function: getNamesForAddress()

> **getNamesForAddress**(`client`, `parameters`): `Promise`\< `GetNamesForAddressReturnType` \>

Gets the names for an address from the subgraph.

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { getNamesForAddress } from '@ensdomains/ensjs/subgraph'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})
const result = await getNamesForAddress(client, {
  address: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7',
})
```

## Parameters

| Parameter    | Type                           | Description                  |
| :----------- | :----------------------------- | :--------------------------- |
| `client`     | `ClientWithEns`                | ClientWithEns                |
| `parameters` | `GetNamesForAddressParameters` | GetNamesForAddressParameters |

## Returns

`Promise`\< `GetNamesForAddressReturnType` \>

Name array. GetNamesForAddressReturnType

## Source

[packages/ensjs/src/functions/subgraph/getNamesForAddress.ts:161](https://github.com/ensdomains/ensjs-v3/blob/1b90b888/packages/ensjs/src/functions/subgraph/getNamesForAddress.ts#L161)

---

Generated using [TypeDoc](https://typedoc.org/) and [typedoc-plugin-markdown](https://www.npmjs.com/package/typedoc-plugin-markdown)
