[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [public/v2](../api.md) / getResource

# Function: getResource()

> **getResource**\<`chain`\>(`client`, `parameters`): `Promise`\<`bigint`\>

Defined in: packages/ensjs/src/actions/public/v2/registry/getResource.ts:28

Gets the EAC resource ID for a name in a V2 registry.

## Type Parameters

### chain

`chain` *extends* `Chain`

## Parameters

### client

[`RequireClientContracts`](../../../chain/type-aliases/RequireClientContracts.md)\<`chain`, `"ensRegistry"`\>

ClientWithEns

### parameters

`GetResourceParameters`

GetResourceParameters

## Returns

`Promise`\<`bigint`\>

The resource ID as a bigint. GetResourceReturnType
