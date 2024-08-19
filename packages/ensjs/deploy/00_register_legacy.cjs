/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-await-in-loop */
const cbor = require('cbor')
const { ethers } = require('hardhat')
const pako = require('pako')
const { labelhash, namehash, toBytes } = require('viem')
const { makeNameGenerator } = require('../utils/legacyNameGenerator.cjs')

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

/**
 * @typedef {{
 *  label: string
 *  namedOwner: string
 * }} Subname
 */

/**
 * @type {{
 *  label: string
 *  namedOwner: string
 *  namedAddr: string
 *  records?: {
 *    text?: {
 *      key: string
 *      value: string
 *    }[]
 *    addr?: {
 *      key: number
 *      value: string
 *    }[]
 *    contenthash?: string
 *    abi?: {
 *      contentType: 1 | 2 | 4 | 8 | 256
 *      data: object | string
 *    } | {
 *     contentType: 1 | 2 | 4 | 8 | 256
 *      data: string
 *    }[]
 *  }
 *  duration?: number
 *  subnames?: Subname[]
 * }[]}
 */
const names = [
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
]

 const makeNameGenerator2 = async (hre) => {
  const { getNamedAccounts, network } = hre
  const allNamedAccts = await getNamedAccounts()
  const controller = await ethers.getContract('LegacyETHRegistrarController')
  const publicResolver = await ethers.getContract('LegacyPublicResolver')
  const registry = await ethers.getContract('ENSRegistry')

  return {
    commit: async ({ label, namedOwner, namedAddr }) => {
      const secret =
        '0x0000000000000000000000000000000000000000000000000000000000000000'
      const registrant = allNamedAccts[namedOwner]
      const resolver = publicResolver.address
      const addr = allNamedAccts[namedAddr]

      const commitment = await controller.makeCommitmentWithConfig(
        label,
        registrant,
        secret,
        resolver,
        addr,
      )

      const _controller = controller.connect(await ethers.getSigner(registrant))
      return _controller.commit(commitment)
    },
    register: async ({ label, namedOwner, namedAddr, duration = 31536000 }) => {
      const secret =
        '0x0000000000000000000000000000000000000000000000000000000000000000'
      const registrant = allNamedAccts[namedOwner]
      const resolver = publicResolver.address
      const addr = allNamedAccts[namedAddr]
      const price = await controller.rentPrice(label, duration)
      const _controller = controller.connect(await ethers.getSigner(registrant))
      return _controller.registerWithConfig(
        label,
        registrant,
        duration,
        secret,
        resolver,
        addr,
        {
          value: price,
        },
      )
    },
    subname: async ({ label, namedOwner, subnameLabel, namedSubnameOwner }) => {
      console.log(`Setting subnames for ${label}.eth...`)
      const resolver = publicResolver.address
      const registrant = allNamedAccts[namedOwner]
      const owner = allNamedAccts[namedSubnameOwner]
      const _registry = registry.connect(await ethers.getSigner(registrant))
      return _registry.setSubnodeRecord(
        namehash(`${label}.eth`),
        labelhash(subnameLabel),
        owner,
        resolver,
        '0',
      )
    },
    setSubnameRecords: async () => {},
    configure: async () => {},
  }
}

/**
 * @type {import('hardhat-deploy/types').DeployFunction}
 */
const func = async function (hre) {
  const { getNamedAccounts, network } = hre
  const allNamedAccts = await getNamedAccounts()

  const controller = await ethers.getContract('LegacyETHRegistrarController')
  const publicResolver = await ethers.getContract('LegacyPublicResolver')

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
    const secret =
      '0x0000000000000000000000000000000000000000000000000000000000000000'
    const registrant = allNamedAccts[namedOwner]
    const resolver = publicResolver.address
    const addr = allNamedAccts[namedAddr]

    const commitTx = await nameGenerator.commit({
      label,
      namedOwner,
      namedAddr,
    })

    console.log(
      `Committing commitment for ${label}.eth (tx: ${commitTx.hash})...`,
    )
    await commitTx.wait()

    await network.provider.send('evm_mine')

    const registerTx = await nameGenerator.register({
      label,
      namedOwner,
      namedAddr,
      duration,
    })
    console.log(`Registering name ${label}.eth (tx: ${registerTx.hash})...`)

    await registerTx.wait()

    if (records) {
      const _publicResolver = publicResolver.connect(
        await ethers.getSigner(registrant),
      )

      const hash = namehash(`${label}.eth`)
      console.log(`Setting records for ${label}.eth...`)
      if (records.text) {
        console.log('TEXT')
        for (const { key, value } of records.text) {
          const setTextTx = await _publicResolver.setText(hash, key, value)
          console.log(` - ${key} ${value} (tx: ${setTextTx.hash})...`)
          await setTextTx.wait()
        }
      }
      if (records.addr) {
        console.log('ADDR')
        for (const { key, value } of records.addr) {
          const setAddrTx = await _publicResolver[
            'setAddr(bytes32,uint256,bytes)'
          ](hash, key, value)
          console.log(` - ${key} ${value} (tx: ${setAddrTx.hash})...`)
          await setAddrTx.wait()
        }
      }
      if (records.contenthash) {
        console.log('CONTENTHASH')
        const setContenthashTx = await _publicResolver.setContenthash(
          hash,
          records.contenthash,
        )
        console.log(
          ` - ${records.contenthash} (tx: ${setContenthashTx.hash})...`,
        )
        await setContenthashTx.wait()
      }
      if (records.abi) {
        const abis = Array.isArray(records.abi) ? records.abi : [records.abi]
        for (const abi of abis) {
          /**
           * @type {string | Buffer | Uint8Array}
           */
          let data
          if (abi.contentType === 1 || abi.contentType === 256) {
            data = JSON.stringify(abi.data)
          } else if (abi.contentType === 2) {
            data = pako.deflate(JSON.stringify(abi.data))
          } else if (abi.contentType === 4) {
            data = cbor.encode(abi.data)
          } else {
            data = abi.data
          }
          if (typeof data === 'string') data = toBytes(data)
          const setABITx = await _publicResolver.setABI(
            hash,
            abi.contentType,
            data,
          )
          console.log(` - ${abi.contentType} (tx: ${setABITx.hash})...`)
          await setABITx.wait()
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
        console.log(` - ${subnameLabel} (tx: ${setSubnameTx.hash})...`)
        await setSubnameTx.wait()
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

module.exports = func
