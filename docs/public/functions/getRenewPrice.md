[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [public](../api.md) / getRenewPrice

# Function: getRenewPrice()

> **getRenewPrice**(`client`, `parameters`): `Promise`\<`GetRenewPriceReturnType`\>

Defined in: packages/ensjs/src/actions/public/registrar/getRenewPrice.ts:58

Gets the renewal price of a label for a given duration.

Internally calls `getRenewPrice(label, duration, paymentToken)` on a contract implementing
`IETHRenewer` — either `ETHRegistrar` or `ETHRenewerV1`. The renewer fetches the current
`expiry` and forwards it to the rent price oracle; the returned amount is the total
cost (no separate premium for renewals).

## Parameters

### client

`Client`

Client

### parameters

`GetRenewPriceParameters`

GetRenewPriceParameters

## Returns

`Promise`\<`GetRenewPriceReturnType`\>

Renewal price in `paymentToken` units. GetRenewPriceReturnType

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { getRenewPrice } from '@ensdomains/ensjs/public'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})
const price = await getRenewPrice(client, {
  renewerAddress: '0x...',
  label: 'example',
  duration: 31536000n,
  paymentToken: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
})
```
