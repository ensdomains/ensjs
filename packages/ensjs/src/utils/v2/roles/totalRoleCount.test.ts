import { expect, it } from 'vitest'
import { totalRoleCount } from './totalRoleCount.js'

it('returns a total role count from a role bitmap', () => {
  expect(
    totalRoleCount(358292832037329894457564098653916839351955968n),
  ).toEqual(8)
})

it('should return 0 for an empty bitmap', () => {
  expect(totalRoleCount(0)).toEqual(0)
})
