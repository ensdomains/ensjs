import { config } from 'dotenv'

config({ path: `${process.env.INIT_CWD}/.env.local` })
config({
  path: `${process.env.INIT_CWD}/.env`,
  override: true,
})

process.env.ADDRESS_ETH_REGISTRAR = '0xc5a5C42992dECbae36851359345FE25997F5C42d'
process.env.ADDRESS_NAME_WRAPPER = '0x9E545E3C0baAB3E08CdfD552C960A1050f373042'
process.env.BATCH_GATEWAY_URLS = JSON.stringify([
  'https://universal-offchain-unwrapper.ens-cf.workers.dev/',
])

/**
 * @type {import('@ensdomains/ens-test-env').ENSTestEnvConfig}
 * */
export default {
  deployCommand: 'pnpm hh deploy',
  scripts: [
    {
      command:
        process.env.STATIC_ENS === 'true' ? 'pnpm test:static' : 'pnpm test',
      name: 'vitest',
      prefixColor: 'yellow.bold',
      finishOnExit: true,
    },
  ],
}
