import {
	namehash,
	zeroAddress,
	type Address,
	type Chain,
	type Client,
	type MulticallErrorType,
	type ReadContractErrorType,
	type ReadContractParameters,
	type ReadContractReturnType,
	type Transport,
} from "viem";
import { multicall, readContract } from "viem/actions";
import { getAction } from "viem/utils";

import { isNullRegistrarOwnerOfError } from "../../utils/errors/isNullRegistrarOwnerOfError.js";
import { checkIsDotEth } from "../../utils/name/validation.js";
import { nullableAddress } from "../../utils/nullableAddress.js";
import {
	getContractSpecificOwnerParameters,
	type GetContractSpecificOwnerParametersErrorType,
	type OwnerContract,
} from "../../utils/ownerFromContract.js";
import { getChainContractAddress, type RequireClientContracts } from "../../clients/chain.js";
import { UNWRAP_TYPE_ERROR, type ExcludeTE } from "../../types/internal.js";
import type { NamehashErrorType } from '../../utils/name/namehash.js';

export type GetOwnerParameters<
	contract extends OwnerContract | undefined = undefined,
> = {
	/** Name to get owner for */
	name: string;
	/** Optional specific contract to get ownership value from */
	contract?: contract;
};

type BaseGetOwnerReturnType = {
	/** Owner of the name */
	owner?: Address | null;
	/** Registrant of the name (registrar owner) */
	registrant?: Address | null;
	/** The contract level that the ownership is on */
	ownershipLevel: "registry" | "registrar" | "nameWrapper";
};

type RegistrarOnlyOwnership = {
	owner?: never;
	registrant: Address;
	ownershipLevel: "registrar";
};

type WrappedOwnership = {
	owner: Address;
	registrant?: never;
	ownershipLevel: "nameWrapper";
};

type UnwrappedEth2ldOwnership = {
	registrant: Address | null;
	owner: Address;
	ownershipLevel: "registrar";
};

type UnwrappedOwnership = {
	owner: Address;
	registrant?: never;
	ownershipLevel: "registry";
};

export type GetOwnerReturnType<
	contract extends OwnerContract | undefined = undefined,
> =
	| (BaseGetOwnerReturnType &
			(contract extends "registrar"
				? RegistrarOnlyOwnership
				: contract extends "nameWrapper"
					? WrappedOwnership
					: contract extends "registry"
						? UnwrappedOwnership
						: WrappedOwnership | UnwrappedEth2ldOwnership | UnwrappedOwnership))
	| null;

export type GetOwnerErrorType = NamehashErrorType | ReadContractErrorType | GetContractSpecificOwnerParametersErrorType | MulticallErrorType

/**
 * Gets the owner(s) of a name.
 * @param client - {@link Client}
 * @param parameters - {@link GetOwnerParameters}
 * @returns Owner data object, or `null` if no owners exist. {@link GetOwnerReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { getOwner } from '@ensdomains/ensjs/public'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 * const result = await getOwner(client, { name: 'ens.eth' })
 * // { owner: '0xb6E040C9ECAaE172a89bD561c5F73e1C48d28cd9', registrant: '0xb6E040C9ECAaE172a89bD561c5F73e1C48d28cd9', ownershipLevel: 'registrar }
 */
export async function getOwner<
	chain extends Chain,
	contract extends OwnerContract | undefined = undefined,
