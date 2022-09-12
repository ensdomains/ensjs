import { ENS } from '..'
import setup from '../tests/setup'

let ENSInstance: ENS

beforeAll(async () => {
  ;({ ENSInstance } = await setup())
})

const testProperties = (obj: object, ...properties: string[]) =>
  properties.map((property) => expect(obj).toHaveProperty(property))

describe('getSubnames', () => {

  it('should get the subnames for a name', async () => {
    const result = await ENSInstance.getSubnames({
      name: 'get-subnames.eth',
      page: 0,
      pageSize: 10,
      orderBy: 'createdAt',
      orderDirection: 'desc',
      lastSubnames: [{ createdAt: Math.floor(Date.now()/1000) }],
    })
    expect(result).toBeTruthy()
    if (result) {
      console.log(result)
      expect(result.subnames.length).toBe(2)
      expect(result.subnameCount).toBe(2)
      expect(result.subnames[0].name).toEqual('test.with-subnames.eth')
      expect(result.subnames[1].name).toEqual('test2.with-subnames.eth')
      testProperties(
        result.subnames[0],
        'id',
        'labelName',
        'labelhash',
        'name',
        'isMigrated',
        'owner',
        'truncatedName',
      )
    }
  })
})
