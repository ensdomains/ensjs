/* eslint-disable no-await-in-loop */

import type { Address } from 'viem'
import { beforeAll, describe, expect, it } from 'vitest'
import { publicClient, walletClient } from '../../test/addTestContracts.js'
import { GRACE_PERIOD_SECONDS } from '../../utils/consts.js'
import getExpiry from '../public/getExpiry.js'
import getOwner from '../public/getOwner.js'
import getWrapperData from '../public/getWrapperData.js'
import getNamesForAddress, {
  type NameWithRelation,
} from './getNamesForAddress.js'

let accounts: Address[]

beforeAll(async () => {
  accounts = await walletClient.getAddresses()
})

const user4 = '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65'
let expiry: bigint

describe('check that concurrent names all have the same expiry date', () => {
  it.each([
    ...Array.from({ length: 2 }, (_, i) => `concurrent-legacy-name-${i}.eth`),
    ...Array.from({ length: 4 }, (_, i) => {
      const index = Math.floor(i / 2)
      const isSubname = i % 2 === 1
      return isSubname
        ? `xyz.concurrent-wrapped-name-${index}.eth`
        : `concurrent-wrapped-name-${index}.eth`
    }),
  ])('%s', async (name) => {
    const ownerData = await getOwner(publicClient, { name })

    const owner = ownerData?.registrant ?? ownerData?.owner
    expect(owner).toEqual(user4)
    const expiryData = await getExpiry(publicClient, { name })
    const expiryValue = expiryData?.expiry?.value ?? 0n
    if (!expiry) expiry = expiryValue

    const wrapperData = await getWrapperData(publicClient, { name })
    const wrappedExpiryValue =
      (wrapperData?.expiry?.value || 0n) - BigInt(GRACE_PERIOD_SECONDS)
    const expectedExpiry =
      ownerData?.ownershipLevel === 'nameWrapper'
        ? wrappedExpiryValue
        : expiryValue
    expect(expectedExpiry).toEqual(expiry)
  })
})

it('returns with default values', async () => {
  const result = await getNamesForAddress(publicClient, {
    address: accounts[1],
  })

  expect(result).toBeTruthy()
  // arbitrary number, just to make sure we get some results
  expect(result.length).toBeGreaterThan(10)
})

it('has registration date on .eth names', async () => {
  const result = await getNamesForAddress(publicClient, {
    address: accounts[1],
  })
  if (!result.length) throw new Error('No names found')
  for (const name of result) {
    if (name.parentName === 'eth') {
      expect(name.registrationDate).toBeTruthy()
    }
  }
})

it('should get ascending names by expiry date correctly, including names with the same expiry date', async () => {
  const fullResults = await getNamesForAddress(publicClient, {
    address: accounts[4],
    orderBy: 'expiryDate',
    orderDirection: 'asc',
    pageSize: 100,
  })
  const expectedNames = fullResults.map((item) => item.name)

  const names = []
  let previousPage: NameWithRelation[] | undefined
  do {
    // eslint-disable-next-line no-await-in-loop
    const currentPage = await getNamesForAddress(publicClient, {
      address: accounts[4],
      orderBy: 'expiryDate',
      orderDirection: 'asc',
      pageSize: 3,
      previousPage,
    })
    names.push(...currentPage.map((item) => item.name))
    previousPage = currentPage
  } while (previousPage.length)

  expect(names).toEqual(expectedNames)
})

it('should get descending names by expiry date correctly, including names with the same expiry date', async () => {
  const fullResults = await getNamesForAddress(publicClient, {
    address: accounts[4],
    orderBy: 'expiryDate',
    orderDirection: 'desc',
    pageSize: 100,
  })
  const expectedNames = fullResults.map((item) => item.name)

  const names = []
  // initial result
  let previousPage: NameWithRelation[] | undefined
  do {
    // eslint-disable-next-line no-await-in-loop
    const currentPage = await getNamesForAddress(publicClient, {
      address: accounts[4],
      orderBy: 'expiryDate',
      orderDirection: 'desc',
      pageSize: 3,
      previousPage,
    })
    names.push(...currentPage.map((item) => item.name))
    previousPage = currentPage
  } while (previousPage.length)
  expect(names).toEqual(expectedNames)
})

