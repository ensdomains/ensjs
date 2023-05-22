/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-await-in-loop */
/* eslint-disable import/no-extraneous-dependencies */
import { readFile } from 'fs/promises'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { resolve } from 'path'
import { labelhash } from 'viem'

const ensContractsPath = './node_modules/@ensdomains/ens-contracts'
const mainnetArtifactsPath = resolve(ensContractsPath, './deployments/mainnet')

const constructorArgs = [
  '0x00002b000100000e1000244a5c080249aac11d7b6f6446702e54a1607371607a1a41855200fd2ce1cdde32f24e8fb500002b000100000e1000244f660802e06d44b80b8f1d39a95c0b0d7c65d08458e880409bbc683457104237c7f8ec8d',
]

const getMainnetArtifact = async (name: string) => {
  const deployment = JSON.parse(
    await readFile(resolve(mainnetArtifactsPath, `${name}.json`), 'utf8'),
  )
  const artifact = {
    _format: 'hh-sol-artifact-1',
    contractName: `Legacy${name}`,
    abi: deployment.abi,
    bytecode: deployment.bytecode,
    deployedBytecode: deployment.deployedBytecode,
    linkReferences: {},
    deployedLinkReferences: {},
  }
  return artifact
}

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments } = hre
  const { deploy } = deployments
  const { deployer, owner } = await getNamedAccounts()

  const { address: legacyDnssecImplAddress } = await deploy(
    'LegacyDNSSECImpl',
    {
      from: deployer,
      args: constructorArgs,
      log: true,
      contract: await getMainnetArtifact('DNSSECImpl'),
    },
  )

  const dnssec = await hre.ethers.getContract('LegacyDNSSECImpl')

  const algorithms: Record<number, string> = {
    5: 'RSASHA1Algorithm',
    7: 'RSASHA1Algorithm',
    8: 'RSASHA256Algorithm',
    13: 'P256SHA256Algorithm',
  }
  const digests: Record<number, string> = {
    1: 'SHA1Digest',
    2: 'SHA256Digest',
  }

  const transactions = []
  for (const [id, alg] of Object.entries(algorithms)) {
    const { address } = await deployments.get(alg)
    if (address !== (await dnssec.algorithms(id))) {
      transactions.push(await dnssec.setAlgorithm(id, address))
    }
  }

  for (const [id, digest] of Object.entries(digests)) {
    const { address } = await deployments.get(digest)
    if (address !== (await dnssec.digests(id))) {
      transactions.push(await dnssec.setDigest(id, address))
    }
  }

  console.log(
    `Waiting on ${transactions.length} transactions setting legacy DNSSEC parameters`,
  )
  await Promise.all(transactions.map((tx) => tx.wait()))

  const root = await hre.ethers.getContract('Root')
  const { address: registryAddress } = await hre.ethers.getContract(
    'ENSRegistry',
  )
  const { address: publicSuffixListAddress } = await hre.ethers.getContract(
    'TLDPublicSuffixList',
  )

  const { address: legacyDnsRegistrarAddress } = await deploy(
    'LegacyDNSRegistrar',
    {
      from: deployer,
      args: [legacyDnssecImplAddress, publicSuffixListAddress, registryAddress],
      log: true,
      contract: await getMainnetArtifact('DNSRegistrar'),
    },
  )

  const tx = await root
    .connect(await hre.ethers.getSigner(owner))
    .setController(legacyDnsRegistrarAddress, true)
  console.log(
    `Setting LegacyDNSRegistrar as controller of Root... (${tx.hash})`,
  )
  await tx.wait()

  const tx2 = await root
    .connect(await hre.ethers.getSigner(owner))
    .setSubnodeOwner(labelhash('xyz'), legacyDnsRegistrarAddress)
  console.log(`Setting LegacyDNSRegistrar as owner of xyz... (${tx2.hash})`)
  await tx2.wait()
}

func.dependencies = ['Root']

export default func
