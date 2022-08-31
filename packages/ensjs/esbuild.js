const esbuild = require('esbuild')
const glob = require('glob')
const { renameSync } = require('fs')

const base = {
  entryPoints: [
    ...glob.sync('./src/**/!(*.test.ts)', {
      nodir: true,
      ignore: ['./src/@types/**/*', './src/tests/**/*', './src/ABIs/**/*'],
    }),
  ],
  bundle: false,
  sourcemap: true,
}

const esmDeclarations = glob.sync('./dist/esm/**/*.d.ts')

for (let i = 0; i < esmDeclarations.length; i++) {
  const declaration = esmDeclarations[i]
  renameSync(declaration, declaration.replace('.d.ts', '.d.mts'))
}

esbuild.build({
  ...base,
  bundle: true,
  plugins: [
    {
      name: 'add-mjs',
      setup(build) {
        build.onResolve({ filter: /.*/ }, (args) => {
          if (args.importer) {
            if (args.path.startsWith('./'))
              return { path: args.path + '.mjs', external: true }
            return { path: args.path, external: true }
          }
        })
      },
    },
  ],
  outdir: 'dist/esm',
  format: 'esm',
  target: ['esnext'],
  outExtension: {
    '.js': '.mjs',
  },
})

esbuild.build({
  ...base,
  outdir: 'dist/cjs',
  format: 'cjs',
  target: ['esnext'],
})