it('should get ascending names by creation date correctly, including names with the same expiry date', async () => {
  const fullResults = await getNamesForAddress(publicClient, {
    address: accounts[4],
    orderBy: 'createdAt',
    orderDirection: 'asc',
    pageSize: 100,
  })
  const expectedNames = fullResults.map((item) => item.name)

  const names = []
  let previousPage: NameWithRelation[] | undefined
  do {
    // eslint-disable-next-line no-await-in-loop
    const currentPage = await getNamesForAddress(publicClient, {
      address: accounts[4],
      orderBy: 'createdAt',
      orderDirection: 'asc',
      pageSize: 3,
      previousPage,
    })
    names.push(...currentPage.map((item) => item.name))
    previousPage = currentPage
  } while (previousPage.length)

  expect(names).toEqual(expectedNames)
})

it('should get descending names by creation date correctly, including names with the same expiry date', async () => {
  const fullResults = await getNamesForAddress(publicClient, {
    address: accounts[4],
    orderBy: 'createdAt',
    orderDirection: 'desc',
    pageSize: 100,
  })
  const expectedNames = fullResults.map((item) => item.name)

  const names = []
  // initial result
  let previousPage: NameWithRelation[] | undefined
  do {
    // eslint-disable-next-line no-await-in-loop
    const currentPage = await getNamesForAddress(publicClient, {
      address: accounts[4],
      orderBy: 'createdAt',
      orderDirection: 'desc',
      pageSize: 3,
      previousPage,
    })
    names.push(...currentPage.map((item) => item.name))
    previousPage = currentPage
  } while (previousPage.length)
  expect(names).toEqual(expectedNames)
})

// describe('filter', () => {
//   it('filters by owner', async () => {
//     const result = await getNamesForAddress(publicClient, {
//       address: accounts[1],
//       filter: {
//         owner: true,
//         registrant: false,
//         resolvedAddress: false,
//         wrappedOwner: false,
//       },
//     })
//     if (!result.length) throw new Error('No names found')
//     for (const name of result) {
//       expect(name.owner).toBe(accounts[1])
//       expect(name.relation.owner).toBe(true)
//     }
//   })
//   it('filters by registrant', async () => {
//     const result = await getNamesForAddress(publicClient, {
//       address: accounts[1],
//       filter: {
//         owner: false,
//         registrant: true,
//         resolvedAddress: false,
//         wrappedOwner: false,
//       },
//     })
//     if (!result.length) throw new Error('No names found')
//     for (const name of result) {
//       expect(name.registrant).toBe(accounts[1])
//       expect(name.relation.registrant).toBe(true)
//     }
//   })
//   it('filters by resolved address', async () => {
//     const result = await getNamesForAddress(publicClient, {
//       address: accounts[1],
//       filter: {
//         owner: false,
//         registrant: false,
//         resolvedAddress: true,
//         wrappedOwner: false,
//       },
//     })
//     if (!result.length) throw new Error('No names found')
//     for (const name of result) {
//       expect(name.resolvedAddress).toBe(accounts[1])
//       expect(name.relation.resolvedAddress).toBe(true)
//     }
//   })
//   it('filters by wrapped owner', async () => {
//     const result = await getNamesForAddress(publicClient, {
//       address: accounts[1],
//       filter: {
//         owner: false,
//         registrant: false,
//         resolvedAddress: false,
//         wrappedOwner: true,
//       },
//     })
//     if (!result.length) throw new Error('No names found')
//     for (const name of result) {
//       expect(name.wrappedOwner).toBe(accounts[1])
//       expect(name.relation.wrappedOwner).toBe(true)
//     }
//   })
//   it('allows including expired names', async () => {
//     const result = await getNamesForAddress(publicClient, {
//       address: accounts[1],
//       filter: {
//         owner: true,
//         registrant: true,
//         resolvedAddress: true,
//         wrappedOwner: true,
//         allowExpired: true,
//       },
//     })
//     if (!result.length) throw new Error('No names found')
//     const expiredNames = result.filter(
//       (x) => x.expiryDate?.date && x.expiryDate.date < new Date(),
//     )
//     expect(expiredNames.length).toBeGreaterThan(0)
//   })
//   it('allows including reverse record', async () => {
//     const result = await getNamesForAddress(publicClient, {
//       address: accounts[2],
//       filter: {
//         owner: true,
//         registrant: true,
//         resolvedAddress: true,
//         wrappedOwner: true,
//         allowReverseRecord: true,
//       },
//     })
//     if (!result.length) throw new Error('No names found')
//     const reverseRecordNames = result.filter(
//       (x) => x.parentName === 'addr.reverse',
//     )
//     expect(reverseRecordNames.length).toBeGreaterThan(0)
//   })
//   it('does not include deleted names by default', async () => {
//     const result = await getNamesForAddress(publicClient, {
//       address: accounts[1],
//       pageSize: 1000,
//     })
//     if (!result.length) throw new Error('No names found')
//     const deletedNames = result.filter(
//       (x) => x.parentName === 'deletable.eth' && x.owner === EMPTY_ADDRESS,
//     )
//     expect(deletedNames.length).toBe(0)
//   })
//   it('allows including deleted names', async () => {
//     const result = await getNamesForAddress(publicClient, {
//       address: accounts[1],
//       pageSize: 1000,
//       filter: {
//         owner: true,
//         registrant: true,
//         resolvedAddress: true,
//         wrappedOwner: true,
//         allowDeleted: true,
//       },
//     })
//     if (!result.length) throw new Error('No names found')
//     const deletedNames = result.filter(
//       (x) => x.parentName === 'deletable.eth' && x.owner === EMPTY_ADDRESS,
//     )
//     expect(deletedNames.length).toBe(1)
//   })
//   it('filters by search string', async () => {
//     const result = await getNamesForAddress(publicClient, {
//       address: accounts[1],
//       pageSize: 1000,
//       filter: {
//         owner: true,
//         registrant: true,
//         resolvedAddress: true,
//         wrappedOwner: true,
//         searchString: 'test123',
//       },
//     })

