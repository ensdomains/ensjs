import { eacGrantRolesSnippet } from '@ensdomains/ensjs-abi/v2/enhancedAccessControl'
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

  return {
    address: registryAddress,
    functionName: 'grantRoles',
    abi: eacGrantRolesSnippet,
    chain: client.chain,
    account: client.account,
    args: [resource, encodeRoleBitmap(roles), account],
  } as const satisfies WriteContractParameters<typeof eacGrantRolesSnippet>
}
