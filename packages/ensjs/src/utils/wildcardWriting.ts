import * as chains from 'viem/chains'
import type { Chain } from 'viem/chains'
import {
  type Address,
  type Hex,
  type SendTransactionParameters,
  decodeErrorResult,
  type RawContractError,
  type TypedDataDefinition,
  zeroHash,
  encodeFunctionData,
  type Transport,
  type Account,
  type Hash,
  BaseError,
  toHex,
} from 'viem'
import { readContract, sendTransaction } from 'viem/actions'
import { packetToBytes } from 'viem/ens'
import type {
  ChainWithEns,
  ClientWithEns,
  WalletClientWithAccount,
} from '../contracts/consts.js'
import { getChainContractAddress } from '../contracts/getChainContractAddress.js'
import {
  type DomainData,
  type MessageData,
  offchainRegisterSnippet,
  universalResolverResolveSnippet,
  erc165SupportsInterfaceSnippet,
  universalResolverFindResolverSnippet,
} from '../contracts/index.js'

export const WILDCARD_WRITING_REGISTER_INTERFACE_ID =
  '0x79dc93d7' as const satisfies `0x${string}`

const WILDCARD_WRITING_REGISTER_SELECTOR =
  '0xf43c313a' as const satisfies `0x${string}`

export class WildcardError extends BaseError {}

export function getRevertErrorData(err: unknown) {
  if (!(err instanceof BaseError)) return
  const error = err.walk() as RawContractError
  return error?.data as { errorName: string; args: unknown[] }
}

export type CcipRequestParameters = {
  data: Hex
  sender: Address
  urls: readonly string[]
  signature?: Pick<TypedDataDefinition, 'domain' | 'message'> & {
    signature: Hex
  }
}

export async function ccipRequest({
  data,
  sender,
  signature,
  urls,
}: CcipRequestParameters): Promise<Response> {
  return Promise.any(
    urls
      .map((url) => url.replace('/{sender}/{data}.json', ''))
      .map(async (url) => {
        return fetch(url, {
          body: JSON.stringify(
            {
              data,
              sender,
              signature,
            },
            (_, value) =>
              typeof value === 'bigint' ? value.toString() : value,
          ),
          method: 'POST',
          headers: {
            /* eslint-disable-next-line @typescript-eslint/naming-convention */
            'Content-Type': 'application/json',
          },
        })
      }),
  )
}

function getChain(chainId: number): Chain | undefined {
  return (Object.values(chains) as Chain[]).find(
    (chain) => chain.id === chainId,
  )
}

export class SubnameUnavailableError extends BaseError {
  override name = 'SubnameUnavailableError'

  constructor(name: string) {
    super(`Create subname error: ${name} is unavailable`)
  }
}

interface ErrorResult {
  errorName: string
  args?: readonly unknown[]
}

