import { execSync } from 'child_process'
import concurrently from 'concurrently'
import path from 'path'

let sudopref = ''
let cleanupRunning = false

function cleanup(error = false, deployGraph, commands) {
  if (cleanupRunning) return
  cleanupRunning = true
  commands.forEach((cmd) => {
    let children = wrapTry(execSync, `pgrep -f "${cmd.command}"`)
    while (children) {
      const child = children
        .toString()
        .split('\n')
        .find((x) => parseInt(x))

      if (child) {
        const res = wrapTry(execSync, `pgrep -P ${child.trim()}`)
        wrapTry(execSync, `${sudopref}kill -9 ${child.trim()}`)
        if (res && !res.toString().includes('No such process')) {
          children = res
        } else {
          children = null
        }
      } else {
        children = null
      }
    }
    wrapTry(execSync, `${sudopref}kill -2 ${cmd.pid}`)
  })
  if (deployGraph) {
    execSync(`${sudopref}docker-compose down`, {
      cwd: path.resolve('./'),
    })
  }
  process.exit(error ? 1 : 0)
}

function wrapTry(fn, ...args) {
  try {
    return fn(...args)
  } catch {
    return
  }
}

export const main = (deployGraph, config) => {
  const cmdsToRun = []
  const inxsToFinishOnExit = []

  if (deployGraph) {
    cmdsToRun.push({
      command: 'docker-compose up',
      name: 'graph-docker',
      prefixColor: 'green.bold',
      cwd: path.resolve('./'),
    })
    if (config.graph.useSudo) {
      sudopref = 'sudo '
    }
  }

  config.scripts &&
    config.scripts.forEach((script, i) => {
      cmdsToRun.push(script)
      if (script.finishOnExit) {
        inxsToFinishOnExit.push(i)
      }
    })

  if (cmdsToRun.length > 0) {
    const { commands } = concurrently(cmdsToRun, { prefix: 'name' })

    commands.forEach((cmd) => {
      if (inxsToFinishOnExit.includes(cmd.index)) {
        cmd.close.subscribe(() => cleanup(false, deployGraph, commands))
      }
      cmd.error.subscribe(() => cleanup(true, deployGraph, commands))
    })
  }
}
