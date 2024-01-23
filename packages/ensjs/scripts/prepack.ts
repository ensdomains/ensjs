// from https://github.com/wagmi-dev/viem/blob/main/scripts/prepublishOnly.ts

/* eslint-disable no-continue */
import fs from 'fs-extra'
import path from 'path'
import * as url from 'url'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

type Exports = {
  [key: string]: string | { types?: string; import: string; default: string }
}

// Generates a package.json to be published to NPM with only the necessary fields.
function generatePackageJson() {
  const packageJsonPath = path.join(__dirname, '../package.json')
  const tmpPackageJson = fs.readJsonSync(packageJsonPath)

  fs.writeJsonSync(`${packageJsonPath}.tmp`, tmpPackageJson, { spaces: 2 })

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

    fs.outputFileSync(
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

  fs.writeJsonSync(
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
