#!/usr/bin/env node

/* eslint-disable */

import { Command, Option } from 'commander'
import path from 'node:path'
import { emitKeypressEvents } from 'node:readline'
import { main as fetchData } from './fetch-data.js'
import { main as manager } from './manager.js'
import { main as subgraph } from './subgraph.js'

let config
const program = new Command()

const __dirname = new URL('.', import.meta.url).pathname
const cwd = process.cwd()

program
  .name('ens-test-env')
  .description('A testing environment for everything ENS')
  .version(process.env.npm_package_version || '0.1.0')
  .option('-c, --config <path>', 'Specify config directory')
  .option('-a, --always-cleanup', 'Always cleanup after running')
  .hook('preAction', async () => {
    if (program.optsWithGlobals().alwaysCleanup) {
      emitKeypressEvents(process.stdin)
      if (process.stdin.isTTY) process.stdin.setRawMode(true)
      process.stdin.on('keypress', (char, key) => {
        if (key.ctrl && key.name === 'c') {
          process.kill(process.pid, 'SIGINT')
        }
      })
    }
    // if config arg supplied, get config path as next arg
    const configDir = program.optsWithGlobals().config
    // if config arg, try load config
    if (configDir) {
      try {
        config = (await import(path.join(process.cwd(), configDir))).default
      } catch {
        program.error(`Config file ${configDir} not found`)
      }
    } else {
      config = (
        await import(path.join(process.cwd(), 'ens-test-env.config.js'))
      ).default
    }
    // if config doesn't have all data, throw error
    if (!config) {
      program.error('No valid config found')
      return help()
    }
    // add default paths to config, and let them be replaced by specified vars
    const paths = {
      data: path.resolve(cwd, './data'),
      archive: path.resolve(cwd, './archive'),
      composeFile: path.resolve(__dirname, './docker-compose.yml'),
    }
    const configPaths = config.paths || {}
    for (const [key, value] of Object.entries(configPaths)) {
      if (typeof value === 'string') {
        paths[key] = path.resolve(cwd, value)
      }
    }
    config.paths = paths
  })

program
  .command('start')
  .description('Starts the test environment')
  .addOption(new Option('-nr, --no-reset', "Don't reset the data folder"))
  .addOption(
    new Option('-s, --save', 'Save data when exiting').implies({
      killGracefully: true,
      verbosity: 1,
    }),
  )
  .addOption(
    new Option(
      '--extra-time <time>',
      'Sets the relative extra time for deploys',
    ).conflicts('save'),
  )
  .addOption(new Option('-ng, --no-graph', "Don't start the graph"))
  .addOption(new Option('-k, --kill-gracefully', 'Kill gracefully'))
  .addOption(new Option('-nb, --no-build', "Don't run the build command"))
  .addOption(new Option('-ns, --no-scripts', "Don't run the scripts"))
  .addOption(
    new Option('--verbosity <level>', 'Verbose output level (0-2').default(0),
  )
  .action(async (options) => {
    if (options.save) {
      await fetchData('clean', config)
    } else if (options.reset) {
      await fetchData('load', config)
    }
    manager(config, options)
  })

program
  .command('kill')
  .description('Forcefully kills the test environment')
  .action(async () => {
    manager(config, {}, true)
  })

program
  .command('load')
  .description('Fetches data from archive')
  .action(async () => {
    await fetchData('load', config)
  })

program
  .command('save')
  .description('Saves data folder to an archive')
  .action(async () => {
    await fetchData('compress', config)
  })

program
  .command('subgraph')
  .description('Saves the deployment addresses to a subgraph file')
  .option('-d, --directory <path>', 'The subgraph directory', '../ens-subgraph')
  .option(
    '--env <path>',
    'The environment file with the deployment addresses',
    '.env.local',
  )
  .option(
    '--var <name>',
    'The variable name in the environment file',
    'DEPLOYMENT_ADDRESSES',
  )
  .action(async (options) => {
    subgraph(options)
  })

program.parse(process.argv)
