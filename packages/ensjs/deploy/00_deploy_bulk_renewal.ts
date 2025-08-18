import type { DeployFunction } from 'hardhat-deploy/dist/types.js'
import type { Abi, AbiFunction } from 'viem'
import { labelhash, namehash } from 'viem/ens'
import { bytesToHex, hexToBytes, toFunctionHash } from 'viem/utils'

export const createInterfaceId = <iface extends Abi>(iface: iface) => {
  const bytesId = iface
    .filter((item): item is AbiFunction => item.type === 'function')
    .map((f) => toFunctionHash(f))
    .map((h) => hexToBytes(h).slice(0, 4))
    .reduce((memo, bytes) => {
      for (let i = 0; i < 4; i++) {
        memo[i] = memo[i] ^ bytes[i] // xor
      }
      return memo
    }, new Uint8Array(4))

  return bytesToHex(bytesId)
}

const func: DeployFunction = async (hre) => {
  const { getNamedAccounts, deployments, network, viem } = hre
  const { deploy } = deployments
  const { deployer, owner } = await getNamedAccounts()
  const clients = await viem.getNamedClients()

  if (!network.tags.use_root) {
    return true
  }

  const root = await viem.getContract('Root', clients.owner)
  const registry = await viem.getContract('ENSRegistry', clients.owner)
  const resolver = await viem.getContract('PublicResolver', clients.owner)
  const registrar = await viem.getContract('BaseRegistrarImplementation')
  const controller = await viem.getContract('ETHRegistrarController')
  const wrapper = await viem.getContract('NameWrapper')
  const controllerArtifact = await deployments.getArtifact(
    'IETHRegistrarController',
  )

  const bulkRenewal = await deploy('BulkRenewal', {
    from: deployer,
    args: [registry.address],
    log: true,
  })

  console.log('Temporarily setting owner of eth tld to owner ')
  const tx = await root.write.setSubnodeOwner([labelhash('eth')], owner)
  await tx.wait()

  console.log('Set default resolver for eth tld to public resolver')
  const tx111 = await registry.write.setResolver(
    [namehash('eth')],
    resolver.address,
  )
  await tx111.wait()

  console.log('Set interface implementor of eth tld for bulk renewal')
  const tx2 = await resolver.write.setInterface(
    [namehash('eth'), createInterfaceId(bulkRenewal.abi)],
    bulkRenewal.address,
  )
  await tx2.wait()

  console.log('Set interface implementor of eth tld for registrar controller')
  const tx3 = await resolver.setInterface(
    namehash('eth'),
    createInterfaceId(controllerArtifact.abi),
    controller.address,
  )
  await tx3.wait()

  console.log('Set interface implementor of eth tld for name wrapper')
  const tx4 = await resolver.setInterface(
    namehash('eth'),
    createInterfaceId(wrapper.interface),
    wrapper.address,
  )
  await tx4.wait()

  console.log('Set owner of eth tld back to registrar')
  const tx11 = await root.setSubnodeOwner([labelhash('eth'), registrar.address])
  await tx11.wait()

  return true
}

func.id = 'bulk-renewal'
func.tags = ['ethregistrar', 'BulkRenewal']
func.dependencies = [
  'root',
  'registry',
  'BaseRegistrarImplementation',
  'PublicResolver',
  'ETHRegistrarController',
]

export default func
