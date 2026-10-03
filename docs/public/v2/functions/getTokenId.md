[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [public/v2](../api.md) / getTokenId

# Function: getTokenId()

> **getTokenId**\<`chain`\>(`client`, `parameters`): `Promise`\<`bigint`\>

Defined in: packages/ensjs/src/actions/public/v2/registry/getTokenId.ts:28

Gets the ERC1155 token ID for a name in a V2 registry.

## Type Parameters

### chain

`chain` *extends* `Chain`

## Parameters

### client

[`RequireClientContracts`](../../../chain/type-aliases/RequireClientContracts.md)\<`chain`, `"ensRegistry"`\>

ClientWithEns

### parameters

`GetTokenIdParameters`

GetTokenIdParameters

## Returns

`Promise`\<`bigint`\>

The token ID as a bigint. GetTokenIdReturnType
