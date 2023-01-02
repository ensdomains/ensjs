import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useProvider } from 'wagmi'

import { ENS } from '@ensdomains/ensjs'
import { PublicENS } from '../types'

const EnsContext = createContext({ ...new ENS(), ready: false })

const EnsProvider = ({
  children,
  opts,
}: {
  children: React.ReactNode
  opts: ConstructorParameters<typeof ENS>[0]
}) => {
  const provider = useProvider()
  const currentEns = useMemo(() => new ENS(opts), [opts])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(false)
    currentEns.setProvider(provider as any).then(() => setReady(true))
  }, [provider])

  return (
    <EnsContext.Provider
      value={useMemo(() => ({ ...currentEns, ready }), [currentEns, ready])}
    >
      {children}
    </EnsContext.Provider>
  )
}

function useEns(): PublicENS & { ready: boolean } {
  const context = useContext(EnsContext)
  return context
}
export { useEns, EnsProvider }