//     if (!result.length) throw new Error('No names found')
//     for (const name of result) {
//       expect(name.labelName).toContain('test123')
//     }
//   })
//   it('filters by search string - name', async () => {
//     const result = await getNamesForAddress(publicClient, {
//       address: accounts[2],
//       pageSize: 1000,
//       filter: {
//         owner: true,
//         registrant: true,
//         resolvedAddress: true,
//         wrappedOwner: true,
//         searchString: 'wrapped-with-subnames',
//         searchType: 'name',
//       },
//     })

//     if (!result.length) throw new Error('No names found')
//     const subnames = result.filter(
//       (x) => x.parentName === 'wrapped-with-subnames.eth',
//     )
//     expect(subnames.length).toBeGreaterThan(0)
//   })
// })

// describe.each([
//   {
//     orderBy: 'name',
//     orderDirection: 'asc',
//     compareFn: (a: NameWithRelation, b: NameWithRelation) =>
//       (a.name || '').localeCompare(b.name || ''),
//   },
//   {
//     orderBy: 'name',
//     orderDirection: 'desc',
//     compareFn: (a: NameWithRelation, b: NameWithRelation) =>
//       (b.name || '').localeCompare(a.name || ''),
//   },
//   {
//     orderBy: 'labelName',
//     orderDirection: 'asc',
//     compareFn: (a: NameWithRelation, b: NameWithRelation) => {
//       const aLabelName = a.labelName || ''
//       const bLabelName = b.labelName || ''
//       return aLabelName.localeCompare(bLabelName)
//     },
//   },
//   {
//     orderBy: 'labelName',
//     orderDirection: 'desc',
//     compareFn: (a: NameWithRelation, b: NameWithRelation) => {
//       const aLabelName = a.labelName || ''
//       const bLabelName = b.labelName || ''
//       return bLabelName.localeCompare(aLabelName)
//     },
//   },
//   {
//     orderBy: 'expiryDate',
//     orderDirection: 'asc',
//     compareFn: (a: NameWithRelation, b: NameWithRelation) => {
//       const aExpiryDate = a.expiryDate?.value || Infinity
//       const bExpiryDate = b.expiryDate?.value || Infinity
//       return aExpiryDate - bExpiryDate
//     },
//   },
//   {
//     orderBy: 'expiryDate',
//     orderDirection: 'desc',
//     compareFn: (a: NameWithRelation, b: NameWithRelation) => {
//       const aExpiryDate = a.expiryDate?.value || Infinity
//       const bExpiryDate = b.expiryDate?.value || Infinity
//       return bExpiryDate - aExpiryDate
//     },
//   },
//   {
//     orderBy: 'createdAt',
//     orderDirection: 'asc',
//     compareFn: (a: NameWithRelation, b: NameWithRelation) => {
//       const aCreatedAt = a.createdAt.value
//       const bCreatedAt = b.createdAt.value
//       return aCreatedAt - bCreatedAt
//     },
//   },
//   {
//     orderBy: 'createdAt',
//     orderDirection: 'desc',
//     compareFn: (a: NameWithRelation, b: NameWithRelation) => {
//       const aCreatedAt = a.createdAt.value
//       const bCreatedAt = b.createdAt.value
//       return bCreatedAt - aCreatedAt
//     },
//   },
// ])(
//   'filters by $orderBy $orderDirection',
//   ({ orderBy, orderDirection, compareFn }) => {
//     it('is consistent between full result and paginated results', async () => {
//       const fullResult = await getNamesForAddress(publicClient, {
//         address: accounts[1],
//         orderBy: orderBy as any,
//         orderDirection: orderDirection as any,
//         pageSize: 1000,
//       })
//       if (!fullResult.length) throw new Error('No names found')
//       const paginatedResults = []
//       let lastResult: NameWithRelation[] = []
//       do {
//         const result = await getNamesForAddress(publicClient, {
//           address: accounts[1],
//           orderBy: orderBy as any,
//           orderDirection: orderDirection as any,
//           previousPage: lastResult,
//           pageSize: 5,
//         })
//         paginatedResults.push(...result)
//         lastResult = result
//       } while (lastResult.length)

