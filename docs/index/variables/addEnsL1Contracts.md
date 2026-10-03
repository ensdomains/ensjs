[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [index](../api.md) / addEnsL1Contracts

# ~~Variable: addEnsL1Contracts~~

> `const` **addEnsL1Contracts**: \<`chain`\>(`chain`) => `ChainWithEns`\<`chain`\> = `addEnsContracts`

Defined in: packages/ensjs/src/contracts/addEnsContracts.ts:49

Adds ENS contract addresses to the viem chain

## Type Parameters

### chain

`chain` *extends* `AnySupportedL1Chain`

The viem Chain object to add the ENS contracts to

## Parameters

### chain

`chain`

## Returns

`ChainWithEns`\<`chain`\>

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

## Deprecated

Use [addEnsContracts](../functions/addEnsContracts.md) instead.
