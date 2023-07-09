# Batching Calls

Batching is built-in to viem for most situations, but ENSjs also has native batching if you want to be sure that calls are batched.
Only public methods support call batching at this point. On the `EnsPublicClient`, batching can be accessed via `ensBatch` to avoid
colliding with viem's native batching. If using batch outside of the client though, it can be accessed with `batch`.

## Using `EnsPublicClient`

```ts
import { http } from 'viem'
import { mainnet } from 'viem/chains'
import { createEnsPublicClient } from '@ensdomains/ensjs'
import { getAddressRecord, getTextRecord } from '@ensdomains/ensjs/public'

const client = createEnsPublicClient({
  chain: mainnet,
  transport: http(),
})

const [ethAddress, twitterUsername] = client.ensBatch(
  getAddressRecord.batch({ name: 'ens.eth' }),
  getTextRecord.batch({ name: 'ens.eth', key: 'com.twitter' }),
)
/* 
  [
    {
      id: 60,
      name: 'ETH',
      value: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7'
    },
    'ensdomains'
  ]
*/
```

## Using Viem Client

```ts
import { http, createClient } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import {
  batch,
  getAddressRecord,
  getTextRecord,
} from '@ensdomains/ensjs/public'

const client = createClient({
  chain: addEnsContracts(mainnet),
  transport: http(),
})

const [ethAddress, twitterUsername] = batch(
  client,
  getAddressRecord.batch({ name: 'ens.eth' }),
  getTextRecord.batch({ name: 'ens.eth', key: 'com.twitter' }),
)
/* 
  [
    {
      id: 60,
      name: 'ETH',
      value: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7'
    },
    'ensdomains'
  ]
*/
```
