import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const newVersion = process.argv[2]

if (!newVersion) throw new Error('No version specified')

// change version in package.json
execSync(`pnpm version --no-workspaces-update ${newVersion}`, {
  stdio: 'inherit',
})

// Writes the new version to `./src/errors/version.ts`.
const versionFilePath = path.join(
  import.meta.dirname,
  '../src/errors/version.ts',
)

fs.writeFileSync(versionFilePath, `export const version = '${newVersion}'\n`)
