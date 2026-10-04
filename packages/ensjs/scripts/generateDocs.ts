import { Application, TSConfigReader, TypeDocReader } from 'typedoc'

const main = async () => {
  const app = await Application.bootstrapWithPlugins(
    {
      entryPoints: [
        'src/index.ts',
        'src/dns.ts',
        'src/subgraph.ts',
        'src/exports/chain.ts',
        'src/exports/public.ts',
        'src/exports/public/v1.ts',
        'src/exports/public/v2.ts',
        'src/exports/wallet.ts',
        'src/exports/wallet/v1.ts',
        'src/exports/wallet/v2.ts',
      ],
      plugin: ['typedoc-plugin-markdown'],
      outputs: [{ name: 'markdown', path: '../../docs' }],
      cleanOutputDir: false,
      entryFileName: 'api.md',
      readme: 'none',
      excludeExternals: true,
      excludeNotDocumented: true,
      excludeNotDocumentedKinds: [
        'Module',
        'Namespace',
        'Enum',
        'EnumMember',
        'Variable',
        'Function',
        'Class',
        'Interface',
        'Constructor',
        'Property',
        'Method',
        'CallSignature',
        'IndexSignature',
        'ConstructorSignature',
        'Accessor',
        'GetSignature',
        'SetSignature',
        'TypeAlias',
        'Reference',
      ],
      useTsLinkResolution: true,
    },
    [new TSConfigReader(), new TypeDocReader()],
  )

  const project = await app.convert()

  if (!project) throw new Error('Project failed')

  await app.generateOutputs(project)
}

main().catch(console.error)
