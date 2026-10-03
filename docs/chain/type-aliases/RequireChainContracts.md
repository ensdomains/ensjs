[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [chain](../api.md) / RequireChainContracts

# Type Alias: RequireChainContracts\<chain, contracts\>

> **RequireChainContracts**\<`chain`, `contracts`\> = `chain` *extends* `Omit`\<`Chain`, `"contracts"`\> & `object` ? `chain` : `TypeError`\<`` `Chain "${chain["name"]}" is missing required contracts: ${StringConcatenationOrder<contracts, ", ">}` ``\>

Defined in: packages/ensjs/src/clients/chain.ts:352

Type utility that enforces required contract dependencies on the chain while providing clear error messages

## Type Parameters

### chain

`chain` *extends* `Chain`

### contracts

`contracts` *extends* `SuggestedContracts`

## Example

```ts
// Action definition
const myAction = async <chain extends Chain>(
  chain: RequireChainContracts<chain, 'ensPublicResolver'>,
) => { ... }

// Will error
myAction(mainnet) // TypeError<'Chain "mainnet" is missing required contracts: ensPublicResolver'>

// Will not error
myAction(extendChainWithEns(mainnet))
```
