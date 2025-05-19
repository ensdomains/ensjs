import type { Account, Address, Chain, Client, Transport } from "viem";
import { type ParseAccountErrorType, parseAccount } from "viem/utils";

// ================================
// Client with overrides
// ================================

export type ClientWithOverridesErrorType = ParseAccountErrorType;

export const clientWithOverrides = <
	chain extends Chain | undefined,
	account extends Account | undefined,
>(
	client: Client<Transport, chain, account>,
	overrides: {
		account?: unknown;
		chain?: unknown;
	},
) => {
	return {
		...client,
		account: parseAccount(
			(overrides.account as Account | Address | undefined) || client.account!,
		),
		chain: overrides.chain || client.chain,
	} as Client<Transport, NonNullable<chain>, NonNullable<account>>;
};