>(
	client: RequireClientContracts<
		chain,
		| "ensNameWrapper"
		| "ensRegistry"
		| "ensBaseRegistrarImplementation"
		| "multicall3"
	>,
	{ name, contract: contract_ }: GetOwnerParameters<contract>,
): Promise<GetOwnerReturnType<contract>> {
	UNWRAP_TYPE_ERROR(client);

	const node = namehash(name);
	const labels = name.split(".");

	if (contract_ || labels.length === 1) {
		const contract = contract_ || "registry";
		const readContractAction = getAction(client, readContract, "readContract");
		const params = getContractSpecificOwnerParameters(client.chain, {
			contract,
			node,
			labels,
		});
		type OwnerParameters = Extract<typeof params, { functionName: "owner" }>;
		type OwnerReturnType = ReadContractReturnType<
			OwnerParameters["abi"],
			"owner",
			OwnerParameters["args"]
		>;
		type OwnerOfParameters = Extract<
			typeof params,
			{ functionName: "ownerOf" }
		>;
		type OwnerOfReturnType = ReadContractReturnType<
			OwnerOfParameters["abi"],
			"ownerOf",
			OwnerOfParameters["args"]
		>;
		const result = (await readContractAction(
			params as ReadContractParameters,
		)) as OwnerReturnType | OwnerOfReturnType;

		if (result === zeroAddress) return null;

		if (contract === "registrar")
			return {
				ownershipLevel: "registrar",
				registrant: result,
			} as GetOwnerReturnType<contract>;

		return {
			owner: result,
			ownershipLevel: contract,
		} as GetOwnerReturnType<contract>;
	}

	const multicallAction = getAction(client, multicall, "multicall");
	const contractParameters = [
		getContractSpecificOwnerParameters(client.chain, {
			contract: "registry",
			node,
			labels,
		}),
		getContractSpecificOwnerParameters(client.chain, {
			contract: "nameWrapper",
			node,
			labels,
		}),
	] as const;
	const is2ldEth = checkIsDotEth(labels);
	const [registryOwner, nameWrapperOwner, registrarOwner] = (
		is2ldEth
			? await multicallAction({
					contracts: [
						...contractParameters,
						getContractSpecificOwnerParameters(client.chain, {
							contract: "registrar",
							labels,
						}),
					],
					allowFailure: true,
				})
			: await multicallAction({
					contracts: contractParameters,
					allowFailure: true,
				})
	).map((result, index) => {
		if (result.error) {
			if (index !== 2) throw result.error;
			if (!isNullRegistrarOwnerOfError(result.error)) throw result.error;
			return null;
		}
		return nullableAddress(result.result);
	});

	const nameWrapperAddress = getChainContractAddress({
		chain: client.chain,
		contract: "ensNameWrapper",
	});

	// check for only .eth names
	if (labels[labels.length - 1] === "eth") {
		// if the owner on the registrar is the namewrapper, then the namewrapper owner is the owner
		// there is no "registrant" for wrapped names
		if (registrarOwner === nameWrapperAddress) {
			return {
				owner: nameWrapperOwner,
				ownershipLevel: "nameWrapper",
			} as GetOwnerReturnType<contract>;
		}
		// if there is a registrar owner, then it's not a subdomain but we have also passed the namewrapper clause
		// this means that it's an unwrapped second-level name
		// the registrant is the owner of the NFT
		// the owner is the controller of the records
		if (registrarOwner) {
			return {
				registrant: registrarOwner,
				owner: registryOwner,
				ownershipLevel: "registrar",
			} as GetOwnerReturnType<contract>;
		}
		if (registryOwner !== null) {
			// if there is no registrar owner, but the label length is two, then the domain is an expired 2LD .eth
			// so we still want to return the ownership values
			if (labels.length === 2) {
				return {
					registrant: null,
					owner: registryOwner,
					ownershipLevel: "registrar",
				} as GetOwnerReturnType<contract>;
			}
			// this means that the subname is wrapped
			if (registryOwner === nameWrapperAddress && nameWrapperOwner !== null) {
				return {
					owner: nameWrapperOwner,
					ownershipLevel: "nameWrapper",
				} as GetOwnerReturnType<contract>;
			}
			// unwrapped subnames do not have NFTs associated, so do not have a registrant
			return {
				owner: registryOwner,
				ownershipLevel: "registry",
			} as GetOwnerReturnType<contract>;
		}
		// .eth names with no registrar owner are either unregistered or expired
		return null;
	}

	// non .eth names inherit the owner from the registry
	// there will only ever be an owner for non .eth names, not a registrant
	// this is because for unwrapped names, there is no associated NFT
	// and for wrapped names, owner and registrant are the same thing
	if (registryOwner === nameWrapperAddress && nameWrapperOwner !== null) {
		return {
			owner: nameWrapperOwner,
			ownershipLevel: "nameWrapper",
		} as GetOwnerReturnType<contract>;
	}

	// for unwrapped non .eth names, the owner is the registry owner
	if (registryOwner !== null) {
		return {
			owner: registryOwner,
			ownershipLevel: "registry",
		} as GetOwnerReturnType<contract>;
	}

	// for anything else, return
	return null;
}
