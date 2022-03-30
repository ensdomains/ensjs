import { ethers } from 'ethers'
import { ENS } from '.'

const start = async () => {
  const provider = new ethers.providers.JsonRpcProvider(
    'http://localhost:8545',
    'ropsten',
  )

  const accounts = await provider.listAccounts()

  const ENSInstance = new ENS({
    graphURI: 'http://localhost:8000/subgraphs/name/graphprotocol/ens',
  })
  await ENSInstance.setProvider(provider)

  const _getProfile = async () => {
    const response = await ENSInstance.getProfile('matoken.eth')

    console.log(response, response.records?.texts, response.records?.coinTypes)
  }

  const _getName = async () => {
    const nameResponse = await ENSInstance.getName(
      '0x866B3c4994e1416B7C738B9818b31dC246b95eEE',
    )

    console.log(nameResponse)
  }

  const _getProfileAddress = async () => {
    const getProfileAddress = await ENSInstance.getProfile(
      '0x866B3c4994e1416B7C738B9818b31dC246b95eEE',
    )
    console.log(
      getProfileAddress,
      getProfileAddress?.records?.texts,
      getProfileAddress?.records?.coinTypes,
    )
  }

  const _getResolver = async () => {
    const getResolver = await ENSInstance.getResolver('jefflau.eth')
    console.log(getResolver)
  }

  const _setName = async () => {
    const setNameTx = await ENSInstance.setName('parthtejpal.eth')
    await setNameTx.wait()
    const name = await ENSInstance.getName(accounts[0])
    console.log(name)
  }

  const _setRecords = async () => {
    const setRecordsTx = await ENSInstance.setRecords('parthtejpal.eth', {
      texts: [{ key: 'cool', value: 'swag' }],
      coinTypes: [
        { key: 'ETC', value: '0x866B3c4994e1416B7C738B9818b31dC246b95eEE' },
      ],
    })
    await setRecordsTx.wait()
  }

  //const result = await ENSInstance.getProfile('jefflau.eth')
  //const addr = await ENSInstance.batch([[ENSInstance.getAddr, 'jefflau.eth', 'BTC']])
  const contenthash = await ENSInstance.batch([[ENSInstance.getContentHash, 'matoken.eth']])
  console.log(contenthash)

  //console.log(result)

  // const profile = await ENSInstance.getProfile('parthtejpal.eth')
  // console.log(profile?.records?.coinTypes)
}

start()
