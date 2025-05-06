// from https://github.com/wagmi-dev/viem/blob/main/scripts/prepublishOnly.ts

import fs from 'node:fs'
import path from 'node:path'
import * as url from 'node:url'
/* eslint-disable no-continue */
import jsonFs from 'jsonfile'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

type Exports = {
  [key: string]: string | { types?: string; import: string; default: string }
}

// Generates a package.json to be published to NPM with only the necessary fields.
function generatePackageJson() {
  const packageJsonPath = path.join(__dirname, '../package.json')
  const tmpPackageJson = jsonFs.readFileSync(packageJsonPath)

  jsonFs.writeFileSync(`${packageJsonPath}.tmp`, tmpPackageJson, { spaces: 2 })

  const {
    name,
    description,
    dependencies,
    peerDependencies,
    peerDependenciesMeta,
    version,
    files,
    exports: exports_,
    // NOTE: We explicitly don't want to publish the type field. We create a separate package.json for `dist/cjs` and `dist/esm` that has the type field.
    // type,
    main,
    module,
    types,
    typings,
    typesVersions,
    sideEffects,
    license,
    repository,
    authors,
    keywords,
  } = tmpPackageJson

  // Generate proxy packages for each export.
  const files_ = [...files]
  for (const [key, value] of Object.entries(exports_ as Exports)) {
    if (typeof value === 'string') continue
    if (key === '.') continue
    if (!value.default || !value.import)
      throw new Error('`default` and `import` are required.')
    if (!fs.existsSync(key)) fs.mkdirSync(key)
    if (!fs.existsSync(`${key}/package.json`))
      fs.writeFileSync(
        `${key}/package.json`,
        `{
  ${Object.entries(value)
    .map(([k, v]) => {
      const key_ = (() => {
        if (k === 'import') return 'module'
        if (k === 'default') return 'main'
        if (k === 'types') return 'types'
        throw new Error('Invalid key')
      })()
      return `"${key_}": "${v.replace('./', '../')}"`
    })
    .join(',\n  ')}
}`,
      )
    files_.push(key.replace('./', ''))
  }

  jsonFs.writeFileSync(
    packageJsonPath,
    {
      name,
      description,
      dependencies,
      peerDependencies,
      peerDependenciesMeta,
      version,
      files: files_,
      exports: exports_,
      // type,
      main,
      module,
      types,
      typings,
      typesVersions,
      sideEffects,
      license,
      repository,
      authors,
      keywords,
    },
    { spaces: 2 },
  )
}

generatePackageJson()
