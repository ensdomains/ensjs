/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-await-in-loop */
const fs = require('node:fs/promises')
const { ethers } = require('hardhat')
const { resolve } = require('node:path')
const { namehash } = require('viem')

const names = [
  {
    namedOwner: 'owner',
    name: 'with-oldest-resolver.eth',
    addr: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  },
]

/**
 * @type {import('hardhat-deploy/types').DeployFunction}
 */
const func = async (hre) => {
  const { getNamedAccounts, deployments } = hre
  const allNamedAccts = await getNamedAccounts()

  const registry = await ethers.getContract('ENSRegistry')

  await deployments.deploy('OldestResolver', {
    from: allNamedAccts.deployer,
    contract: JSON.parse(
      await fs.readFile(
        resolve(__dirname, '../contracts/OldestResolver.json'),
        {
          encoding: 'utf8',
        },
      ),
    ),
    args: [registry.address],
  })

  const resolver = await ethers.getContract('OldestResolver')

  for (const { namedOwner, name, addr } of names) {
    const owner = allNamedAccts[namedOwner]
    const _resolver = resolver.connect(await ethers.getSigner(owner))
    const _registry = registry.connect(await ethers.getSigner(owner))

    const tx = await _registry.setResolver(namehash(name), resolver.address)
    console.log(
      `Setting resolver for ${name} to ${resolver.address} (tx: ${tx.hash})...`,
    )
    await tx.wait()

    const tx2 = await _resolver['setAddr(bytes32,address)'](
      namehash(name),
      addr,
      {
        gasLimit: 100000,
      },
    )
    console.log(`Setting address for 60 to ${addr} (tx: ${tx.hash})...`)
    await tx2.wait()
  }

  return true
}

func.id = 'set-oldest-resolver'
func.tags = ['set-oldest-resolver']
func.runAtTheEnd = true

module.exports = func
