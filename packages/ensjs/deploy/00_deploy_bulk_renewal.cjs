/* eslint-disable import/no-extraneous-dependencies */
// eslint-disable-next-line @typescript-eslint/naming-convention
const { Interface } = require('ethers/lib/utils')
const { ethers } = require('hardhat')
const { namehash, labelhash } = require('viem/ens')

const { makeInterfaceId } = require('@openzeppelin/test-helpers')

/**
 * @param {import('ethers/lib/utils').Interface} iface
 */
function computeInterfaceId(iface) {
  return makeInterfaceId.ERC165(
    Object.values(iface.functions).map((frag) => frag.format('sighash')),
  )
}

/**
 * @type {import('hardhat-deploy/types').DeployFunction}
 */
const func = async function (hre) {
  const { getNamedAccounts, deployments, network } = hre
  const { deploy } = deployments
  const { deployer, owner } = await getNamedAccounts()

  if (!network.tags.use_root) {
    return true
  }

  const root = await ethers.getContract('Root', await ethers.getSigner(owner))
  const registry = await ethers.getContract(
    'ENSRegistry',
    await ethers.getSigner(owner),
  )
  const resolver = await ethers.getContract(
    'PublicResolver',
    await ethers.getSigner(owner),
  )
  const registrar = await ethers.getContract('BaseRegistrarImplementation')
  const controller = await ethers.getContract('ETHRegistrarController')
  const wrapper = await ethers.getContract('NameWrapper')
  const controllerArtifact = await deployments.getArtifact(
    'IETHRegistrarController',
  )

  const bulkRenewal = await deploy('BulkRenewal', {
    from: deployer,
    args: [registry.address],
    log: true,
  })

  console.log('Temporarily setting owner of eth tld to owner ')
  const tx = await root.setSubnodeOwner(labelhash('eth'), owner)
  await tx.wait()

  console.log('Set default resolver for eth tld to public resolver')
  const tx111 = await registry.setResolver(namehash('eth'), resolver.address)
  await tx111.wait()

  console.log('Set interface implementor of eth tld for bulk renewal')
  const tx2 = await resolver.setInterface(
    ethers.utils.namehash('eth'),
    computeInterfaceId(new Interface(bulkRenewal.abi)),
    bulkRenewal.address,
  )
  await tx2.wait()

  console.log('Set interface implementor of eth tld for registrar controller')
  const tx3 = await resolver.setInterface(
    ethers.utils.namehash('eth'),
    computeInterfaceId(new Interface(controllerArtifact.abi)),
    controller.address,
  )
  await tx3.wait()

  console.log('Set interface implementor of eth tld for name wrapper')
  const tx4 = await resolver.setInterface(
    ethers.utils.namehash('eth'),
    computeInterfaceId(wrapper.interface),
    wrapper.address,
  )
  await tx4.wait()

  console.log('Set owner of eth tld back to registrar')
  const tx11 = await root.setSubnodeOwner(labelhash('eth'), registrar.address)
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

module.exports = func
