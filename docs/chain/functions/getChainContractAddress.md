[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [chain](../api.md) / getChainContractAddress

# Function: getChainContractAddress()

> **getChainContractAddress**\<`chain`, `contracts`, `contract`\>(`__namedParameters`): `contracts`\[`contract`\] *extends* `ChainContract` ? `any`\[`any`\]\[`"address"`\] : `never`

Defined in: packages/ensjs/src/clients/chain.ts:419

## Type Parameters

### chain

`chain` *extends* `Chain`

### contracts

`contracts` *extends* `object` = `ExtractContracts`\<`chain`\>

### contract

`contract` *extends* `string` \| `number` \| `symbol` = keyof `contracts`

## Parameters

### \_\_namedParameters

#### blockNumber?

`bigint`

#### chain

`chain`

#### contract

`contract`

## Returns

`contracts`\[`contract`\] *extends* `ChainContract` ? `any`\[`any`\]\[`"address"`\] : `never`

## See
