[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [public](../api.md) / getRegisterPrice

# Function: getRegisterPrice()

> **getRegisterPrice**\<`chain`\>(`client`, `parameters`): `Promise`\<`GetRegisterPriceReturnType`\>

Defined in: packages/ensjs/src/actions/public/registrar/getRegisterPrice.ts:49

Gets the registration price of a label for a given duration.

Internally calls `ETHRegistrar.getRegisterPrice(label, duration, paymentToken)`. The
registrar derives the `available` period (time elapsed since `expiry + GRACE_PERIOD`)
from on-chain state and passes it to the rent price oracle; this means the returned
`premium` already reflects the post-expiry exponential-decay premium curve.

## Type Parameters

### chain

`chain` *extends* `Chain`

## Parameters

### client

[`RequireClientContracts`](../../chain/type-aliases/RequireClientContracts.md)\<`chain`, `"ensEthRegistrar"`\>

Client

### parameters

`GetRegisterPriceParameters`

GetRegisterPriceParameters

## Returns

`Promise`\<`GetRegisterPriceReturnType`\>

Price data object. GetRegisterPriceReturnType
