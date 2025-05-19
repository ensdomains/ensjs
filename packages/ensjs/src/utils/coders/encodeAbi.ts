import {
	bytesToHex,
	type BytesToHexErrorType,
	type Hex,
	stringToHex,
	type StringToHexErrorType,
} from "viem";
import { UnknownContentTypeError, type ErrorType } from "../../errors/utils.js";
import type { Prettify } from "../../types/index.js";

export type AbiEncodeAs = "json" | "zlib" | "cbor" | "uri";

type AbiContentType = 1 | 2 | 4 | 8;

const abiEncodeMap = {
	json: 1,
	zlib: 2,
	cbor: 4,
	uri: 8,
} as const;
type AbiEncodeMap = typeof abiEncodeMap;

type GetAbiContentType<encodeAs extends AbiEncodeAs> = AbiEncodeMap[encodeAs];

export type EncodeAbiParameters<encodeAs extends AbiEncodeAs = AbiEncodeAs> =
	encodeAs extends "uri"
		? {
				encodeAs: encodeAs;
				data: string | null;
			}
		: {
				encodeAs: encodeAs;
				data: Record<any, any> | null;
			};

export type EncodedAbi<contentType extends AbiContentType = AbiContentType> = {
	contentType: contentType;
	encodedData: Hex;
};

export type EncodeAbiReturnType<contentType extends AbiContentType> =
	EncodedAbi<contentType>;

// ================================
// Content Type To Encode As
// ================================

export type ContentTypeToEncodeAsErrorType = UnknownContentTypeError;

/**
 * Converts a content type to an encode as
 *
 * @throws {ContentTypeToEncodeAsErrorType}
 * @param contentType - The content type to convert
 */
export const contentTypeToEncodeAs = (
	contentType: AbiContentType,
): AbiEncodeAs => {
	switch (contentType) {
		case 1:
			return "json";
		case 2:
			return "zlib";
		case 4:
			return "cbor";
		case 8:
			return "uri";
		default:
			throw new UnknownContentTypeError({ contentType });
	}
};

// ================================
// Encode As To Content Type
// ================================

export type EncodeAsToContentTypeErrorType = UnknownContentTypeError;

export const encodeAsToContentType = (
	encodeAs: AbiEncodeAs,
): AbiContentType => {
	const contentType = abiEncodeMap[encodeAs];
	if (contentType === undefined) {
		throw new UnknownContentTypeError({ contentType: encodeAs });
	}
	return contentType;
};

// ================================
// Encode Abi
// ================================

export type EncodeAbiErrorType =
	| UnknownContentTypeError
	| StringToHexErrorType
	| BytesToHexErrorType
	| ErrorType;

export const encodeAbi = async <
	encodeAs extends AbiEncodeAs,
	contentType extends GetAbiContentType<encodeAs>,
>({
	encodeAs,
	data,
}: EncodeAbiParameters<encodeAs>): Promise<
	Prettify<EncodeAbiReturnType<contentType>>
> => {
	let contentType: AbiContentType;
	let encodedData: Hex = "0x";
	switch (encodeAs) {
		case "json":
			contentType = 1;
			// may throw StringToHexErrorType
			if (data) encodedData = stringToHex(JSON.stringify(data));
			break;
		case "zlib": {
			contentType = 2;
			if (data) {
				const { deflate } = await import("pako/dist/pako_deflate.min.js");
				// may throw BytesToHexErrorType
				encodedData = bytesToHex(deflate(JSON.stringify(data)));
			}
			break;
		}
		case "cbor": {
			contentType = 4;
			if (data) {
				const { cborEncode } = await import(
					"@ensdomains/address-encoder/utils"
				);
				// may throw BytesToHexErrorType
				encodedData = bytesToHex(new Uint8Array(cborEncode(data)));
			}
			break;
		}
		default: {
			contentType = 8;
			if (data) {
				// may throw StringToHexErrorType
				encodedData = stringToHex(data as string);
			}
			break;
		}
	}
	return { contentType: contentType as contentType, encodedData };
};
