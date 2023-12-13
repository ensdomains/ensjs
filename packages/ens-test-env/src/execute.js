/* eslint-disable */
import compose from 'docker-compose'
import path from 'path'
import { URL as URLClass } from 'url'

const __dirname = new URLClass('.', import.meta.url).pathname

export const rewindSubgraph = async ({ blockNumber, blockHash }) => {
  const dockerComposeFile = path.resolve(__dirname, './docker-compose.yml')
  const composeOpts = {
    log: true,
    composeOptions: ['-p', 'ens-test-env'],
    config: dockerComposeFile,
  }
  const items = await compose.ps({ ...composeOpts, log: false })
  if (items.data.services.length === 0) {
    throw new Error('No services running')
  }
  await compose.exec(
    'graph-node',
    `graphman --config /opt/graph-node/config.toml rewind ${blockHash} ${blockNumber} graphprotocol/ens --force --sleep 1`,
    composeOpts,
  )
}
