import fs from 'node:fs/promises'
import { resolve } from 'node:path'
import type { DeployFunction } from 'hardhat-deploy/dist/types.js'
import { namehash } from 'viem'

const names = [
  {
    namedOwner: 'owner',
    name: 'with-oldest-resolver.eth',
    addr: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  },
]

const func: DeployFunction = async (hre) => {
  const { getNamedAccounts, deployments, viem } = hre
  const allNamedAccts = await getNamedAccounts()

  const registry = await viem.getContract('ENSRegistry')

  await deployments.deploy('OldestResolver', {
    from: allNamedAccts.deployer,
    contract: JSON.parse(
      await fs.readFile(
        resolve(import.meta.dirname, '../contracts/OldResolver.json'),
        {
          encoding: 'utf8',
        },
      ),
    ),
    args: [registry.address],
  })

  const resolver = await viem.getContract('OldestResolver')

  for (const { namedOwner, name, addr } of names) {
    const owner = allNamedAccts[namedOwner]

    const tx = await registry.write.setResolver([
      namehash(name),
      resolver.address,
    ], {
      account: owner
    })
    console.log(
      `Setting resolver for ${name} to ${resolver.address} (tx: ${tx})...`,
    )
    await viem.waitForTransactionSuccess(tx)

    const tx2 = await resolver.write.setAddr(
    [  namehash(name),
      addr],
      {
        account: owner,
        gasLimit: 100000,
      },
    )
    console.log(`Setting address for 60 to ${addr} (tx: ${tx})...`)
    await viem.waitForTransactionSuccess(tx2)
  }

  return true
}

func.id = 'set-oldest-resolver'
func.tags = ['set-oldest-resolver']
func.runAtTheEnd = true

export default func
