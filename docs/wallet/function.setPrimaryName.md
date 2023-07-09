[**@ensdomains/ensjs**](../README.md)

---

> [wallet](README.md) > setPrimaryName

# Function: setPrimaryName()

> **setPrimaryName**\<`TChain`, `TAccount`, `TChainOverride`\>(`wallet`, `parameters`): `Promise`\< `SetPrimaryNameReturnType` \>

Sets a primary name for an address.

## Example

```ts
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts, setPrimaryName } from '@ensdomains/ensjs'

const wallet = createWalletClient({
  chain: addEnsContracts(mainnet),
  transport: custom(window.ethereum),
})
const hash = await setPrimaryName(wallet, {
  name: 'ens.eth',
})
// 0x...
```

## Type parameters

| Parameter                                                | Default        |
| :------------------------------------------------------- | :------------- |
| `TChain` _extends_ `ChainWithEns`                        | -              |
| `TAccount` _extends_ `undefined` \| `Account`            | -              |
| `TChainOverride` _extends_ `undefined` \| `ChainWithEns` | `ChainWithEns` |

## Parameters

| Parameter    | Type                                                                   | Description              |
| :----------- | :--------------------------------------------------------------------- | :----------------------- |
| `wallet`     | `object`                                                               | WalletWithEns            |
| `parameters` | `SetPrimaryNameParameters`\< `TChain`, `TAccount`, `TChainOverride` \> | SetPrimaryNameParameters |

## Returns

`Promise`\< `SetPrimaryNameReturnType` \>

Transaction hash. SetPrimaryNameReturnType

## Source

[packages/ensjs/src/functions/wallet/setPrimaryName.ts:125](https://github.com/ensdomains/ensjs-v3/blob/278f5349/packages/ensjs/src/functions/wallet/setPrimaryName.ts#L125)

---

Generated using [TypeDoc](https://typedoc.org/) and [typedoc-plugin-markdown](https://www.npmjs.com/package/typedoc-plugin-markdown)
