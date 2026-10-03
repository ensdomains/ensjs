# Extending the Viem Client

ENSjs doesn't ship client decorators: every action is a standalone function, so you only bundle what you import.
If you'd rather call actions as methods on the client, add the ones you need with viem's `extend`.

```ts
import { http, createPublicClient } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsL1Contracts } from '@ensdomains/ensjs'
import {
  type GetAddressRecordParameters,
  type GetTextRecordParameters,
  getAddressRecord,
  getTextRecord,
} from '@ensdomains/ensjs/public'

const client = createPublicClient({
  chain: addEnsL1Contracts(mainnet),
  transport: http(),
}).extend((client) => ({
  getAddressRecord: (parameters: GetAddressRecordParameters) =>
    getAddressRecord(client, parameters),
  getTextRecord: (parameters: GetTextRecordParameters) =>
    getTextRecord(client, parameters),
}))

const ethAddress = await client.getAddressRecord({ name: 'ens.eth' })
```
