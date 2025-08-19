import type { HardhatRuntimeEnvironment } from 'hardhat/types/runtime.js'
import { namehash } from 'viem/ens'

const makeNameGenerator = async (
  hre: HardhatRuntimeEnvironment,
  optionalNonceManager?: { getNonce: (acct?: string) => number | undefined },
) => {
  const { getNamedAccounts, viem } = hre
  const allNamedAccts = await getNamedAccounts()
  const controller = await viem.getContract('ETHRegistrarController')
  const publicResolver = await viem.getContract('PublicResolver')
  const nameWrapper = await viem.getContract('NameWrapper')
  const nonceManager = optionalNonceManager ?? { getNonce: () => undefined }

  return {
    commit: async ({
      label,
      namedOwner,
      data = [],
      reverseRecord = false,
      fuses = 0,
      duration = 31536000,
    }: {
      label: string
      namedOwner: string
      data?: any[]
      reverseRecord?: boolean
      fuses?: number
      duration?: number | bigint
    }) => {
      const secret =
        '0x0000000000000000000000000000000000000000000000000000000000000000'
      const owner = allNamedAccts[namedOwner]
      const resolver = publicResolver.address
      const nonce = nonceManager.getNonce(namedOwner)
      const commitment = await controller.read.makeCommitment([
        label,
        owner,
        duration,
        secret,
        resolver,
        data,
        reverseRecord,
        fuses,
      ])

      return controller.write.commit([commitment], {
        nonce,
        account: owner,
      })
    },
    register: async ({
      label,
      namedOwner,
      data = [],
      reverseRecord = false,
      fuses = 0,
      duration = 31536000,
    }: {
      label: string
      namedOwner: string
      data?: any[]
      reverseRecord?: boolean
      fuses?: number
      duration?: number | bigint
    }) => {
      const secret =
        '0x0000000000000000000000000000000000000000000000000000000000000000'
      const owner = allNamedAccts[namedOwner]
      const resolver = publicResolver.address
      const price = await controller.read.rentPrice([label, duration])

      const priceWithBuffer = (price.base * 105n) / 100n
      return controller.write.register(
        [label, owner, duration, secret, resolver, data, reverseRecord, fuses],
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
      subnameFuses = 0,
      subnameExpiry = BigInt(2) ** BigInt(64) - BigInt(1),
    }: {
      label: string
      namedOwner: string
      subnameLabel: string
      namedSubnameOwner: string
      subnameFuses?: number
      subnameExpiry?: number | bigint
    }) => {
      const resolver = publicResolver.address
      const owner = allNamedAccts[namedOwner]
      const subnameOwner = allNamedAccts[namedSubnameOwner]
      return nameWrapper.write.setSubnodeRecord(
        [
          namehash(`${label}.eth`),
          subnameLabel,
          subnameOwner,
          resolver,
          '0',
          subnameFuses,
          subnameExpiry,
        ],
        {
          account: owner,
        },
      )
    },
  }
}

export { makeNameGenerator }
