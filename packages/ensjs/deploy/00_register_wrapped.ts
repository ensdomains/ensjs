/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-await-in-loop */

import type { DeployFunction } from 'hardhat-deploy/dist/types.js'
import { MAX_DATE_INT } from '../dist/utils/consts.js'
import { encodeFuses } from '../dist/utils/fuses.js'
import { makeNameGenerator } from '../utils/wrappedNameGenerator.js'

const names: {
  label: string
  namedOwner: string
  data?: any[]
  reverseRecord?: boolean
  fuses?: number
  subnames?: {
    label: string
    namedOwner: string
    fuses?: number
    expiry?: number
  }[]
  duration?: number | bigint
}[] = [
  {
    label: 'wrapped',
    namedOwner: 'owner',
    reverseRecord: true,
  },
  {
    label: 'wrapped-with-subnames',
    namedOwner: 'owner',
    subnames: [
      { label: 'test', namedOwner: 'owner2' },
      { label: 'legacy', namedOwner: 'owner2' },
      { label: 'xyz', namedOwner: 'owner2' },
      { label: 'addr', namedOwner: 'owner2' },
    ],
  },
  {
    label: 'expired-wrapped',
    namedOwner: 'owner',
    subnames: [{ label: 'test', namedOwner: 'owner2' }],
    duration: 2419200,
  },
  {
    label: 'wrapped-big-duration',
    namedOwner: 'owner3',
    duration: Math.floor((MAX_DATE_INT - Date.now()) / 1000),
  },
  {
    label: 'wrapped-max-duration',
    namedOwner: 'owner3',
    duration: BigInt('18446744073709'),
  },
  {
    label: 'wrapped-with-expiring-subnames',
    namedOwner: 'owner',
    fuses: encodeFuses({
      input: {
        child: {
          named: ['CANNOT_UNWRAP'],
        },
      },
    }),
    subnames: [
      {
        label: 'test',
        namedOwner: 'owner2',
        expiry: Math.floor(Date.now() / 1000),
      },
      {
        label: 'test1',
        namedOwner: 'owner2',
        expiry: 0,
      },
      {
        label: 'recent-pcc',
        namedOwner: 'owner2',
        expiry: Math.floor(Date.now() / 1000),
        fuses: encodeFuses({
          input: {
            parent: { named: ['PARENT_CANNOT_CONTROL'] },
          },
        }),
      },
      {
        label: 'pcc',
        namedOwner: 'owner2',
        expiry: MAX_DATE_INT,
        fuses: encodeFuses({
          input: {
            parent: { named: ['PARENT_CANNOT_CONTROL'] },
          },
        }),
      },
    ],
  },
  ...Array.from({ length: 2 }, (_, index) => ({
    label: `nonconcurrent-wrapped-name-${index}`,
    namedOwner: 'owner4',
    fuses: encodeFuses({
      input: {
        child: {
          named: ['CANNOT_UNWRAP'],
        },
      },
    }),
    duration: 31556000 * 2,
    subnames: [
      {
        label: 'xyz',
        namedOwner: 'owner4',
        expiry: MAX_DATE_INT,
        fuses: encodeFuses({
          input: {
            parent: {
              named: ['PARENT_CANNOT_CONTROL'],
            },
            child: {
              named: ['CANNOT_UNWRAP'],
            },
          },
        }),
      },
    ],
  })),
]

const func: DeployFunction = async (hre) => {
  const { network, viem } = hre
  const nameGenerator = await makeNameGenerator(hre)

  await network.provider.send('anvil_setBlockTimestampInterval', [60])

  for (const {
    label,
    namedOwner,
    data = [],
    reverseRecord = false,
    fuses = 0,
    subnames,
    duration = 31536000,
  } of names) {
    const commitTx = await nameGenerator.commit({
      label,
      namedOwner,
      data,
      reverseRecord,
      fuses,
      duration,
    })

    console.log(`Committing commitment for ${label}.eth (tx: ${commitTx})...`)
    await viem.waitForTransactionSuccess(commitTx)

    await network.provider.send('evm_mine')

    const registerTx = await nameGenerator.register({
      label,
      namedOwner,
      data,
      reverseRecord,
      fuses,
      duration,
    })

    console.log(`Registering name ${label}.eth (tx: ${registerTx})...`)
    await viem.waitForTransactionSuccess(registerTx)

    if (subnames) {
      console.log(`Setting subnames for ${label}.eth...`)
      for (const {
        label: subnameLabel,
        namedOwner: namedSubnameOwner,
        fuses: subnameFuses = 0,
        expiry: subnameExpiry = 2n ** 64n - 1n,
      } of subnames) {
        const setSubnameTx = await nameGenerator.subname({
          label,
          namedOwner,
          subnameLabel,
          namedSubnameOwner,
          subnameFuses,
          subnameExpiry,
        })
        console.log(` - ${subnameLabel} (tx: ${setSubnameTx})...`)
        await viem.waitForTransactionSuccess(setSubnameTx)
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
