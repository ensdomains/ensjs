[**@ensdomains/ensjs**](../README.md)

---

> [public](README.md) > getPrice

# Function: getPrice()

> **getPrice**(`client`, `parameters`): `Promise`\< `GetPriceReturnType` \>

Gets the price of a name, or array of names, for a given duration.

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts, getPrice } from '@ensdomains/ensjs'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})
const result = await getPrice(client, { nameOrNames: 'ens.eth' })
// { base: 352828971668930335n, premium: 0n }
```

## Parameters

| Parameter    | Type                 | Description        |
| :----------- | :------------------- | :----------------- |
| `client`     | `Object`             | ClientWithEns      |
| `parameters` | `GetPriceParameters` | GetPriceParameters |

## Returns

`Promise`\< `GetPriceReturnType` \>

Price data object. GetPriceReturnType

## Source

[packages/ensjs/src/functions/public/getPrice.ts:135](https://github.com/ensdomains/ensjs-v3/blob/278f5349/packages/ensjs/src/functions/public/getPrice.ts#L135)

> **getPrice**(`client`, ...`args`): `Promise`\< `null` \| `GetPriceReturnType` \>

Gets the price of a name, or array of names, for a given duration.

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts, getPrice } from '@ensdomains/ensjs'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})
const result = await getPrice(client, { nameOrNames: 'ens.eth' })
// { base: 352828971668930335n, premium: 0n }
```

## Parameters

| Parameter | Type                   | Description   |
| :-------- | :--------------------- | :------------ |
| `client`  | `Object`               | ClientWithEns |
| ...`args` | [`GetPriceParameters`] | -             |

## Returns

`Promise`\< `null` \| `GetPriceReturnType` \>

Price data object. GetPriceReturnType

## Source

[packages/ensjs/src/utils/generateFunction.ts:40](https://github.com/ensdomains/ensjs-v3/blob/278f5349/packages/ensjs/src/utils/generateFunction.ts#L40)

---

Generated using [TypeDoc](https://typedoc.org/) and [typedoc-plugin-markdown](https://www.npmjs.com/package/typedoc-plugin-markdown)
