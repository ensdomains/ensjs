import fs from 'node:fs/promises'
import { resolve } from 'node:path'
import type { DeployFunction } from 'hardhat-deploy/dist/types.js'
import { namehash } from 'viem/ens'

const names = [
  {
    namedOwner: 'owner',
    name: 'with-legacy-resolver.eth',
    addr: [{ key: 60, value: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' }],
  },
]

const func: DeployFunction = async (hre) => {
  const { getNamedAccounts, deployments, viem } = hre
  const allNamedAccts = await getNamedAccounts()

  const registry = await viem.getContract('ENSRegistry')

  console.log('deploying NoMulticallResolver')
  await deployments.deploy('NoMulticallResolver', {
    from: allNamedAccts.deployer,
    contract: JSON.parse(
      await fs.readFile(
        resolve(import.meta.dirname, '../contracts/NoMulticallResolver.json'),
        {
          encoding: 'utf8',
        },
      ),
    ),
    args: [registry.address],
  })

  const resolver = await viem.getContract('NoMulticallResolver')
  for (const { namedOwner, name, addr } of names) {
    const owner = (await viem.getNamedClients())[namedOwner]

    const tx = await registry.write.setResolver(
      [namehash(name), resolver.address],
      {
        account: owner.address,
      },
    )
    console.log(
      `Setting resolver for ${name} to ${resolver.address} (tx: ${tx})...`,
    )
    await viem.waitForTransactionSuccess(tx)

    for (const { key, value } of addr) {
      const tx2 = await resolver.write.setAddr([namehash(name), value], {
        account: owner.address,
        gasLimit: 100000,
      })
      console.log(`Setting address for ${key} to ${value} (tx: ${tx})...`)
      await viem.waitForTransactionSuccess(tx2)
    }
  }

  return true
}

func.id = 'set-legacy-resolver'
func.tags = ['set-legacy-resolver']
func.dependencies = ['register-unwrapped-names']
func.runAtTheEnd = true

export default func
