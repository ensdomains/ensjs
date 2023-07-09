[**@ensdomains/ensjs**](../README.md)

---

> [public](README.md) > getResolver

# Function: getResolver()

> **getResolver**(`client`, `parameters`): `Promise`\< `GetResolverReturnType` \>

Gets the resolver address for a name.

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts, getResolver } from '@ensdomains/ensjs'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})
const result = await getResolver(client, { name: 'ens.eth' })
// 0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41
```

## Parameters

| Parameter    | Type                    | Description           |
| :----------- | :---------------------- | :-------------------- |
| `client`     | `Object`                | ClientWithEns         |
| `parameters` | `GetResolverParameters` | GetResolverParameters |

## Returns

`Promise`\< `GetResolverReturnType` \>

Resolver address, or null if none is found. GetResolverReturnType

## Source

[packages/ensjs/src/functions/public/getResolver.ts:75](https://github.com/ensdomains/ensjs-v3/blob/278f5349/packages/ensjs/src/functions/public/getResolver.ts#L75)

---

Generated using [TypeDoc](https://typedoc.org/) and [typedoc-plugin-markdown](https://www.npmjs.com/package/typedoc-plugin-markdown)
