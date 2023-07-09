[**@ensdomains/ensjs**](../README.md)

---

> [wallet](README.md) > setFuses

# Function: setFuses()

> **setFuses**\<`TChain`, `TAccount`, `TChainOverride`\>(`wallet`, `parameters`): `Promise`\< `SetFusesReturnType` \>

Sets the fuses for a name.

## Example

```ts
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts, setFuses } from '@ensdomains/ensjs'

const wallet = createWalletClient({
  chain: addEnsContracts(mainnet),
  transport: custom(window.ethereum),
})
const hash = await setFuses(wallet, {
  name: 'sub.ens.eth',
  fuses: {
    named: ['CANNOT_TRANSFER'],
  },
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

| Parameter          | Type                                                                                                                                                                                                                                                                                             | Description           |
| :----------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------- |
| `wallet`           | `object`                                                                                                                                                                                                                                                                                         | WalletWithEns         |
| `parameters`       | `object`                                                                                                                                                                                                                                                                                         | SetFusesParameters    |
| `parameters.fuses` | `Prettify`\< `InputFuses`\< `"CANNOT_UNWRAP"` \| `"CANNOT_BURN_FUSES"` \| `"CANNOT_TRANSFER"` \| `"CANNOT_SET_RESOLVER"` \| `"CANNOT_SET_TTL"` \| `"CANNOT_CREATE_SUBDOMAIN"` \| `"CANNOT_APPROVE"`, `128` \| `256` \| `512` \| `1024` \| `2048` \| `4096` \| `8192` \| `16384` \| `32768` \> \> | Fuse object to set to |
| `parameters.name`  | `string`                                                                                                                                                                                                                                                                                         | Name to set fuses for |

## Returns

`Promise`\< `SetFusesReturnType` \>

Transaction hash. SetFusesReturnType

## Source

[packages/ensjs/src/functions/wallet/setFuses.ts:80](https://github.com/ensdomains/ensjs-v3/blob/278f5349/packages/ensjs/src/functions/wallet/setFuses.ts#L80)

---

Generated using [TypeDoc](https://typedoc.org/) and [typedoc-plugin-markdown](https://www.npmjs.com/package/typedoc-plugin-markdown)
