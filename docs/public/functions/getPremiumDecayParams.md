[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [public](../api.md) / getPremiumDecayParams

# Function: getPremiumDecayParams()

> **getPremiumDecayParams**\<`chain`\>(`client`): `Promise`\<`GetPremiumDecayParamsReturnType`\>

Defined in: packages/ensjs/src/actions/public/registrar/getPremiumDecayParams.ts:37

Reads the StandardRentPriceOracle's immutable expiry-premium decay parameters
(`PREMIUM_PRICE_INITIAL`, `PREMIUM_HALVING_PERIOD`, `PREMIUM_PERIOD`) in a
single multicall. Useful for plotting the premium curve client-side without
sampling `getPremiumPriceAfter` repeatedly.

## Type Parameters

### chain

`chain` *extends* `Chain`

## Parameters

### client

[`RequireClientContracts`](../../chain/type-aliases/RequireClientContracts.md)\<`chain`, `"ensStandardRentPriceOracle"`\>

Client

## Returns

`Promise`\<`GetPremiumDecayParamsReturnType`\>

Premium decay parameters. GetPremiumDecayParamsReturnType