//       expect(paginatedResults.length).toBe(fullResult.length)
//       expect(paginatedResults).toStrictEqual(fullResult)
//     })
//     it('is sorted correctly', async () => {
//       const fullResult = await getNamesForAddress(publicClient, {
//         address: accounts[1],
//         orderBy: orderBy as any,
//         orderDirection: orderDirection as any,
//         pageSize: 1000,
//       })
//       if (!fullResult.length) throw new Error('No names found')
//       const sortedResult = [...fullResult].sort(compareFn)
//       expect(fullResult).toEqual(sortedResult)
//     })
//     /// /////////////////
//     // it('more than 1 page (30 expiry names)', async () => {
//     //   const fullResult = await getNamesForAddress(publicClient, {
//     //     address: accounts[1],
//     //     orderBy: orderBy as any,
//     //     orderDirection: orderDirection as any,
//     //     pageSize: 20,
//     //   })
//     //   console.log(fullResult)
//     //   if (!fullResult.length) throw new Error('No names found')
//     //   const sortedResult = [...fullResult].sort(compareFn)
//     //   expect(fullResult).toEqual(sortedResult)
//     // })
//     // it('more than 1 page (30 same expiry names)', async () => {
//     //   const fullResult = await getNamesForAddress(publicClient, {
//     //     address: accounts[1],
//     //     orderBy: orderBy as any,
//     //     orderDirection: orderDirection as any,
//     //     pageSize: 20,
//     //   })
//     //   console.log(fullResult)
//     //   if (!fullResult.length) throw new Error('No names found')
//     //   const sortedResult = [...fullResult].sort(compareFn)
//     //   expect(fullResult).toEqual(sortedResult)
//     // })
//     // it('more than 1 page (30 non-expiry names)', async () => {
//     //   const fullResult = await getNamesForAddress(publicClient, {
//     //     address: accounts[1],
//     //     orderBy: orderBy as any,
//     //     orderDirection: orderDirection as any,
//     //     pageSize: 20,
//     //   })
//     //   console.log(fullResult)
//     //   if (!fullResult.length) throw new Error('No names found')
//     //   const sortedResult = [...fullResult].sort(compareFn)
//     //   expect(fullResult).toEqual(sortedResult)
//     // })
//     // it('mix names (30 expiry, 10 non-expiry)', async () => {
//     //   const fullResult = await getNamesForAddress(publicClient, {
//     //     address: accounts[1],
//     //     orderBy: orderBy as any,
//     //     orderDirection: orderDirection as any,
//     //     pageSize: 20,
//     //   })
//     //   console.log(fullResult)
//     //   if (!fullResult.length) throw new Error('No names found')
//     //   const sortedResult = [...fullResult].sort(compareFn)
//     //   expect(fullResult).toEqual(sortedResult)
//     // })
//     // it('mix names (30 same expiry, 10 expiry)', async () => {
//     //   const fullResult = await getNamesForAddress(publicClient, {
//     //     address: accounts[1],
//     //     orderBy: orderBy as any,
//     //     orderDirection: orderDirection as any,
//     //     pageSize: 20,
//     //   })
//     //   console.log(fullResult)
//     //   if (!fullResult.length) throw new Error('No names found')
//     //   const sortedResult = [...fullResult].sort(compareFn)
//     //   expect(fullResult).toEqual(sortedResult)
//     // })
//     // it('mix names (30 same expiry , 10 no-expiry)', async () => {
//     //   const fullResult = await getNamesForAddress(publicClient, {
//     //     address: accounts[1],
//     //     orderBy: orderBy as any,
//     //     orderDirection: orderDirection as any,
//     //     pageSize: 20,
//     //   })
//     //   console.log(fullResult)
//     //   if (!fullResult.length) throw new Error('No names found')
//     //   const sortedResult = [...fullResult].sort(compareFn)
//     //   expect(fullResult).toEqual(sortedResult)
//     // })
//     /// //////////////////
//   },
// )
