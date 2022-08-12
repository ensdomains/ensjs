import { spawn } from 'child_process'
import concurrently from 'concurrently'
import compose from 'docker-compose'
import fs from 'fs'
import fetch from 'node-fetch'
import path from 'path'
import { Transform } from 'stream'
import waitOn from 'wait-on'
import { main as fetchData } from './fetch-data.js'

const outputsToIgnore = [
  Buffer.from('eth_getBlockByNumber'),
  Buffer.from('eth_getBlockByHash'),
  Buffer.from('eth_getTransactionReceipt'),
]

let cleanupRunning = false
let opts = {
  log: true,
  composeOptions: ['-p', 'ens-test-env'],
}

let commands
let options
let config

const batchRpcFetch = (items) =>
  fetch('http://localhost:8545', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(
      items.map((item, i) => ({ jsonrpc: '2.0', id: i + 1, ...item })),
    ),
  }).then((res) => res.json())

const rpcFetch = (method, params) =>
  batchRpcFetch([{ method, params }]).then((res) => res[0])

async function cleanup(_, exitCode) {
  let force = false
  if (cleanupRunning) {
    if (exitCode === 'SIGINT') {
      force = true
    } else {
      return
    }
  }
  cleanupRunning = true
  if (!(options && options.killGracefully) || force) {
    await compose.kill({
      ...opts,
      log: false,
    })
    if (force) return process.exit(exitCode ? 1 : 0)
    await compose.rm({
      ...opts,
      log: false,
    })
  } else {
    if (options.save) {
      await rpcFetch('anvil_dumpState', []).then((res) =>
        fs.writeFileSync(
          path.resolve(config.paths.data, './.state'),
          res.result,
        ),
      )
    }
    await compose
      .down({
        ...opts,
        log: false,
      })
      .then(() =>
        compose.rm({
          ...opts,
          log: false,
        }),
      )
      .catch(() => {})
    if (options.save) {
      await fetchData('compress', config)
    }
  }

  commands &&
    commands.forEach((command) => {
      try {
        process.kill(command.pid, 'SIGKILL')
      } catch {}
    })

  process.exit(exitCode ? 1 : 0)
}

const prefix = Buffer.from('\x1b[1;34m[deploy]\x1b[0m ')

const prepender = new Transform({
  transform(chunk, _, done) {
    this._rest =
      this._rest && this._rest.length
        ? Buffer.concat([this._rest, chunk])
        : chunk

    let index

    // As long as we keep finding newlines, keep making slices of the buffer and push them to the
    // readable side of the transform stream
    while ((index = this._rest.indexOf('\n')) !== -1) {
      // The `end` parameter is non-inclusive, so increase it to include the newline we found
      const line = this._rest.slice(0, ++index)
      // `start` is inclusive, but we are already one char ahead of the newline -> all good
      this._rest = this._rest.slice(index)
      // We have a single line here! Prepend the string we want
      this.push(Buffer.concat([prefix, line]))
    }

    return void done()
  },

  // Called before the end of the input so we can handle any remaining
  // data that we have saved
  flush(done) {
    // If we have any remaining data in the cache, send it out
    if (this._rest && this._rest.length) {
      return void done(null, Buffer.concat([prefix, this._rest]))
    }
  },
})

const awaitCommand = (command) => {
  const allArgs = command.split(' ')
  const deploy = spawn(allArgs.shift(), allArgs, {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'pipe',
    shell: true,
  })
  deploy.stdout.pipe(prepender).pipe(process.stdout)
  return new Promise((resolve) => deploy.on('exit', () => resolve()))
}

export const main = async (_config, _options, justKill) => {
  config = _config
  options = _options

  opts.cwd = config.paths.composeFile.split('/docker-compose.yml')[0]

  opts.env = {
    DATA_FOLDER: config.paths.data,
    ...process.env,
  }

  if (justKill) {
    return cleanup(undefined, 'SIGINT')
  }

  try {
    await compose.upOne('anvil', opts)
  } catch {}

  compose
    .logs(['anvil', 'graph-node', 'postgres', 'ipfs', 'metadata'], {
      ...opts,
      log: false,
      follow: true,
      callback: (chunk, source) => {
        if (source === 'stderr') {
          process.stderr.write(chunk)
        } else {
          for (let i = 0; i < outputsToIgnore.length; i++) {
            if (chunk.includes(outputsToIgnore[i])) return
          }
          process.stdout.write(chunk)
        }
      },
    })
    .catch(() => {})

  const inxsToFinishOnExit = []
  const cmdsToRun = (config.scripts || []).map(
    ({ finishOnExit, ...script }) => {
      finishOnExit && inxsToFinishOnExit.push
      return script
    },
  )

  if (cleanupRunning) return

  await waitOn({ resources: ['tcp:localhost:8545'] })
  if (config.deployCommand && options.save) {
    await awaitCommand(config.deployCommand)
  } else {
    const state = fs.readFileSync(path.resolve(config.paths.data, './.state'), {
      encoding: 'utf8',
    })
    await rpcFetch('anvil_loadState', [state])
  }

  if (config.buildCommand && options.build) {
    await awaitCommand(config.buildCommand)
  }

  if (cleanupRunning) return

  if (options.graph) {
    try {
      await compose.upAll(opts)
    } catch {}

    await waitOn({ resources: ['http://localhost:8040'] })

    if (options.save) {
      const internalHashes = [
        {
          hash: '0x9dd2c369a187b4e6b9c402f030e50743e619301ea62aa4c0737d4ef7e10a3d49',
          label: 'xyz',
        },
        {
          hash: '0x4f5b812789fc606be1b3b16908db13fc7a9adf7ca72641f84d75b47069d3d7f0',
          label: 'eth',
        },
        {
          hash: '0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658',
          label: 'test',
        },
        {
          hash: '0xb7ccb6878fbded310d2d05350bca9c84568ecb568d4b626c83e0508c3193ce89',
          label: 'legacy',
        },
        {
          hash: '0xe5e14487b78f85faa6e1808e89246cf57dd34831548ff2e6097380d98db2504a',
          label: 'addr',
        },
        {
          hash: '0xdec08c9dbbdd0890e300eb5062089b2d4b1c40e3673bbccb5423f7b37dcf9a9c',
          label: 'reverse',
        },
      ]

      const allHashes = [...internalHashes, ...(config.labelHashes || [])]

      await compose.exec(
        'postgres',
        [
          'psql',
          '-U',
          'graph-node',
          'graph-node',
          '-c',
          `INSERT INTO public.ens_names (hash, name) VALUES ${allHashes
            .map(({ hash, label }) => `('${hash}', '${label}')`)
            .join(', ')};`,
        ],
        {
          ...opts,
        },
      )
    }
  }

  if (cmdsToRun.length > 0 && options.scripts) {
    /**
     * @type Promise<CloseEvent[]>
     **/
    let result
    ;({ commands, result } = concurrently(cmdsToRun, {
      prefix: 'name',
    }))

    commands.forEach((cmd) => {
      if (inxsToFinishOnExit.includes(cmd.index)) {
        cmd.close.subscribe(cleanup.bind(null, { cleanup: true }))
      }
      cmd.error.subscribe(cleanup.bind(null, { exit: true }))
    })

    await result.catch(cleanup.bind(null, { exit: true }))
  }
}

//do something when app is closing
process.on('exit', cleanup.bind(null, { cleanup: true }))

//catches ctrl+c event
process.on('SIGINT', cleanup.bind(null, { exit: true }))
