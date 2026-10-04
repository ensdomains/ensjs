[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [subgraph](../api.md) / getResolvedNamesForAddress

# Function: getResolvedNamesForAddress()

> **getResolvedNamesForAddress**(`client`, `parameters`): `Promise`\<`object`[]\>

Defined in: packages/ensjs/src/actions/subgraph/getResolvedNamesForAddress.ts:34

Gets domains from the subgraph that resolve to a given address.

## Parameters

### client

ClientWithEns

#### chain

`ChainWithSubgraph`

### parameters

`GetResolvedNamesForAddressParameters`

GetNamesResolvedToAddressParameters

## Returns

`Promise`\<`object`[]\>

Name array. GetNamesResolvedToAddressReturnType

## Example

```ts
const result = await getResolvedNamesForAddress(client, { address: '0xD3B282e9880cDcB1142830731cD83f7ac0e1043f' })
```
