[**@ensdomains/ensjs**](../README.md)

---

> [public](README.md) > getExpiry

# Function: getExpiry()

> **getExpiry**(`client`, `parameters`): `Promise`\< `GetExpiryReturnType` \>

Gets the expiry for a name

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { getExpiry } from '@ensdomains/ensjs/public'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})
const result = await getExpiry(client, { name: 'ens.eth' })
// { expiry: { date: Date, value: 1913933217n }, gracePeriod: 7776000, status: 'active' }
```

## Parameters

| Parameter              | Type             | Description                                     |
| :--------------------- | :--------------- | :---------------------------------------------- |
| `client`               | `ClientWithEns`  | ClientWithEns                                   |
| `parameters`           | `object`         | GetExpiryParameters                             |
| `parameters.contract`? | `ContractOption` | Optional specific contract to use to get expiry |
| `parameters.name`      | `string`         | Name to get expiry for                          |

## Returns

`Promise`\< `GetExpiryReturnType` \>

Expiry object, or `null` if no expiry. GetExpiryReturnType

## Source

[packages/ensjs/src/functions/public/getExpiry.ts:194](https://github.com/ensdomains/ensjs-v3/blob/62fd2c82/packages/ensjs/src/functions/public/getExpiry.ts#L194)

---

Generated using [TypeDoc](https://typedoc.org/) and [typedoc-plugin-markdown](https://www.npmjs.com/package/typedoc-plugin-markdown)
