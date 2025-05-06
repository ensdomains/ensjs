/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-await-in-loop */
// eslint-disable-next-line @typescript-eslint/naming-convention
const { BigNumber } = require('ethers')
const { ethers } = require('hardhat')
const {
  makeNameGenerator: makeWrappedNameGenerator,
} = require('../utils/wrappedNameGenerator.cjs')
const {
  makeNameGenerator: makeLegacyNameGenerator,
} = require('../utils/legacyNameGenerator.cjs')
const { makeNonceManager } = require('../utils/nonceManager.cjs')
const { encodeFuses } = require('../dist/cjs/utils/fuses')
const { MAX_DATE_INT } = require('../dist/cjs/utils/consts')

const DURATION = 31556000

/**
 * @type {{
 *  label: string
 *  namedOwner: string
 *  namedAddr?: string
 *  type: 'wrapped' | 'legacy'
 *  data?: any[]
 *  reverseRecord?: boolean
 *  fuses?: number
 *  subnames?: {
 *    label: string
 *    namedOwner: string
 *    fuses?: number
 *    expiry?: number
 *  }[]
 *  duration?: number | BigNumber
 * }[]}
 */

const names = [
  ...Array.from({ length: 2 }, (_, index) => ({
    label: `concurrent-legacy-name-${index}`,
    type: 'legacy',
    namedOwner: 'owner4',
    reverseRecord: true,
    duration: DURATION,
  })),
  ...Array.from({ length: 2 }, (_, index) => ({
    label: `concurrent-wrapped-name-${index}`,
    type: 'wrapped',
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
        type: 'wrapped',
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

/**
 * @type {import('hardhat-deploy/types').DeployFunction}
 */
const func = async (hre) => {
  const { network } = hre

  const nonceManager = await makeNonceManager(hre)
  const wrappedNameGenerator = await makeWrappedNameGenerator(hre, nonceManager)
  const legacyNameGenerator = await makeLegacyNameGenerator(hre, nonceManager)

  await network.provider.send('evm_setAutomine', [false])

  // Commit
  const commitTxs = await Promise.all(
    names.map(
      ({
        label,
        type,
        namedOwner,
        namedAddr = namedOwner,
        data = [],
        reverseRecord = false,
        fuses = 0,
        duration = 31536000,
      }) => {
        console.log(`Committing commitment for ${label}.eth...`)
        if (type === 'legacy')
          return legacyNameGenerator.commit({
            label,
            namedOwner,
            namedAddr,
          })
        return wrappedNameGenerator.commit({
          label,
          namedOwner,
          data,
          reverseRecord,
          fuses,
          duration,
        })
      },
    ),
  )

  network.provider.send('evm_mine')
  await Promise.all(
    commitTxs.map(async (tx) => {
      return tx.wait()
    }),
  )

  const oldTimestamp = (await ethers.provider.getBlock('latest')).timestamp
  await network.provider.send('evm_setNextBlockTimestamp', [oldTimestamp + 60])
  await network.provider.send('evm_increaseTime', [300])
  await network.provider.send('evm_mine')

  // Register
  const registerTxs = await Promise.all(
    names.map(
      ({
        label,
        type,
        namedOwner,
        namedAddr = namedOwner,
        data = [],
        reverseRecord = false,
        fuses = 0,
        duration = 31536000,
      }) => {
        if (type === 'legacy')
          return legacyNameGenerator.register({
            label,
            namedOwner,
            namedAddr,
            duration,
          })
        return wrappedNameGenerator.register({
          label,
          namedOwner,
          data,
          reverseRecord,
          fuses,
          duration,
        })
      },
    ),
  )

  await network.provider.send('evm_mine')
  await Promise.all(
    registerTxs.map(async (tx) => {
      return tx.wait()
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
      expiry: subnameExpiry = BigNumber.from(2).pow(64).sub(1),
    } of subnames) {
      let setSubnameTx
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
      console.log(` - ${subnameLabel} (tx: ${setSubnameTx.hash})...`)
      await setSubnameTx.wait()
    }
  }

  await network.provider.send('evm_mine')
  return true
}

func.id = 'register-concurrent-names'
func.tags = ['register-concurrent-names']
func.dependencies = ['ETHRegistrarController', 'register-wrapped-names']
func.runAtTheEnd = true

module.exports = func
