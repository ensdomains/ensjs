[**@ensdomains/ensjs**](../../api.md)

***

[@ensdomains/ensjs](../../api.md) / [dns](../api.md) / getDnsOwner

# Function: getDnsOwner()

> **getDnsOwner**(`parameters`): `Promise`\<`GetDnsOwnerReturnType`\>

Defined in: packages/ensjs/src/actions/dns/getDnsOwner.ts:46

Gets the DNS owner of a name, via DNS record lookup

## Parameters

### parameters

`GetDnsOwnerParameters`

GetDnsOwnerParameters

## Returns

`Promise`\<`GetDnsOwnerReturnType`\>

Address of DNS owner. GetDnsOwnerReturnType

## Example

```ts
import { getDnsOwner } from '@ensdomains/ensjs/dns'

const owner = await getDnsOwner({ name: 'ens.domains' })
// '0xb8c2C29ee19D8307cb7255e1Cd9CbDE883A267d5'
```
