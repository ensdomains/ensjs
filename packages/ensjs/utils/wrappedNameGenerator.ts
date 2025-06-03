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
    }) => {
      const secret =
        '0x0000000000000000000000000000000000000000000000000000000000000000'
      const owner = allNamedAccts[namedOwner]
      const resolver = publicResolver.address
      const commitment = await controller.makeCommitment(
        label,
        owner,
        duration,
        secret,
        resolver,
        data,
        reverseRecord,
        fuses,
      )

      const _controller = controller.connect(await viem.getSigner(owner))
      return _controller.commit(commitment, {
        nonce: nonceManager.getNonce(namedOwner),
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
      const [price] = await controller.rentPrice(label, duration)

      const priceWithBuffer = BigInt((price * 105) / 100)
      const _controller = controller.connect(await viem.getSigner(owner))
      return _controller.register(
        label,
        owner,
        duration,
        secret,
        resolver,
        data,
        reverseRecord,
        fuses,
        {
          value: priceWithBuffer,
          nonce: nonceManager.getNonce(namedOwner),
        },
      )
    },
    subname: async ({
      label,
      namedOwner,
      subnameLabel,
      namedSubnameOwner,
      subnameFuses = 0,
      subnameExpiry = BigNumber.from(2).pow(64).sub(1),
    }) => {
      const resolver = publicResolver.address
      const owner = allNamedAccts[namedOwner]
      const subnameOwner = allNamedAccts[namedSubnameOwner]
      const _nameWrapper = nameWrapper.connect(await viem.getSigner(owner))
      return _nameWrapper.setSubnodeRecord(
        namehash(`${label}.eth`),
        subnameLabel,
        subnameOwner,
        resolver,
        '0',
        subnameFuses,
        subnameExpiry,
      )
    },
  }
}

export { makeNameGenerator }
