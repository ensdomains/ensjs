[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [index](../api.md) / addEnsContracts

# Function: addEnsContracts()

> **addEnsContracts**\<`chain`\>(`chain`): `ChainWithEns`\<`chain`\>

Defined in: packages/ensjs/src/contracts/addEnsContracts.ts:26

Adds ENS contract addresses to the viem chain

## Type Parameters

### chain

`chain` *extends* `AnySupportedL1Chain`

## Parameters

### chain

`chain`

The viem Chain object to add the ENS contracts to

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
