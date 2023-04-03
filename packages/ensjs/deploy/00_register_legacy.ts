/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-await-in-loop */
import { toUtf8Bytes } from '@ethersproject/strings'
import cbor from 'cbor'
import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import pako from 'pako'
import { labelhash } from '../src/utils/labels'
import { namehash } from '../src/utils/normalise'

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

type Subname = {
  label: string
  namedOwner: string
}

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
    abi?: {
      contentType: 1 | 2 | 4 | 8 | 256
      data: object | string
    }
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
    label: 'expired',
    namedOwner: 'owner',
    namedAddr: 'owner',
    duration: 2419200,
  },
  ...Array.from({ length: 34 }, (_, i) => ({
    label: `${i}-dummy`,
    namedOwner: 'owner2',
    namedAddr: 'owner2',
  })),
]

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, network } = hre
  const allNamedAccts = await getNamedAccounts()

  const controller = await ethers.getContract('LegacyETHRegistrarController')
  const publicResolver = await ethers.getContract('LegacyPublicResolver')

  await network.provider.send('anvil_setBlockTimestampInterval', [60])

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

    const commitment = await controller.makeCommitmentWithConfig(
      label,
      registrant,
      secret,
      resolver,
      addr,
    )

    const _controller = controller.connect(await ethers.getSigner(registrant))
    const commitTx = await _controller.commit(commitment)
    console.log(
      `Committing commitment for ${label}.eth (tx: ${commitTx.hash})...`,
    )
    await commitTx.wait()

    await network.provider.send('evm_mine')

    const price = await controller.rentPrice(label, duration)

    const registerTx = await _controller.registerWithConfig(
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
        console.log('ABI')
        let data: string | Buffer | Uint8Array
        if (records.abi.contentType === 1 || records.abi.contentType === 256) {
          data = JSON.stringify(records.abi.data)
        } else if (records.abi.contentType === 2) {
          data = pako.deflate(JSON.stringify(records.abi.data))
        } else if (records.abi.contentType === 4) {
          data = cbor.encode(records.abi.data)
        } else {
          data = records.abi.data as string
        }
        if (typeof data === 'string') data = toUtf8Bytes(data)
        const setABITx = await _publicResolver.setABI(
          hash,
          records.abi.contentType,
          data,
        )
        console.log(` - ${records.abi.contentType} (tx: ${setABITx.hash})...`)
        await setABITx.wait()
      }
    }

    if (subnames) {
      console.log(`Setting subnames for ${label}.eth...`)
      const registry = await ethers.getContract('ENSRegistry')
      for (const {
        label: subnameLabel,
        namedOwner: subnameOwner,
      } of subnames) {
        const owner = allNamedAccts[subnameOwner]
        const _registry = registry.connect(await ethers.getSigner(registrant))
        const setSubnameTx = await _registry.setSubnodeRecord(
          namehash(`${label}.eth`),
          labelhash(subnameLabel),
          owner,
          resolver,
          '0',
        )
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

export default func
