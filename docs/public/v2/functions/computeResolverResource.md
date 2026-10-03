[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [public/v2](../api.md) / computeResolverResource

# Function: computeResolverResource()

> **computeResolverResource**(`scope`): `bigint`

Defined in: packages/ensjs/src/utils/v2/roles/resolverResource.ts:59

Compute the EAC resource for a setter argument. Mirrors
`PermissionedResolverLib.resource(uint256 | string | bytes4)`:
`keccak256(abi.encodePacked(argument))`, i.e. the 32-byte word for a coin
type or content type, the raw bytes of a key, the 4 bytes of an interface id.

## Parameters

### scope

`ResolverSetterScope`

The setter argument.

## Returns

`bigint`

The resource ID as a bigint.
