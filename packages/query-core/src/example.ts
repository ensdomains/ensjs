// import { extendChainWithEns } from '@ensdomains/ensjs/chain'
// import { Config, createConfig, http } from '@wagmi/core'
// import { Chain, mainnet, Prettify } from 'viem/chains'
// import { RequireConfigContracts, RequireConfigContracts2 } from './utils/chain'
// import { ASSERT_NO_TYPE_ERROR, EXCLUDE_TYPE_ERROR, ExcludeTE } from '@ensdomains/ensjs/internal'

// const myConfig = createConfig({
//   chains: [mainnet],
//   transports: {
//     [mainnet.id]: http(),
//   },
// })

// const myConfigWithEns = createConfig({
//   chains: [extendChainWithEns(mainnet)],
//   transports: {
//     [mainnet.id]: http(),
//   },
// })

// const myAction = <chains extends readonly [Chain, ...Chain[]]>(config: RequireConfigContracts<chains, 'ensBaseRegistrarImplementation'>): ExcludeTE<typeof config> => {
//   const config_ = config as ExcludeTE<typeof config> & {}

//   return {} as any
// }

// const sdads = myAction(myConfig)
// const asdsad = myAction(myConfigWithEns)

// const myAction2 = <config extends Config>(config: RequireConfigContracts2<config, 'ensBaseRegistrarImplementation'>): ExcludeTE<typeof config> => {
//   const dasdas = EXCLUDE_TYPE_ERROR(config)

//   type asdasd = Prettify<typeof config>

//   return {} as any
// }

// const asd = myAction2(myConfig)
// const jksdf = myAction2(myConfigWithEns)
