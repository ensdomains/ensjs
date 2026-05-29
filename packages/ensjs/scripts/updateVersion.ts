import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const newVersion = process.argv[2]

if (!newVersion) throw new Error('No version specified')

// change version in package.json
// `--no-git-tag-version` skips the commit + tag that `pnpm version` would
// otherwise make (release.yml does its own commit after this script writes
// version.ts). `--no-git-checks` lets the bump run even if the working tree
// has uncommitted changes. Non-recursive `pnpm version` only touches the
// current package in pnpm 11, replacing the old `--no-workspaces-update`.
execSync(`pnpm version --no-git-tag-version --no-git-checks ${newVersion}`, {
  stdio: 'inherit',
})

// Writes the new version to `./src/errors/version.ts`.
const versionFilePath = path.join(
  import.meta.dirname,
  '../src/errors/version.ts',
)

fs.writeFileSync(versionFilePath, `export const version = '${newVersion}'\n`)
