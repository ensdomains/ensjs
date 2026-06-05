import {
  eacGrantRolesSnippet,
  eacGrantRootRolesSnippet,
} from '@ensdomains/ensjs-abi/v2/enhancedAccessControl'
import type {
  Account,
  Address,
  Chain,
  Client,
  Transport,
  WriteContractParameters,
} from 'viem'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'
import {
  encodeRoleBitmap,
  type Role,
} from '../../../utils/v2/roles/encodeRoleBitmap.js'

export type GrantRolesWriteParametersParameters = {
  registryAddress: Address
  roles: Role[]
  account: Address
  resource: bigint
}

export const grantRolesWriteParameters = <
  chain extends Chain,
  account extends Account,
>(
  client: Client<Transport, chain, account>,
  {
    registryAddress,
    roles,
    account,
    resource,
  }: GrantRolesWriteParametersParameters,
) => {
  ASSERT_NO_TYPE_ERROR(client)

  const isRootResource = resource === 0n
  const roleBitmap = encodeRoleBitmap(roles)

  // ROOT_RESOURCE grants must use the dedicated `grantRootRoles` entrypoint;
  // the general `grantRoles` reverts with `EACRootResourceNotAllowed`. Mirrors
  // `revokeRolesWriteParameters`.
  if (isRootResource) {
    return {
      address: registryAddress,
      functionName: 'grantRootRoles',
      abi: eacGrantRootRolesSnippet,
      chain: client.chain,
      account: client.account,
      args: [roleBitmap, account] as const,
    } as const satisfies WriteContractParameters<
      typeof eacGrantRootRolesSnippet
    >
  }

  return {
    address: registryAddress,
    functionName: 'grantRoles',
    abi: eacGrantRolesSnippet,
    chain: client.chain,
    account: client.account,
    args: [resource, roleBitmap, account] as const,
  } as const satisfies WriteContractParameters<typeof eacGrantRolesSnippet>
}
