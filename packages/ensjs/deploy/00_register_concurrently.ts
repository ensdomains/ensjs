import type { DeployFunction } from 'hardhat-deploy/dist/types.js'
import { MAX_DATE_INT } from '../dist/utils/consts.js'
import { encodeFuses } from '../dist/utils/fuses.js'

import type { Hash } from 'viem'
import { makeNameGenerator as makeLegacyNameGenerator } from '../utils/legacyNameGenerator.js'
import { makeNonceManager } from '../utils/nonceManager.js'
import { makeNameGenerator as makeWrappedNameGenerator } from '../utils/wrappedNameGenerator.js'

const DURATION = 31556000

const names: {
  label: string
  namedOwner: string
  namedAddr?: string
  type: 'wrapped' | 'legacy'
  // biome-ignore lint/suspicious/noExplicitAny: deployment script only
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
  ...Array.from({ length: 2 }, (_, index) => ({
    label: `concurrent-legacy-name-${index}`,
    type: 'legacy' as const,
    namedOwner: 'owner4',
    reverseRecord: true,
    duration: DURATION,
  })),
  ...Array.from({ length: 2 }, (_, index) => ({
    label: `concurrent-wrapped-name-${index}`,
    type: 'wrapped' as const,
    namedOwner: 'owner4',
    fuses: encodeFuses({
      input: {
        child: {
          named: ['CANNOT_UNWRAP'],
        },
      },
    }),
    duration: DURATION,
    subnames: [
      {
        label: 'xyz',
        namedOwner: 'owner4',
        type: 'wrapped' as const,
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

  const nonceManager = await makeNonceManager(hre)
  const wrappedNameGenerator = await makeWrappedNameGenerator(hre, nonceManager)
  const legacyNameGenerator = await makeLegacyNameGenerator(hre, nonceManager)

  await network.provider.send('evm_setAutomine', [false])

  // Commit
  const commitTxs: Hash[] = []
  for (const {
    label,
    type,
    namedOwner,
    namedAddr = namedOwner,
    data = [],
    reverseRecord = false,
    fuses = 0,
    duration = 31536000,
  } of names) {
    console.log(`Committing commitment for ${label}.eth...`)
    let tx: Hash
    if (type === 'legacy') {
      tx = await legacyNameGenerator.commit({
        label,
        namedOwner,
        namedAddr,
      })
    } else {
      tx = await wrappedNameGenerator.commit({
        label,
        namedOwner,
        data,
        reverseRecord,
        fuses,
        duration,
      })
    }
    commitTxs.push(tx)
  }

  network.provider.send('evm_mine')
  await Promise.all(
    commitTxs.map(async (tx) => {
      return viem.waitForTransactionSuccess(tx)
    }),
  )

  const oldTimestamp = (
    await (await viem.getPublicClient()).getBlock({ blockTag: 'latest' })
  ).timestamp
  await network.provider.send('evm_setNextBlockTimestamp', [
    Number(oldTimestamp + 60n),
  ])
  await network.provider.send('evm_increaseTime', [300])
  await network.provider.send('evm_mine')

  // Register
  const registerTxs: Hash[] = []
  for (const {
    label,
    type,
    namedOwner,
    namedAddr = namedOwner,
    data = [],
    reverseRecord = false,
    fuses = 0,
    duration = 31536000,
  } of names) {
    let tx: Hash
    if (type === 'legacy') {
      tx = await legacyNameGenerator.register({
        label,
        namedOwner,
        namedAddr,
        duration,
      })
    } else {
      tx = await wrappedNameGenerator.register({
        label,
        namedOwner,
        data,
        reverseRecord,
        fuses,
        duration,
      })
    }
    registerTxs.push(tx)
  }

  await network.provider.send('evm_mine')
  await Promise.all(
    registerTxs.map(async (tx: Hash) => {
      return viem.waitForTransactionSuccess(tx)
    }),
  )

  await network.provider.send('evm_setAutomine', [true])

  // Create subnames
  for (const { label, namedOwner, type, subnames } of names) {
    if (!subnames) continue
    console.log(`Setting subnames for ${label}.eth...`)
    for (const {
      label: subnameLabel,
      namedOwner: namedSubnameOwner,
      fuses: subnameFuses = 0,
      expiry: subnameExpiry = 2n ** 64n - 1n,
    } of subnames) {
      let setSubnameTx: Hash
      if (type === 'legacy')
        setSubnameTx = await legacyNameGenerator.subname({
          label,
          namedOwner,
          subnameLabel,
          namedSubnameOwner,
        })
      else
        setSubnameTx = await wrappedNameGenerator.subname({
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

  await network.provider.send('evm_mine')
  return true
}

func.id = 'register-concurrent-names'
func.tags = ['register-concurrent-names']
func.dependencies = ['ETHRegistrarController', 'register-wrapped-names']
func.runAtTheEnd = true

export default func
