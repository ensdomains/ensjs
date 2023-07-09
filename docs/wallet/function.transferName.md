[**@ensdomains/ensjs**](../README.md)

---

> [wallet](README.md) > transferName

# Function: transferName()

> **transferName**\<`TChain`, `TAccount`, `TChainOverride`\>(`wallet`, `parameters`): `Promise`\< `TransferNameReturnType` \>

Transfers a name to a new owner.

## Example

```ts
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts, transferName } from '@ensdomains/ensjs'

const wallet = createWalletClient({
  chain: addEnsContracts(mainnet),
  transport: custom(window.ethereum),
})
const hash = await transferName(wallet, {
  name: 'ens.eth',
  newOwnerAddress: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7',
  contract: 'registry',
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

| Parameter    | Type                                                                 | Description            |
| :----------- | :------------------------------------------------------------------- | :--------------------- |
| `wallet`     | `object`                                                             | WalletWithEns          |
| `parameters` | `TransferNameParameters`\< `TChain`, `TAccount`, `TChainOverride` \> | TransferNameParameters |

## Returns

`Promise`\< `TransferNameReturnType` \>

Transaction hash. TransferNameReturnType

## Source

[packages/ensjs/src/functions/wallet/transferName.ts:225](https://github.com/ensdomains/ensjs-v3/blob/278f5349/packages/ensjs/src/functions/wallet/transferName.ts#L225)

---

Generated using [TypeDoc](https://typedoc.org/) and [typedoc-plugin-markdown](https://www.npmjs.com/package/typedoc-plugin-markdown)
