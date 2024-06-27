import { execSync } from 'child_process'
import fs from 'node:fs'
import path from 'path'
import * as url from 'url'

// get branch name from local git command
const branchName = execSync('git rev-parse --abbrev-ref HEAD')
  .toString('utf-8')
  .replace(/\//g, '-')
  .trim()

// timestamp
const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, -1)

const newVersion = `0.0.0-${branchName}.${timestamp}`

// // change version in package.json
execSync(`pnpm version --no-workspaces-update ${newVersion}`, {
  stdio: 'inherit',
})

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

// // Writes the new version to `./src/errors/version.ts`.
const versionFilePath = path.join(__dirname, '../src/errors/version.ts')

fs.writeFileSync(versionFilePath, `export const version = '${newVersion}'\n`)
