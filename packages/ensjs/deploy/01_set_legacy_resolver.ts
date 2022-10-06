/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-await-in-loop */
import fs from 'fs/promises'
import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { resolve } from 'path'
import { namehash } from '../src/utils/normalise'

const names = [
  {
    namedOwner: 'owner',
    name: 'with-legacy-resolver.eth',
    addr: [{ key: 60, value: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' }],
  },
]

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments } = hre
  const allNamedAccts = await getNamedAccounts()

  const registry = await ethers.getContract('ENSRegistry')

  console.log(registry.address)

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

export default func
