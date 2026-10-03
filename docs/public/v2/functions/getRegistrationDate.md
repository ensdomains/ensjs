[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [public/v2](../api.md) / getRegistrationDate

# Function: getRegistrationDate()

> **getRegistrationDate**\<`chain`\>(`client`, `__namedParameters`): `Promise`\<`GetRegistrationDateReturnType`\>

Defined in: packages/ensjs/src/actions/public/v2/registry/getRegistrationDate.ts:49

Get a block timestamp of when a name was registered on the V2 registry

## Type Parameters

### chain

`chain` *extends* `Chain`

## Parameters

### client

[`RequireClientContracts`](../../../chain/type-aliases/RequireClientContracts.md)\<`chain`, `"ensRegistry"`\>

### \_\_namedParameters

`GetRegistrationDateParameters`

## Returns

`Promise`\<`GetRegistrationDateReturnType`\>

registration timestamp or null
