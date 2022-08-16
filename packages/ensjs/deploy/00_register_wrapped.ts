/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-await-in-loop */
import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { namehash } from '../src/utils/normalise'

const names = [
  {
    label: 'wrapped',
    namedOwner: 'owner',
    data: [],
    reverseRecord: true,
    fuses: 0,
  },
  {
    label: 'wrapped-with-subnames',
    namedOwner: 'owner',
    data: [],
    reverseRecord: false,
    fuses: 0,
    subnames: [{ label: 'test', namedOwner: 'owner2' }],
  },
]

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, network } = hre
  const allNamedAccts = await getNamedAccounts()

  const controller = await ethers.getContract('ETHRegistrarController')
  const publicResolver = await ethers.getContract('PublicResolver')

  await network.provider.send('anvil_setBlockTimestampInterval', [60])

  for (const {
    label,
    namedOwner,
    data,
    reverseRecord,
    fuses,
    subnames,
  } of names) {
    const secret =
      '0x0000000000000000000000000000000000000000000000000000000000000000'
    const owner = allNamedAccts[namedOwner]
    const resolver = publicResolver.address
    const duration = 31536000
    const wrapperExpiry = 1659467455 + duration

    const commitment = await controller.makeCommitment(
      label,
      owner,
      duration,
      secret,
      resolver,
      data,
      reverseRecord,
      fuses,
      wrapperExpiry,
    )

    const _controller = controller.connect(await ethers.getSigner(owner))
    const commitTx = await controller.commit(commitment)
    console.log(
      `Commiting commitment for ${label}.eth (tx: ${commitTx.hash})...`,
    )
    await commitTx.wait()

    await network.provider.send('evm_mine')

    const [price] = await controller.rentPrice(label, duration)

    const registerTx = await _controller.register(
      label,
      owner,
      duration,
      secret,
      resolver,
      data,
      reverseRecord,
      fuses,
      wrapperExpiry,
      {
        value: price,
      },
    )
    console.log(`Registering name ${label}.eth (tx: ${registerTx.hash})...`)
    await registerTx.wait()

    if (subnames) {
      console.log(`Setting subnames for ${label}.eth...`)
      const nameWrapper = await ethers.getContract('NameWrapper')
      for (const {
        label: subnameLabel,
        namedOwner: namedSubnameOwner,
      } of subnames) {
        const subnameOwner = allNamedAccts[namedSubnameOwner]
        const _nameWrapper = nameWrapper.connect(await ethers.getSigner(owner))
        const setSubnameTx = await _nameWrapper.setSubnodeRecord(
          namehash(`${label}.eth`),
          subnameLabel,
          subnameOwner,
          resolver,
          '0',
          '0',
          wrapperExpiry,
        )
        console.log(` - ${subnameLabel} (tx: ${setSubnameTx.hash})...`)
        await setSubnameTx.wait()
      }
    }
  }

  await network.provider.send('anvil_setBlockTimestampInterval', [1])

  return true
}

func.id = 'register-wrapped-names'
func.tags = ['register-wrapped-names']
func.dependencies = ['ETHRegistrarController']
func.runAtTheEnd = true

export default func
