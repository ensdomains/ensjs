[**@ensdomains/ensjs**](../README.md)

---

> [dns](README.md) > getDnsOwner

# Function: getDnsOwner()

> **getDnsOwner**(`parameters`): `Promise`\< \`0x$\{string}\` \>

Gets the DNS owner of a name, via DNS record lookup

## Example

```ts
import { getDnsOwner } from '@ensdomains/ensjs/dns'

const owner = await getDnsOwner({ name: 'ens.domains' })
// '0xb8c2C29ee19D8307cb7255e1Cd9CbDE883A267d5'
```

## Parameters

| Parameter    | Type                    | Description           |
| :----------- | :---------------------- | :-------------------- |
| `parameters` | `GetDnsOwnerParameters` | GetDnsOwnerParameters |

## Returns

`Promise`\< \`0x$\{string}\` \>

Address of DNS owner. GetDnsOwnerReturnType

## Source

[packages/ensjs/src/functions/dns/getDnsOwner.ts:90](https://github.com/ensdomains/ensjs/blob/1b90b888/packages/ensjs/src/functions/dns/getDnsOwner.ts#L90)

---

Generated using [TypeDoc](https://typedoc.org/) and [typedoc-plugin-markdown](https://www.npmjs.com/package/typedoc-plugin-markdown)
