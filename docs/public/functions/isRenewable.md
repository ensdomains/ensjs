[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [public](../api.md) / isRenewable

# Function: isRenewable()

> **isRenewable**(`client`, `parameters`): `Promise`\<`boolean`\>

Defined in: packages/ensjs/src/actions/public/registrar/isRenewable.ts:50

Whether the renewer will renew a label right now, via its on-chain
`isRenewable(label)`.

Useful for the `ETHRenewerV1`, which only renews RESERVED (pre-migration) or
in-grace names — an active, not-yet-migrated v1 name returns `false` (and
`getRenewPrice`/`renew` would revert `NameNotRenewable`). For the v2
`ETHRegistrar` it reflects the name's registered/grace status.

## Parameters

### client

`Client`

Client

### parameters

`IsRenewableParameters`

IsRenewableParameters

## Returns

`Promise`\<`boolean`\>

`true` if the label is currently renewable. IsRenewableReturnType

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { isRenewable } from '@ensdomains/ensjs/public'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})
const renewable = await isRenewable(client, {
  renewerAddress: '0x...',
  label: 'example',
})
```
