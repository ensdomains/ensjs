import { defineConfig } from 'vocs/config'

export default defineConfig({
  logoUrl: '/logo.svg',
  iconUrl: '/favicon.ico',
  title: 'ENSjs',
  description: 'ENS javascript library for contract interaction',
  renderStrategy: 'full-static',
  outDir: 'dist',
  baseUrl: 'https://ensjs.ens.eth.link',
  checkDeadlinks: true,
  sidebar: [
    { text: 'Basics', collapsed: false, items: [
      { text: 'Using the Viem Client', link: '/basics/using-the-viem-client' },
      { text: 'Batching Calls', link: '/basics/batching-calls' },
      { text: 'Fetching a Profile', link: '/basics/fetching-a-profile' },
      { text: 'Custom Subgraph URIs', link: '/basics/custom-subgraph-uris' },
      { text: 'Extending the Viem Client', link: '/basics/extending-the-viem-client' },
    ]},
    { text: 'API reference', collapsed: false, items: [
      { text: 'index', link: '/reference/index/api' },
      { text: 'chain', link: '/reference/chain/api' },
      { text: 'dns', link: '/reference/dns/api' },
      { text: 'public', link: '/reference/public/api' },
      { text: 'public/v1', link: '/reference/public/v1/api' },
      { text: 'public/v2', link: '/reference/public/v2/api' },
      { text: 'wallet', link: '/reference/wallet/api' },
      { text: 'wallet/v1', link: '/reference/wallet/v1/api' },
      { text: 'wallet/v2', link: '/reference/wallet/v2/api' },
      { text: 'subgraph', link: '/reference/subgraph/api' },
    ]},
  ],
  topNav: [
    { text: 'Docs', link: '/' },
    { text: 'GitHub', link: 'https://github.com/ensdomains/ensjs', external: true },
  ],
  socials: [{ icon: 'github', link: 'https://github.com/ensdomains/ensjs' }],
  editLink: {
    link: 'https://github.com/ensdomains/ensjs/edit/main/packages/docs/src/pages/:path',
    text: 'Suggest changes to this page',
  },
})