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

      const commitment = await controller.makeCommitmentWithConfig(
        label,
        registrant,
        secret,
        resolver,
        addr,
      )

      const _controller = controller.connect(await ethers.getSigner(registrant))
      return _controller.commit(commitment, {
        nonce: nonceManager.getNonce(namedOwner),
      })
    },
    register: async ({ label, namedOwner, namedAddr, duration = 31536000 }) => {
      const secret =
        '0x0000000000000000000000000000000000000000000000000000000000000000'
      const registrant = allNamedAccts[namedOwner]
      const resolver = publicResolver.address
      const addr = allNamedAccts[namedAddr]
      const price = await controller.rentPrice(label, duration)
      return controller.write.registerWithConfig(
        [label, registrant, duration, secret, resolver, addr],
        {
          value: price,
          nonce: nonceManager.getNonce(namedOwner),
        },
      ) // { account: registrant }
    },
    subname: async ({ label, namedOwner, subnameLabel, namedSubnameOwner }) => {
      console.log(`Setting subnames for ${label}.eth...`)
      const resolver = publicResolver.address
      const owner = allNamedAccts[namedSubnameOwner]

      const client = (await viem.getNamedClients())[namedOwner]
      const _registry = await viem.getContract(
        'LegacyENSRegistry' as 'ENSRegistry',
        client,
      )

      return _registry.write.setSubnodeRecord(
        [
          namehash(`${label}.eth`),
          labelhash(subnameLabel),
          owner,
          resolver,
          '0',
        ],
        { account: client.account },
      )
    },
    setSubnameRecords: async () => {},
    configure: async () => {},
  }
}

export { makeNameGenerator }
