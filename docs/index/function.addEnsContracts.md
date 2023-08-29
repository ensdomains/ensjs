[**@ensdomains/ensjs**](../README.md)

---

> [index](README.md) > addEnsContracts

# Function: addEnsContracts()

> **addEnsContracts**\<`TChain`\>(`chain`): `ChainWithEns`\< `TChain` \>

Adds ENS contract addresses to the viem chain

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'

const clientWithEns = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})
```

## Type parameters

| Parameter                  |
| :------------------------- |
| `TChain` _extends_ `Chain` |

## Parameters

| Parameter | Type     | Description                                       |
| :-------- | :------- | :------------------------------------------------ |
| `chain`   | `TChain` | The viem Chain object to add the ENS contracts to |

## Returns

`ChainWithEns`\< `TChain` \>

## Source

[packages/ensjs/src/contracts/addEnsContracts.ts:25](https://github.com/ensdomains/ensjs-v3/blob/1b90b888/packages/ensjs/src/contracts/addEnsContracts.ts#L25)

---

Generated using [TypeDoc](https://typedoc.org/) and [typedoc-plugin-markdown](https://www.npmjs.com/package/typedoc-plugin-markdown)
