[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [chain](../api.md) / ChainWithContracts

# Type Alias: ChainWithContracts\<contracts, chain\>

> **ChainWithContracts**\<`contracts`, `chain`\> = `Omit`\<`chain`, `"contracts"`\> & `object`

Defined in: packages/ensjs/src/clients/chain.ts:390

Type utility that explicitly enforces the presence of required contracts on the chain

## Type Declaration

### contracts

> **contracts**: `{ [key in contracts]: ChainContract }`

## Type Parameters

### contracts

`contracts` *extends* `SuggestedContracts`

### chain

`chain` *extends* `Chain` = `Chain`
