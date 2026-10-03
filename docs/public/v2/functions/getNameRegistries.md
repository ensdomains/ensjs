[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [public/v2](../api.md) / getNameRegistries

# Function: getNameRegistries()

> **getNameRegistries**\<`chain`\>(`client`, `parameters`): `Promise`\<`GetNameRegistriesReturnType`\>

Defined in: packages/ensjs/src/actions/public/v2/universalResolver/getNameRegistries.ts:37

Find all registries in the ancestry of `name`.

## Type Parameters

### chain

`chain` *extends* `Chain`

## Parameters

### client

[`RequireClientContracts`](../../../chain/type-aliases/RequireClientContracts.md)\<`chain`, `"ensUniversalHelper"`\>

Client

### parameters

`GetNameRegistriesParameters`

GetNameRegistriesParameters

## Returns

`Promise`\<`GetNameRegistriesReturnType`\>

Array of registry addresses. GetNameRegistriesReturnType
