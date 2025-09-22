import type { DeployFunction } from 'hardhat-deploy/dist/types.js'
import type { Address } from 'viem'
import type { RecordOptions } from '../src/utils/generateRecordCallArray.js'
import { makeNameGenerator } from '../utils/referrableNameGenerator.js'

type Subname = {
  label: string
  namedOwner: string
}

const names: {
  label: string
  namedOwner: string
  namedAddr: string
  records?: RecordOptions
  duration?: number
  subnames?: Subname[]
}[] = [
  {
    label: 'referrable',
    namedOwner: 'owner',
    namedAddr: 'owner',
  },
  {
    label: 'referrable-with-profile',
    namedOwner: 'owner2',
    namedAddr: 'owner2',
    records: {
      texts: [
        { key: 'description', value: 'Hello2' },
        { key: 'url', value: 'twitter.com' },
        { key: 'blankrecord', value: '' },
        { key: 'email', value: 'fakeemail@fake.com' },
      ],
      coins: [
        { coin: 61, value: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC' },
      ],
    },
  },
  {
    label: 'referrable-expired',
    namedOwner: 'owner',
    namedAddr: 'owner',
    duration: 31536000,
  },
]

const func: DeployFunction = async (hre) => {
  const { getNamedAccounts, network, viem } = hre
  const allNamedAccts = await getNamedAccounts()

  const publicResolver = await viem.getContract('PublicResolver')

  await network.provider.send('anvil_setBlockTimestampInterval', [60])

  const nameGenerator = await makeNameGenerator(hre)

  for (const {
    label,
    namedOwner,
    namedAddr,
    records,
    subnames,
    duration = 31536000,
  } of names) {
    const registrant = allNamedAccts[namedOwner] as Address
    const commitTx = await nameGenerator.commit({
      label,
      namedOwner,
      records,
    })

    console.log(`Committing commitment for ${label}.eth (tx: ${commitTx})...`)
    await viem.waitForTransactionSuccess(commitTx)

    await network.provider.send('evm_mine')

    const registerTx = await nameGenerator.register({
      label,
      namedOwner,
      duration,
      records,
    })
    console.log(`Registering name ${label}.eth (tx: ${registerTx})...`)

    await viem.waitForTransactionSuccess(registerTx)

    console.log('Name registered')

    if (subnames) {
      console.log(`Setting subnames for ${label}.eth...`)
      for (const {
        label: subnameLabel,
        namedOwner: namedSubnameOwner,
      } of subnames) {
        const setSubnameTx = await nameGenerator.subname({
          label,
          namedOwner,
          subnameLabel,
          namedSubnameOwner,
        })
        console.log(` - ${subnameLabel} (tx: ${setSubnameTx})...`)
        await viem.waitForTransactionSuccess(setSubnameTx)
      }
    }
  }

  await network.provider.send('anvil_setBlockTimestampInterval', [1])

  return true
}

func.id = 'register-referrable-names'
func.tags = ['register-referrable-names']
func.dependencies = ['ETHRegistrarController']
func.runAtTheEnd = true

export default func
