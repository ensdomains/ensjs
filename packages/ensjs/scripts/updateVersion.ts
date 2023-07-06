import { execSync } from 'child_process'
import fs from 'fs-extra'
import path from 'path'
import * as url from 'url'

const newVersion = process.argv[2]

if (!newVersion) throw new Error('No version specified')

// change version in package.json
execSync(`pnpm version --no-workspaces-update ${newVersion}`, {
  stdio: 'inherit',
})

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

// Writes the new version to `./src/errors/version.ts`.
const versionFilePath = path.join(__dirname, '../src/errors/version.ts')

fs.writeFileSync(versionFilePath, `export const version = '${newVersion}'\n`)
