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
import { addEnsContracts } from '@ensdomains/ensjs'
import { getPrice } from '@ensdomains/ensjs/public'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})
const result = await getPrice(client, {
  nameOrNames: 'ens.eth',
  duration: 31536000,
})
// { base: 352828971668930335n, premium: 0n }
```

## Parameters

| Parameter    | Type                 | Description        |
| :----------- | :------------------- | :----------------- |
| `client`     | `ClientWithEns`      | ClientWithEns      |
| `parameters` | `GetPriceParameters` | GetPriceParameters |

## Returns

`Promise`\< `GetPriceReturnType` \>

Price data object. GetPriceReturnType

## Source

[packages/ensjs/src/functions/public/getPrice.ts:142](https://github.com/ensdomains/ensjs-v3/blob/1b90b888/packages/ensjs/src/functions/public/getPrice.ts#L142)

> **getPrice**(`client`, ...`args`): `Promise`\< `null` \| `GetPriceReturnType` \>

Gets the price of a name, or array of names, for a given duration.

## Example

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { getPrice } from '@ensdomains/ensjs/public'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})
const result = await getPrice(client, {
  nameOrNames: 'ens.eth',
  duration: 31536000,
})
// { base: 352828971668930335n, premium: 0n }
```

## Parameters

| Parameter | Type                   | Description   |
| :-------- | :--------------------- | :------------ |
| `client`  | `ClientWithEns`        | ClientWithEns |
| ...`args` | [`GetPriceParameters`] | -             |

## Returns

`Promise`\< `null` \| `GetPriceReturnType` \>

Price data object. GetPriceReturnType

## Source

[packages/ensjs/src/utils/generateFunction.ts:41](https://github.com/ensdomains/ensjs-v3/blob/1b90b888/packages/ensjs/src/utils/generateFunction.ts#L41)

---

Generated using [TypeDoc](https://typedoc.org/) and [typedoc-plugin-markdown](https://www.npmjs.com/package/typedoc-plugin-markdown)
