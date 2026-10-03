[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [wallet/v2](../api.md) / setRecordsWriteParameters

# Function: setRecordsWriteParameters()

> **setRecordsWriteParameters**\<`chain`, `account`\>(`client`, `__namedParameters`): `Promise`\<`object` & `object` & `object` & `object` & `object` & `object` \| `object` & `object` & `object` & `object` & `object` & `object` \| `object` & `object` & `object` & `object` & `object` & `object` \| `object` & `object` & `object` & `object` & `object` & `object` \| `object` & `object` & `object` & `object` & `object` & `object` \| `object` & `object` & `object` & `object` & `object` & `object` \| \{ `abi`: readonly \[\{ `inputs`: readonly \[\{ `name`: `"data"`; `type`: `"bytes[]"`; \}\]; `name`: `"multicall"`; `outputs`: readonly \[\{ `name`: `"results"`; `type`: `"bytes[]"`; \}\]; `stateMutability`: `"nonpayable"`; `type`: `"function"`; \}\]; `account`: `account`; `address`: `` `0x${string}` ``; `args`: readonly \[`` `0x${string}` ``[]\]; `chain`: `chain`; `functionName`: `"multicall"`; \}\>

Defined in: packages/ensjs/src/actions/wallet/v2/resolver/setRecords.ts:60

Builds the write parameters for setting records on a V2
`PermissionedResolver`.

A single change goes out as the bare setter; several are batched through
`multicall(bytes[])`. Unlike the v1 equivalent, no node argument is needed —
every setter already carries the DNS-encoded name.

## Type Parameters

### chain

`chain` *extends* `Chain`

### account

`account` *extends* `Account`

## Parameters

### client

`Client`\<`Transport`, `chain`, `account`\>

### \_\_namedParameters

`SetRecordsWriteParametersParameters`

## Returns

`Promise`\<`object` & `object` & `object` & `object` & `object` & `object` \| `object` & `object` & `object` & `object` & `object` & `object` \| `object` & `object` & `object` & `object` & `object` & `object` \| `object` & `object` & `object` & `object` & `object` & `object` \| `object` & `object` & `object` & `object` & `object` & `object` \| `object` & `object` & `object` & `object` & `object` & `object` \| \{ `abi`: readonly \[\{ `inputs`: readonly \[\{ `name`: `"data"`; `type`: `"bytes[]"`; \}\]; `name`: `"multicall"`; `outputs`: readonly \[\{ `name`: `"results"`; `type`: `"bytes[]"`; \}\]; `stateMutability`: `"nonpayable"`; `type`: `"function"`; \}\]; `account`: `account`; `address`: `` `0x${string}` ``; `args`: readonly \[`` `0x${string}` ``[]\]; `chain`: `chain`; `functionName`: `"multicall"`; \}\>
