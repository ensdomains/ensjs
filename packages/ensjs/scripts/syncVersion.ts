import fs from 'node:fs'
import path from 'node:path'

// Writes the version from `package.json` to `./src/errors/version.ts`.
const packageJson = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, '../package.json'), 'utf8'),
)

const versionFilePath = path.join(
  import.meta.dirname,
  '../src/errors/version.ts',
)

fs.writeFileSync(
  versionFilePath,
  `export const version = '${packageJson.version}'\n`,
)
