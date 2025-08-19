import type { Address } from 'abitype'
import type { HardhatRuntimeEnvironment } from 'hardhat/types/runtime.js'
import { labelhash, namehash } from 'viem/ens'

const makeNameGenerator = async (
  hre: HardhatRuntimeEnvironment,
  optionalNonceManager?: { getNonce: (acct?: string) => number | undefined },
) => {
  const { getNamedAccounts, viem } = hre
  const allNamedAccts = await getNamedAccounts()
  const controller = await viem.getContract('LegacyETHRegistrarController')
  const publicResolver = await viem.getContract('LegacyPublicResolver')
  const nonceManager = optionalNonceManager ?? { getNonce: () => undefined }

  return {
    commit: async ({
      label,
      namedOwner,
      namedAddr,
    }: { label: string; namedOwner: string; namedAddr: Address }) => {
      const secret =
        '0x0000000000000000000000000000000000000000000000000000000000000000'
      const registrant = allNamedAccts[namedOwner]
      const resolver = publicResolver.address
      const addr = allNamedAccts[namedAddr]
      const nonce = nonceManager.getNonce(namedOwner)

      const commitment = await controller.read.makeCommitmentWithConfig([
        label,
        registrant,
        secret,
        resolver,
        addr,
      ])

      return controller.write.commit([commitment], {
        nonce,
        account: registrant,
      })
    },
    register: async ({
      label,
      namedOwner,
      namedAddr,
      duration = 31536000,
    }: {
      label: string
      namedOwner: string
      namedAddr: string
      duration?: number | bigint
    }) => {
      const secret =
        '0x0000000000000000000000000000000000000000000000000000000000000000'
      const registrant = allNamedAccts[namedOwner]
      const resolver = publicResolver.address
      const addr = allNamedAccts[namedAddr]
      const price = await controller.read.rentPrice([label, duration])

      return controller.write.registerWithConfig(
        [label, registrant, duration, secret, resolver, addr],
        {
          value: price,
          nonce: nonceManager.getNonce(namedOwner),
          account: registrant,
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
