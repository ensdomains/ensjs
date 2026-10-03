[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [public](../api.md) / isPaymentToken

# Function: isPaymentToken()

> **isPaymentToken**\<`chain`\>(`client`, `parameters`): `Promise`\<`boolean`\>

Defined in: packages/ensjs/src/actions/public/registrar/isPaymentToken.ts:36

Checks whether a token is accepted for register/renew payment.
payment-token validation lives on the StandardRentPriceOracle (the registrar
delegates pricing/payment to a swappable oracle).

## Type Parameters

### chain

`chain` *extends* `Chain`

## Parameters

### client

[`RequireClientContracts`](../../chain/type-aliases/RequireClientContracts.md)\<`chain`, `"ensStandardRentPriceOracle"`\>

Client

### parameters

`IsPaymentTokenParameters`

IsPaymentTokenParameters

## Returns

`Promise`\<`boolean`\>

`true` if the token is supported. IsPaymentTokenReturnType