export async function handleWildcardWritingRevert<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
>(
  wallet: WalletClientWithAccount<Transport, TChain, TAccount>,
  errorResult: ErrorResult,
  encodedName: Hex,
  calldata: Hex,
  account: Address,
  expiry?: bigint,
): Promise<Hash | undefined> {
  const currentChain = wallet.chain

  if (errorResult.errorName === 'OperationHandledOffchain') {
    const [domain, url, message] = errorResult.args as [
      DomainData,
      string,
      MessageData,
    ]

    const signature = await wallet.signTypedData({
      account,
      domain,
      message,
      primaryType: 'Message',
      types: {
        Message: [
          { name: 'data', type: 'bytes' },
          { name: 'sender', type: 'address' },
          { name: 'expirationTimestamp', type: 'uint256' },
        ],
      },
    })
    await ccipRequest({
      data: message.data,
      signature: { message, domain, signature },
      sender: message.sender,
      urls: [url],
    })
  }

  if (errorResult.errorName === 'OperationHandledOnchain') {
    try {
      const [chainId, contractAddress] = errorResult.args as [
        bigint,
        `0x${string}`,
      ]

      if (
        wallet.chain.id !== chains.localhost.id &&
        wallet.chain.id !== Number(chainId)
      ) {
        await wallet.switchChain({ id: Number(chainId) })
        const chain = getChain(Number(chainId))
        if (!chain) throw new Error('Chain not found')
        wallet.chain = chain as TChain
      }

      let value = 0n
      if (calldata.slice(0, 10) === WILDCARD_WRITING_REGISTER_SELECTOR) {
        const registerParams = (await readContract(wallet, {
          address: contractAddress,
          abi: offchainRegisterSnippet,
          functionName: 'registerParams',
          args: [encodedName, expiry],
        })) as {
          price: bigint
          commitTime: bigint
          extraData: Hex
          available: boolean
          token: Hex
        }

        if (!registerParams.available) {
          throw new SubnameUnavailableError(encodedName)
        }

        value = registerParams.price
      }

      await sendTransaction(wallet, {
        account,
        to: contractAddress,
        value,
        data: calldata,
        authorizationList: [],
      } as SendTransactionParameters<TChain, TAccount>)
    } finally {
      if (wallet.chain.id !== chains.localhost.id) {
        await wallet.switchChain({ id: currentChain.id })
        wallet.chain = currentChain
      }
    }
  }

  // random ethereum transaction hashes had to be returned to avoid breaking changes
  return currentChain.id === chains.sepolia.id
    ? '0x1d4cca15a7f535724328cce2ba2c857b158c940aeffb3c3b4a035645da697b25' // random successful sepolia tx hash
    : '0xd4a47f4ff92e1bb213a6f733dc531d1baf4d3e439229bf184aa90b39d2bdb26b' // random successful mainnet tx hash
}

export async function handleOffchainTransaction<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
>(
  wallet: WalletClientWithAccount<Transport, TChain, TAccount>,
  encodedName: Hex,
  calldata: Hex,
  account: Address,
  expiry?: bigint,
): Promise<Hash> {
  try {
    await readContract(wallet, {
      address: getChainContractAddress({
        client: wallet,
        contract: 'ensUniversalResolver',
      }),
      abi: universalResolverResolveSnippet,
      functionName: 'resolve',
      args: [
        encodedName,
        encodeFunctionData({
          functionName: 'getOperationHandler',
          abi: offchainRegisterSnippet,
          args: [calldata],
        }),
      ],
    })
    return zeroHash
  } catch (offchainError) {
    const data = getRevertErrorData(offchainError)
    if (!data || !Array.isArray(data.args)) throw offchainError

    const [params] = data.args
    const errorResult = decodeErrorResult({
      abi: offchainRegisterSnippet,
      data: params as Hex,
    })

    const txHash = await handleWildcardWritingRevert(
      wallet,
      errorResult,
      encodedName,
      calldata,
      account,
      expiry,
    )
    if (!txHash) throw offchainError
    return txHash
  }
}

/**
 * Checks whether the ENSIP-20 Wildcard Writing is supported by a given domain's resolver.
 *
 * @param wallet - The wallet client with account information
 * @param name - The domain to gather the resolver for
 * @returns True if the ENSIP-20 Wildcard Writing is supported, false otherwise
 */
export async function isWildcardWritingSupported(
  wallet: ClientWithEns,
  name: string,
): Promise<boolean> {
  const [resolver] = await readContract(wallet, {
    address: getChainContractAddress({
      client: wallet,
      contract: 'ensUniversalResolver',
    }),
    abi: universalResolverFindResolverSnippet,
    functionName: 'findResolver',
    args: [toHex(packetToBytes(name))],
  })

  return readContract(wallet, {
    address: resolver,
    abi: erc165SupportsInterfaceSnippet,
    functionName: 'supportsInterface',
    args: [WILDCARD_WRITING_REGISTER_INTERFACE_ID],
  })
}
