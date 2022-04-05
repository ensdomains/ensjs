# ![ENSjs](https://user-images.githubusercontent.com/11844316/161689061-98ea01ee-b119-40ac-a512-5370eb8b4107.svg) v3

The ultimate ENS javascript library, with [ethers.js](https://github.com/ethers-io/ethers.js) under the hood.

## NOTE!!!

ENSjs v3 is currently in the early development stage, meaning that the APIs are subject to change.
We also use undeployed contracts under the hood, so this **will not** work on any mainnet/testnet where the contracts are not deployed.

Given the current development status, we're actively seeking feedback so feel free to create an issue or PR if you notice something!

## Features

- Dynamically load **everything**
- Super fast response times (1 call for most RPC calls)
- Easy call batchability
- Written in TypeScript
- Supports the most cutting edge ENS features
- - More

## Installation

Install @ensdomains/ensjs, alongside [ethers](https://github.com/ethers-io/ethers.js).

```sh
npm install @ensdomains/ensjs ethers
```

## Getting Started

All that's needed to get started is an ethers provider instance.
Once you create a new ENS instance, you can pass it in using setProvider.

```js
import { ENS } from '@ensdomains/ensjs'
import { ethers } from 'ethers'

const provider = new ethers.providers.JsonRpcProvider(providerUrl)

const ENSInstance = new ENS()
await ENSInstance.setProvider(provider)
```

## Batching Calls

The batch function is a large part of this library, and there are plenty of situations where you might want to use it.
**Note that only functions with the `GeneratedRawFunction` type can be batched together.**
**TS will throw an error if it isn't one though, so don't worry about mixing them up.**

```js
/* Batch functions can be called like so, with the function as the first item in an array, with the following items being the function's arguments */
const batched = await batch(
  [ENSInstance.getText, 'test.eth', 'foo'],
  [ENSInstance.getAddr, 'test.eth'],
  [ENSInstance.getOwner, 'test.eth'],
)

/* The response is formatted like so:
  [
    response1,
    response2,
    response3,
    ...etc,
  ]
*/
```

## Using Custom Graph Node URIs

If you want to use your own graph-node URI, such as a local graph-node URI, you can pass it through when creating a new ENS instance.
Alternatively, if you don't want to use The Graph at all you can pass through `null`.

```js
import { ENS } from '@ensdomains/ensjs'

/* If you want to use a custom URI */
const ENSInstance = new ENS({
  graphURI: 'http://localhost:8000/subgraphs/name/graphprotocol/ens',
})

/* If you want to disable The Graph queries */
const ENSInstance = new ENS({ graphURI: null })
```

## Single-use Providers

If you want to use a specific provider to make a single call occasionally, you can easily do so.

```js
import { ENS } from '@ensdomains/ensjs'

const ENSInstance = new ENS()

const callWithProvider = await ENSInstance.withProvider(otherProvider).getText(
  'test.eth',
  'foo',
)
```

## Profiles

You can fetch almost all information about an ENS name (or address) using getProfile.
If an address is used as the first argument, it will fetch the primary name and give the same response as a name would.
It will automatically get all the records for a name, as well as get the resolver address for the name.
Specific records can also be used as an input, if you only want to get certain ones. If an address is used as an input alongside this,
you also save 1 RPC call.

```js
/* Normal profile fetching */
const profile = await ENSInstance.getProfile('test.eth')

/* Profile fetching from an address */
const profile = await ENSInstance.getProfile(
  '0xeefB13C7D42eFCc655E528dA6d6F7bBcf9A2251d',
)

/* Get all records of a specific type (or multiple) */
const profile = await ENSInstance.getProfile('test.eth', {
  texts: true,
  coinTypes: true,
  contentHash: true,
})

/* Get specific records */
const profile = await ENSInstance.getProfile('test.eth', {
  texts: ['foo'],
  coinTypes: ['ETH'],
})
```

Returns:

```typescript
type RecordItem = {
  key: string | number
  type: 'addr' | 'text' | 'contentHash'
  coin?: string
  addr?: string
  value?: string
}

type ProfileReturn = {
  address?: string // ONLY RETURNED AT TOP-LEVEL FOR NAME QUERIES
  name?: string // ONLY RETURNED AT TOP-LEVEL FOR ADDRESS QUERIES
  records: {
    contentHash?: ContentHashObject | null
    texts?: RecordItem[]
    coinTypes?: RecordItem[]
  }
  resolverAddress: string
}
```

## Name History

Getting the history for a name is very simple and can be done in two ways.
Not all data can be immediately fetched for the history of an ENS name, which is why there is multiple methods for doing so.
Text records do not contain the string value of the changed record, only the key. The value needs to be derived from fetching
the individual transaction hash. This can potentially be very slow if the name has a long history.

```js
/* Normal Fetching, requires a second function for more details */
const history = await ENSInstance.getHistory('test.eth')

/* Details helper for history */
/* You'll need to implement custom logic to get the index if you want to use that parameter, it's not currently done in the function */
const detail = await ENSInstance.getHistoryDetailForTransactionHash(
  transactionHash,
  optionalIndex,
)

/* Fetching with all details upfront */
const historyWithDetail = await ENSInstance.getHistoryWithDetail('test.eth')
```

## Internal Structure

## Wrapping Names
