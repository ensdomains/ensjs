[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [public/v2](../api.md) / getOwner

# Function: getOwner()

> **getOwner**\<`chain`\>(`client`, `parameters`): `Promise`\<`` `0x${string}` ``\>

Defined in: packages/ensjs/src/actions/public/v2/universalResolver/getOwner.ts:40

Find the owner for a V2 name of any depth.

Reads `findExactOwner` on the UniversalHelper: the owner of exactly this
name. Its sibling `findNearestOwner` walks up to the closest owned ancestor
instead, which would report every unregistered name as owned.

## Type Parameters

### chain

`chain` *extends* `Chain`

## Parameters

### client

[`RequireClientContracts`](../../../chain/type-aliases/RequireClientContracts.md)\<`chain`, `"ensUniversalHelper"`\>

Client

### parameters

`GetOwnerParameters`

GetOwnerParameters

## Returns

`Promise`\<`` `0x${string}` ``\>

The owner address, or the zero address if unowned or not found. GetOwnerReturnType
