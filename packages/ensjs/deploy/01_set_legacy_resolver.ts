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

  await deployments.deploy('NoMulticallResolver', {
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

  const resolver = await viem.getContract('NoMulticallResolver')
  for (const { namedOwner, name, addr } of names) {
    const owner = (await viem.getNamedClients())[namedOwner]
    const _resolver = resolver.connect(owner)
    const _registry = registry.connect(owner)

    const tx = await _registry.write.setResolver([
      namehash(name),
      resolver.address,
    ])
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

export default func
