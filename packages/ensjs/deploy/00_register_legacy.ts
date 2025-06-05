/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-await-in-loop */
import cbor from 'cbor'
import type { DeployFunction } from 'hardhat-deploy/dist/types.js'
import pako from 'pako'
import { type Address, namehash, toBytes, stringToBytes, bytesToHex } from 'viem';
import { makeNameGenerator } from '../utils/legacyNameGenerator.js'

const dummyABI = [
  {
    type: 'event',
    anonymous: false,
    name: 'ABIChanged',
    inputs: [
      {
        type: 'bytes32',
        indexed: true,
      },
      {
        type: 'uint256',
        indexed: true,
      },
    ],
  },
  {
    type: 'event',
    anonymous: false,
    name: 'VersionChanged',
    inputs: [
      {
        type: 'bytes32',
        indexed: true,
      },
      {
        type: 'uint64',
      },
    ],
  },
  {
    type: 'function',
    name: 'ABI',
    constant: true,
    stateMutability: 'view',
    payable: false,
    inputs: [
      {
        type: 'bytes32',
      },
      {
        type: 'uint256',
      },
    ],
    outputs: [
      {
        type: 'uint256',
      },
      {
        type: 'bytes',
      },
    ],
  },
  {
    type: 'function',
    name: 'clearRecords',
    constant: false,
    payable: false,
    inputs: [
      {
        type: 'bytes32',
      },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'recordVersions',
    constant: true,
    stateMutability: 'view',
    payable: false,
    inputs: [
      {
        type: 'bytes32',
      },
    ],
    outputs: [
      {
        type: 'uint64',
      },
    ],
  },
  {
    type: 'function',
    name: 'setABI',
    constant: false,
    payable: false,
    inputs: [
      {
        type: 'bytes32',
      },
      {
        type: 'uint256',
      },
      {
        type: 'bytes',
      },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'supportsInterface',
    constant: true,
    stateMutability: 'view',
    payable: false,
    inputs: [
      {
        type: 'bytes4',
      },
    ],
    outputs: [
      {
        type: 'bool',
      },
    ],
  },
]

const names: {
  label: string
  namedOwner: string
  namedAddr: string
  records?: {
    text?: {
      key: string
      value: string
    }[]
    addr?: {
      key: number
      value: string
    }[]
    contenthash?: string
    abi?:
      | {
          contentType: 1 | 2 | 4 | 8 | 256
          data: object | string
        }
      | {
          contentType: 1 | 2 | 4 | 8 | 256
          data: string
        }[]
  }
  duration?: number
  subnames?: Subname[]
}[] = [
  {
    label: 'test123',
    namedOwner: 'owner',
    namedAddr: 'owner',
  },
  {
    label: 'to-be-wrapped',
    namedOwner: 'owner',
    namedAddr: 'owner',
  },
  {
    label: 'resume-and-wrap',
    namedOwner: 'owner',
    namedAddr: 'owner',
  },
  {
    label: 'other-registrant',
    namedOwner: 'deployer',
    namedAddr: 'deployer',
  },
  {
    label: 'other-eth-record',
    namedOwner: 'owner',
    namedAddr: 'deployer',
  },
  {
    label: 'from-settings',
    namedOwner: 'owner',
    namedAddr: 'owner',
  },
  {
    label: 'with-legacy-resolver',
    namedOwner: 'owner',
    namedAddr: 'owner',
  },
  {
    label: 'with-oldest-resolver',
    namedOwner: 'owner',
    namedAddr: 'owner',
  },
  {
    label: 'with-profile',
    namedOwner: 'owner2',
    namedAddr: 'owner2',
    records: {
      text: [
        { key: 'description', value: 'Hello2' },
        { key: 'url', value: 'twitter.com' },
        { key: 'blankrecord', value: '' },
        { key: 'email', value: 'fakeemail@fake.com' },
      ],
      addr: [
        { key: 61, value: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC' },
        { key: 0, value: '0x00149010587f8364b964fcaa70687216b53bd2cbd798' },
        { key: 2, value: '0x0000000000000000000000000000000000000000' },
      ],
    },
  },
  {
    label: 'with-empty-addr',
    namedOwner: 'owner2',
    namedAddr: 'owner2',
    records: {
      addr: [{ key: 61, value: '0x' }],
    },
  },
  {
    label: 'with-contenthash',
    namedOwner: 'owner',
    namedAddr: 'owner',
    records: {
      contenthash:
        '0xe301017012204edd2984eeaf3ddf50bac238ec95c5713fb40b5e428b508fdbe55d3b9f155ffe',
    },
  },
  {
    label: 'to-be-renewed',
    namedOwner: 'owner',
    namedAddr: 'owner',
  },
  {
    label: 'with-subnames',
    namedOwner: 'owner',
    namedAddr: 'owner',
    subnames: [
      { label: 'test', namedOwner: 'owner2' },
      { label: 'legacy', namedOwner: 'owner2' },
      { label: 'xyz', namedOwner: 'owner2' },
      { label: 'addr', namedOwner: 'owner2' },
    ],
  },
  {
    label: 'with-unknown-subnames',
    namedOwner: 'owner',
    namedAddr: 'owner',
    subnames: [
      { label: 'abc123', namedOwner: 'owner2' },
      { label: 'not-known', namedOwner: 'owner2' },
    ],
  },
  {
    label: 'aaa123',
    namedOwner: 'owner',
    namedAddr: 'owner',
  },
  {
    label: 'with-type-1-abi',
    namedOwner: 'owner',
    namedAddr: 'owner',
    records: {
      abi: {
        contentType: 1,
        data: dummyABI,
      },
    },
  },
  {
    label: 'with-type-2-abi',
    namedOwner: 'owner',
    namedAddr: 'owner',
    records: {
      abi: {
        contentType: 2,
        data: dummyABI,
      },
    },
  },
  {
    label: 'with-type-4-abi',
    namedOwner: 'owner',
    namedAddr: 'owner',
    records: {
      abi: {
        contentType: 4,
        data: dummyABI,
      },
    },
  },
  {
    label: 'with-type-8-abi',
    namedOwner: 'owner',
    namedAddr: 'owner',
    records: {
      abi: {
        contentType: 8,
        data: 'https://example.com',
      },
    },
  },
  {
    label: 'with-type-256-abi',
    namedOwner: 'owner',
    namedAddr: 'owner',
    records: {
      abi: {
        contentType: 256,
        data: dummyABI,
      },
    },
  },
  {
    label: 'with-type-all-abi',
    namedOwner: 'owner',
    namedAddr: 'owner',
    records: {
      abi: [
        {
          contentType: 1,
          data: dummyABI,
        },
        {
          contentType: 2,
          data: dummyABI,
        },
        {
          contentType: 4,
          data: dummyABI,
        },
        {
          contentType: 8,
          data: 'https://example.com',
        },
      ],
    },
  },
  {
    label: 'expired',
    namedOwner: 'owner',
    namedAddr: 'owner',
    duration: 2419200,
  },
  {
    label: 'deletable',
    namedOwner: 'owner',
    namedAddr: 'owner',
    subnames: [
      { label: 'xyz', namedOwner: 'owner2' },
      { label: 'test', namedOwner: 'owner' },
      { label: 'unwrapped-deleted', namedOwner: 'owner' },
      { label: 'wrapped-deleted', namedOwner: 'owner' },
    ],
  },
  ...Array.from({ length: 34 }, (_, i) => ({
    label: `${i}-dummy`,
    namedOwner: 'owner2',
    namedAddr: 'owner2',
  })),
  ...Array.from({ length: 2 }, (_, i) => ({
    label: `nonconcurrent-legacy-name-${i}`,
    namedOwner: 'owner4',
    namedAddr: 'owner4',
    duration: 31536000 / 2,
    subnames: [
      {
        label: 'test',
        namedOwner: 'owner4',
      },
      {
        label: 'xyz',
        namedOwner: 'owner4',
      },
    ],
  })),
]

const func: DeployFunction = async (hre) => {
  const { getNamedAccounts, network, viem } = hre
  const allNamedAccts = await getNamedAccounts()

  const publicResolver = await viem.getContract('LegacyPublicResolver')

  await network.provider.send('anvil_setBlockTimestampInterval', [60])

  const nameGenerator = await makeNameGenerator(hre)

  for (const {
    label,
    namedOwner,
    namedAddr,
    records,
    subnames,
    duration = 31536000,
  } of names) {
    const registrant = allNamedAccts[namedOwner] as Address
    const commitTx = await nameGenerator.commit({
      label,
      namedOwner,
      namedAddr,
    })

    console.log(
      `Committing commitment for ${label}.eth (tx: ${commitTx})...`,
    )
    await viem.waitForTransactionSuccess(commitTx)

    await network.provider.send('evm_mine')

    const registerTx = await nameGenerator.register({
      label,
      namedOwner,
      namedAddr,
      duration,
    })
    console.log(`Registering name ${label}.eth (tx: ${registerTx})...`)

    await viem.waitForTransactionSuccess(registerTx)

    if (records) {
      // const _publicResolver = publicResolver.connect(
      //   await viem.getWalletClient(registrant),
      // )

      const hash = namehash(`${label}.eth`)
      console.log(`Setting records for ${label}.eth...`)
      if (records.text) {
        console.log('TEXT')
        for (const { key, value } of records.text) {
          const setTextTx = await publicResolver.write.setText([hash, key, value], { account: registrant })
          console.log(` - ${key} ${value} (tx: ${setTextTx})...`)
          await viem.waitForTransactionSuccess(setTextTx)
        }
      }
      if (records.addr) {
        console.log('ADDR')
        for (const { key, value } of records.addr) {
          const setAddrTx = await publicResolver.write.setAddr([hash, key, value], { account: registrant })
          console.log(` - ${key} ${value} (tx: ${setAddrTx})...`)
          await viem.waitForTransactionSuccess(setAddrTx)
        }
      }
      if (records.contenthash) {
        console.log('CONTENTHASH')
        const setContenthashTx = await publicResolver.write.setContenthash([hash, records.contenthash], { account: registrant })
        console.log(` - ${records.contenthash} (tx: ${setContenthashTx})...`)
        await viem.waitForTransactionSuccess(setContenthashTx)
      }
      if (records.abi) {
        const abis = Array.isArray(records.abi) ? records.abi : [records.abi]
        for (const abi of abis) {
          /**
           * @type {string | Buffer | Uint8Array}
           */
          let data: string | Buffer | Uint8Array
          if (abi.contentType === 1 || abi.contentType === 256) {
            data = stringToBytes(JSON.stringify(abi.data))
          } else if (abi.contentType === 2) {
            data = pako.deflate(JSON.stringify(abi.data))
          } else if (abi.contentType === 4) {
            data = cbor.encode(abi.data)
          } else {
            data = stringToBytes(abi.data)
          }
          const setABITx = await publicResolver.write.setABI([hash, abi.contentType, bytesToHex(data)], { account: registrant })
          console.log(` - ${abi.contentType} (tx: ${setABITx})...`)
          await viem.waitForTransactionSuccess(setABITx)
        }
      }
    }

    if (subnames) {
      console.log(`Setting subnames for ${label}.eth...`)
      for (const {
        label: subnameLabel,
        namedOwner: namedSubnameOwner,
      } of subnames) {
        const setSubnameTx = await nameGenerator.subname({
          label,
          namedOwner,
          subnameLabel,
          namedSubnameOwner,
        })
        console.log(` - ${subnameLabel} (tx: ${setSubnameTx})...`)
        await viem.waitForTransactionSuccess(setSubnameTx)
      }
    }
  }

  await network.provider.send('anvil_setBlockTimestampInterval', [1])

  return true
}

func.id = 'register-unwrapped-names'
func.tags = ['register-unwrapped-names']
func.dependencies = ['LegacyETHRegistrarController']
func.runAtTheEnd = true

export default func
