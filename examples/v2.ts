import { addEnsContracts } from '@ensdomains/ensjs'
import {
  getNameRegistries,
  getNameRolesForAccount,
  getOwner,
  getResource,
  getRoleCounts,
  getTokenId,
  hasRoles,
} from '@ensdomains/ensjs/public/v2'
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http('https://ethereum-rpc.publicnode.com'),
})

const registries = await getNameRegistries(client, { name: 'eth' })
console.log('Registries:', registries)
const leafRegistry = registries.at(-1)
if (!leafRegistry) throw new Error('No registry found for name')

const owner = await getOwner(client, { name: 'eth' })
console.log('Owner:', owner)

console.log(
  'Token id:',
  await getTokenId(client, { label: 'eth', registryAddress: leafRegistry }),
)
console.log(
  'Resource:',
  await getResource(client, { label: 'eth', registryAddress: leafRegistry }),
)

console.log(
  'Role counts:',
  await getRoleCounts(client, { registryAddress: leafRegistry, label: 'eth' }),
)
console.log(
  'Roles for owner:',
  await getNameRolesForAccount(client, {
    registryAddress: leafRegistry,
    account: owner,
    label: 'eth',
  }),
)
console.log(
  'Owner has ROLE_SET_RESOLVER:',
  await hasRoles(client, {
    registryAddress: leafRegistry,
    label: 'eth',
    roles: ['ROLE_SET_RESOLVER'],
    account: owner,
  }),
)
