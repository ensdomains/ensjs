[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [public](../api.md) / getBaseRates

# Function: getBaseRates()

> **getBaseRates**\<`chain`\>(`client`): `Promise`\<`GetBaseRatesReturnType`\>

Defined in: packages/ensjs/src/actions/public/registrar/getBaseRates.ts:29

Gets the per-codepoint base rate table from the StandardRentPriceOracle. The
array is indexed by `label length - 1` (clamped to the last entry for longer
labels), each value being the base rate per second in standard units.

## Type Parameters

### chain

`chain` *extends* `Chain`

## Parameters

### client

[`RequireClientContracts`](../../chain/type-aliases/RequireClientContracts.md)\<`chain`, `"ensStandardRentPriceOracle"`\>

Client

## Returns

`Promise`\<`GetBaseRatesReturnType`\>

The base rate table. GetBaseRatesReturnType
