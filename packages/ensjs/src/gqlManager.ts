export default async (url: string | null) => {
  let _client: any
  let _gql: any

  if (url) {
    const imported = await import('graphql-request')
    _client = new imported.GraphQLClient(url)
    _gql = imported.gql
  } else {
    _client = null
    _gql = () => null
  }

  return {
    gql: _gql,
    request(...args: any[]) {
      if (_client) {
        return _client.request(...args)
      }
      return null
    },
    setClient: async (url: string | null) => {
      if (url) {
        const imported = await import('graphql-request')
        _client = new imported.GraphQLClient(url)
        _gql = imported.gql
      } else {
        _client = null
        _gql = () => null
      }
      return
    },
    getClient() {
      return _client
    },
  }
}
