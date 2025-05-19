import type { Chain } from "viem";
import type { RequireClientContracts } from "../../clients/chain.js";
import type { ErrorType } from "../../errors/utils.js";
import type { Prettify } from "../../types/index.js";
import type { ExcludeTE } from "../../types/internal.js";
import {
	type GetTextRecordErrorType,
	type GetTextRecordParameters,
	getTextRecord,
} from "./getTextRecord.js";

export type GetCredentialsParameters = Prettify<
	Omit<GetTextRecordParameters, "key">
>;

export type GetCredentialsReturnType = ExternalCredential[] | null;

export type GetCredentialsErrorType = GetTextRecordErrorType | ErrorType;

export type ExternalCredential = {
	url: string;
};

const parseCredentials = (credentials: string[]) => {
	const externalCredentials: ExternalCredential[] = [];
	for (const credential of credentials) {
		if (URL.canParse(credential)) externalCredentials.push({ url: credential });
	}

	return externalCredentials;
};

/**
 * Gets credentials for a name.
 * @param client - {@link Client}
 * @param parameters - {@link GetCredentialsParameters}
 * @returns Credentials, or null if none are found. {@link GetCredentialsReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { getCredentials } from '@ensdomains/ensjs/public'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 * const result = await getCredentials(client, { name: 'ens.eth' })
 * // [{ url: 'https://example.com' }]
 */
export async function getCredentials<chain extends Chain>(
	client: RequireClientContracts<chain, "ensUniversalResolver">,
	{ gatewayUrls, strict, name }: GetCredentialsParameters,
): Promise<GetCredentialsReturnType> {
	client = client as ExcludeTE<typeof client>;

	const result = await getTextRecord(client, {
		name,
		key: "verifications",
		gatewayUrls,
		strict,
	});
	if (!result) return null;

	const credential = JSON.parse(result) as string[];
	return parseCredentials(credential);
}
