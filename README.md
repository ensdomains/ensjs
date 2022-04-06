# ![ENSjs](https://user-images.githubusercontent.com/11844316/161689061-98ea01ee-b119-40ac-a512-5370eb8b4107.svg)

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

**NOTE:**  
The profile function will always request an ETH addr record.
For names, this means the address will always at the top level of the returned object.
For addresses, this means the "match" property (a boolean value for matching reverse/forward resolution) will always be at the top level of the returned object.

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

## Ownership Levels

The `getOwner` function returns not only an owner (and potentially a registrant), but also a ownershipLevel value.
This value essentially means the contract for the "real owner" of any given name. In most cases it means the NFT contract
of the name, but if there is no NFT then it's just the registry. This value is useful for input into the `transferName`
function, where a contract needs to be specified.

## Wrapping Names

Wrapping names is very simple, you can wrap any name from the same function, with the exact contract to use being inferred.
You can specify both the fuses and resolver address to use with the wrapped name, but it's entirely optional.

```js
/* wrap a .eth name */
const tx = await ENSInstance.wrapName(
  'test.eth', // Name to wrap
  '0xeefB13C7D42eFCc655E528dA6d6F7bBcf9A2251d', // New owner of wrapped name
)

/* wrap any other name (e.g. a subname) */
const tx = await ENSInstance.wrapName(
  'sub.test.eth',
  '0xeefB13C7D42eFCc655E528dA6d6F7bBcf9A2251d',
)
```

## Write Transaction Options

Currently, some write functions have an `options` argument. While this may expand over time,
it currently just allows you to pass an address or index for an account array to ethers for specifying the signer of the transaction.

## Internal Structure

### Raw Functions

Raw functions are a crucial part of how ENSjs works. In the function file itself
a `raw` and `decode` function both need to be defined, with the export being an object with those properties.
This allows for the encoding and decoding of contract calls to be split, meaning that multiple calls can be batched together.
For calling a raw function by itself, the raw and decode functions are stitched together with a provider call. This is done
using `importGenerator` which is explained below.

### importGenerator

The importGenerator function generates a wrapped function for any given input.
The result of the wrapped function obfuscates the processing that ENSjs does, and exposes a cleaner API to the user/developer.
The reason we do this is to:

1. Pass through all the required variables for the function
2. Split individual functions from the main class
3. Dynamically load functions and their dependencies
4. Allow each function's dependencies to be imported regularly
5. Remove duplicate code
6. Make it easier to isolate errors
7. Stitch `raw` and `decode` functions together

### ContractManager

The contract manager is where all the contracts are dynamically loaded in and resolved based on the network.
A new instance of ContractManager is created every time you switch providers.

### GqlManager

The GQL manager is used as to separate the reliance of ENSjs from GQL.
It only loads in GQL when it is needed, or not at all if specified in the constructor of the ENS class.
Very simply, it just exposes the core functions needed for ENSjs which can then be accessed.

### initialProvider

The `initialProvider`, and similarly `checkInitialProvider` are used when creating single-use class instances with `withProvider`.
It allows `withProvider` to act as a new ENS instance without having to await a promise, which simplifies the API.
`checkInitialProvider` is run on every function call given that it's extremely lightweight.
