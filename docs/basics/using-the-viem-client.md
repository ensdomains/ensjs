# Using the Viem Client

ENSjs actions are plain functions that take a viem `Client` as their first argument. Wrap the viem `Chain` in
`addEnsContracts()` to add the ENS contract addresses and subgraph URL, then pass the client to any action.

```ts
import { http, createPublicClient } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { getAddressRecord } from '@ensdomains/ensjs/public'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})

const ethAddress = await getAddressRecord(client, { name: 'ens.eth' })
```

Write actions work the same way with a wallet client that has an `account`:

```ts
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { setTextRecord } from '@ensdomains/ensjs/wallet'

const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
const wallet = createWalletClient({
  account,
  chain: addEnsContracts(mainnet),
  transport: custom(window.ethereum),
})

const hash = await setTextRecord(wallet, {
  name: 'ens.eth',
  key: 'com.twitter',
  value: 'ensdomains',
  resolverAddress: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
})
```
