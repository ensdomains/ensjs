[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [public](../api.md) / resolveNameData

# Function: resolveNameData()

> **resolveNameData**\<`chain`, `data`\>(`client`, `parameters`): `Promise`\<`ResolveNameDataReturnType`\<`data`\>\>

Defined in: packages/ensjs/src/actions/public/resolver/resolveNameData.ts:61

**`Internal`**

Resolves name and data with the universal resolver.

## Type Parameters

### chain

`chain` *extends* `Chain`

### data

`data` *extends* `` `0x${string}` `` \| `` `0x${string}` ``[]

## Parameters

### client

[`RequireClientContracts`](../../chain/type-aliases/RequireClientContracts.md)\<`chain`, `"ensUniversalResolver"`\>

Client

### parameters

`ResolveNameDataParameters`\<`data`\>

ResolveParameters

## Returns

`Promise`\<`ResolveNameDataReturnType`\<`data`\>\>

ResolveReturnType
