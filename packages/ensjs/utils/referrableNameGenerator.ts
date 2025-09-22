import type { HardhatRuntimeEnvironment } from 'hardhat/types/runtime.js'
import type { Address, Hex } from 'viem'
import { labelhash, namehash } from 'viem/ens'
import { EMPTY_BYTES32 } from '../src/utils/consts.js'
import {
  type RecordOptions,
  generateRecordCallArray,
} from '../src/utils/generateRecordCallArray.js'
import type { ReverseRecordParameter } from '../src/utils/registerHelpers.js'

const makeNameGenerator = async (
  hre: HardhatRuntimeEnvironment,
  optionalNonceManager?: { getNonce: (acct?: string) => number | undefined },
) => {
  const { getNamedAccounts, viem } = hre
  const allNamedAccts = await getNamedAccounts()
  const controller = await viem.getContract('ETHRegistrarController')
  const publicResolver = await viem.getContract('PublicResolver')
  const nonceManager = optionalNonceManager ?? { getNonce: () => undefined }

  return {
    commit: async ({
      label,
      namedOwner,
      records,
      reverseRecord = 0,
      referrer = EMPTY_BYTES32,
      duration = 31536000,
    }: {
      label: string
      namedOwner: string
      records?: RecordOptions
      reverseRecord?: ReverseRecordParameter
      referrer?: Hex
      duration?: number | bigint
    }) => {
      console.log('making commitment', label, namedOwner, records)
      const secret =
        '0x0000000000000000000000000000000000000000000000000000000000000000'
      const owner = allNamedAccts[namedOwner]
      const resolver: Address = publicResolver.address
      console.log('resolver', resolver)
      const nonce = nonceManager.getNonce(namedOwner)
      console.log('nonce', nonce)
      const hash = namehash(`${label}.eth`)
      console.log('hash', hash)
      console.log(
        'makeing data',
        records ? generateRecordCallArray({ namehash: hash, ...records }) : [],
      )
      const data = records
        ? generateRecordCallArray({ namehash: hash, ...records })
        : []

      console.log('referrable: nonce for', label, 'by', namedOwner, 'is', nonce)

      console.log('fetching commitment with params: ', {
        label,
        owner,
        duration,
        secret,
        resolver,
        data,
        reverseRecord,
        referrer,
      })

      const commitment = await controller.read.makeCommitment([
        {
          label,
          owner,
          duration,
          secret,
          resolver,
          data,
          reverseRecord,
          referrer,
        },
      ])

      return controller.write.commit([commitment], {
        nonce,
        account: owner,
      })
    },
    register: async ({
      label,
      namedOwner,
      records,
      reverseRecord = 0,
      referrer = EMPTY_BYTES32,
      duration = 31536000,
    }: {
      label: string
      namedOwner: string
      records?: RecordOptions
      reverseRecord?: ReverseRecordParameter
      referrer?: Hex
      duration?: number | bigint
    }) => {
      const secret =
        '0x0000000000000000000000000000000000000000000000000000000000000000'
      const owner = allNamedAccts[namedOwner]
      const resolver = publicResolver.address
      const price = await controller.read.rentPrice([label, duration])
      const hash = namehash(`${label}.eth`)
      const data = records
        ? generateRecordCallArray({ namehash: hash, ...records })
        : []

      const priceWithBuffer = (price.base * 105n) / 100n
      return controller.write.register(
        [
          {
            label,
            owner,
            duration,
            secret,
            resolver,
            data,
            reverseRecord,
            referrer,
          },
        ],
        {
          value: priceWithBuffer,
          nonce: nonceManager.getNonce(namedOwner),
          account: owner,
        },
      )
    },
    subname: async ({
      label,
      namedOwner,
      subnameLabel,
      namedSubnameOwner,
    }: {
      label: string
      namedOwner: string
      subnameLabel: string
      namedSubnameOwner: string
    }) => {
      console.log(`Setting subnames for ${label}.eth...`)
      const resolver = publicResolver.address
      const registrant = allNamedAccts[namedOwner]
      const owner = allNamedAccts[namedSubnameOwner]

      const _registry = await viem.getContract('ENSRegistry')

      return _registry.write.setSubnodeRecord(
        [
          namehash(`${label}.eth`),
          labelhash(subnameLabel),
          owner,
          resolver,
          '0',
        ],
        { account: registrant },
      )
    },
    setSubnameRecords: async () => {},
    configure: async () => {},
  }
}

export { makeNameGenerator }
