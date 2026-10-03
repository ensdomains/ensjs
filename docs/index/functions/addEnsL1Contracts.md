[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [index](../api.md) / addEnsL1Contracts

# Function: addEnsL1Contracts()

> **addEnsL1Contracts**\<`chain`\>(`chain`): `ChainWithEns`\<`chain`\>

Defined in: packages/ensjs/src/contracts/addEnsL1Contracts.ts:25

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
import { addEnsL1Contracts } from '@ensdomains/ensjs'

const clientWithEns = createPublicClient({
  chain: addEnsL1Contracts(mainnet),
  transport: http(),
})
```
