import TypeDoc from 'typedoc'
import { load } from 'typedoc-plugin-markdown'

const main = async () => {
  const app = new TypeDoc.Application()
  load(app)

  app.options.addReader(new TypeDoc.TSConfigReader())
  app.options.addReader(new TypeDoc.TypeDocReader())

  app.bootstrap({
    entryPoints: [
      'src/index.ts',
      'src/dns.ts',
      'src/public.ts',
      'src/subgraph.ts',
      'src/wallet.ts',
    ],
    githubPages: false,
    cleanOutputDir: false,
    readme: 'none',
    skipIndexPage: true,
    outputFileStrategy: 'members',
    excludeExternals: true,
    excludeGroups: true,
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
  })

  const project = app.convert()

  if (!project) throw new Error('Project failed')

  const outputDir = '../../docs'

  await app.generateDocs(project, outputDir)
}

main().catch(console.error)
