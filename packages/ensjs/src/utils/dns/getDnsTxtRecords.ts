import type { ErrorType } from "../../errors/utils.js";
import type { Endpoint } from "../../actions/dns/types.js";
import type { DnsResponse } from "./misc.js";

export type GetDnsTxtRecordsParameters = {
	/** Name to get the txt records for */
	name: string;
	/** An RFC-1035 compatible DNS endpoint to use (default: `https://cloudflare-dns.com/dns-query`) */
	endpoint?: Endpoint;
};

export type GetDnsTxtRecordsReturnType = DnsResponse;

export type GetDnsTxtRecordsErrorType = ErrorType;

/**
 * Gets the DNS record response of a name, via DNS record lookup
 * @param parameters - {@link GetDnsTxtRecordsParameters}
 * @returns DNS response. {@link GetDnsTxtRecordsReturnType}
 *
 * @example
 * import { getDnsTxtRecords } from '@ensdomains/ensjs/utils'
 *
 * const owner = await getDnsTxtRecords({ name: '_ens.ens.domains' })
 */
export const getDnsTxtRecords = async ({
	name,
	endpoint = "https://cloudflare-dns.com/dns-query",
}: GetDnsTxtRecordsParameters): Promise<GetDnsTxtRecordsReturnType> => {
	const response: DnsResponse = await fetch(
		`${endpoint}?name=${name}.&type=TXT&do=1`,
		{
			method: "GET",
			headers: {
				accept: "application/dns-json",
			},
		},
	).then((res) => res.json());

	return response;
};
