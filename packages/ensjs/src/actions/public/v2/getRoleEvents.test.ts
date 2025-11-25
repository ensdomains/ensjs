import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { getRoleAccounts } from './getRoleAccounts.js'

const client = createPublicClient({
  chain: sepolia,
  transport: http(
    'https://lb.drpc.live/sepolia/AnmpasF2C0JBqeAEzxVO8aRo7Ju0xlER8JS4QmlfqV1j',
  ),
})

const events = await getRoleAccounts(client, {
  label: 'raffy',
  fromBlock: 9683977n,
  registryAddress: '0x0f3eb298470639a96bd548cea4a648bc80b2cee2',
})

console.log(events)
