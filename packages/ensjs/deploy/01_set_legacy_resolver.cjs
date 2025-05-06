/* eslint-disable no-await-in-loop */
const fs = require('node:fs/promises')
const { ethers } = require('hardhat')
const { resolve } = require('node:path')
const { namehash } = require('viem')

const names = [
  {
    namedOwner: 'owner',
    name: 'with-legacy-resolver.eth',
    addr: [{ key: 60, value: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' }],
  },
]

/**
 * @type {import('hardhat-deploy/types').DeployFunction}
 */
const func = async (hre) => {
  const { getNamedAccounts, deployments } = hre
  const allNamedAccts = await getNamedAccounts()

  const registry = await ethers.getContract('ENSRegistry')

  await deployments.deploy('NoMulticallResolver', {
    from: allNamedAccts.deployer,
    contract: JSON.parse(
      await fs.readFile(resolve(__dirname, '../contracts/OldResolver.json'), {
        encoding: 'utf8',
      }),
    ),
    args: [registry.address],
  })

  const resolver = await ethers.getContract('NoMulticallResolver')

  for (const { namedOwner, name, addr } of names) {
    const owner = allNamedAccts[namedOwner]
    const _resolver = resolver.connect(await ethers.getSigner(owner))
    const _registry = registry.connect(await ethers.getSigner(owner))

    const tx = await _registry.setResolver(namehash(name), resolver.address)
    console.log(
      `Setting resolver for ${name} to ${resolver.address} (tx: ${tx.hash})...`,
    )
    await tx.wait()

    for (const { key, value } of addr) {
      const tx2 = await _resolver['setAddr(bytes32,uint256,bytes)'](
        namehash(name),
        key,
        value,
        {
          gasLimit: 100000,
        },
      )
      console.log(`Setting address for ${key} to ${value} (tx: ${tx.hash})...`)
      await tx2.wait()
    }
  }

  return true
}

func.id = 'set-legacy-resolver'
func.tags = ['set-legacy-resolver']
func.runAtTheEnd = true

module.exports = func
