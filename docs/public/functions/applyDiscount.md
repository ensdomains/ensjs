[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [public](../api.md) / applyDiscount

# Function: applyDiscount()

> **applyDiscount**\<`chain`\>(`client`, `parameters`): `Promise`\<`bigint`\>

Defined in: packages/ensjs/src/actions/public/registrar/applyDiscount.ts:37

Applies the oracle's duration-tiered discount to an arbitrary value. The
oracle uses a step-function keyed on duration; doing this on-chain keeps the
caller agnostic to the contract's discount denominator.

## Type Parameters

### chain

`chain` *extends* `Chain`

## Parameters

### client

[`RequireClientContracts`](../../chain/type-aliases/RequireClientContracts.md)\<`chain`, `"ensStandardRentPriceOracle"`\>

Client

### parameters

`ApplyDiscountParameters`

ApplyDiscountParameters

## Returns

`Promise`\<`bigint`\>

The discounted value. ApplyDiscountReturnType
