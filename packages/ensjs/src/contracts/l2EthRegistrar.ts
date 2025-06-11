export const l2EthRegistrarErrors = [
	{
		inputs: [
			{
				name: "commitment",
				type: "bytes32",
			},
			{
				name: "validFrom",
				type: "uint256",
			},
			{
				name: "blockTimestamp",
				type: "uint256",
			},
		],
		name: "CommitmentTooNew",
		type: "error",
	},
	{
		inputs: [
			{
				name: "commitment",
				type: "bytes32",
			},
			{
				name: "validTo",
				type: "uint256",
			},
			{
				name: "blockTimestamp",
				type: "uint256",
			},
		],
		name: "CommitmentTooOld",
		type: "error",
	},
	{
		inputs: [
			{
				name: "duration",
				type: "uint64",
			},
			{
				name: "minDuration",
				type: "uint256",
			},
		],
		name: "DurationTooShort",
		type: "error",
	},
	{
		inputs: [
			{
				name: "required",
				type: "uint256",
			},
			{
				name: "provided",
				type: "uint256",
			},
		],
		name: "InsufficientValue",
		type: "error",
	},
	{
		inputs: [],
		name: "MaxCommitmentAgeTooLow",
		type: "error",
	},
	{
		inputs: [
			{
				name: "name",
				type: "string",
			},
		],
		name: "NameNotAvailable",
		type: "error",
	},
	{
		inputs: [
			{
				name: "commitment",
				type: "bytes32",
			},
		],
		name: "UnexpiredCommitmentExists",
		type: "error",
	},
] as const;

export const l2EthRegistrarRentPriceSnippet = [
	...l2EthRegistrarErrors,
	{
		inputs: [
			{
				name: "name",
				type: "string",
			},
			{
				name: "duration",
				type: "uint256",
			},
		],
		name: "rentPrice",
		outputs: [
			{
				components: [
					{
						name: "base",
						type: "uint256",
					},
					{
						name: "premium",
						type: "uint256",
					},
				],
				name: "price",
				type: "tuple",
			},
		],
		stateMutability: "view",
		type: "function",
	},
] as const;

export const l2EthRegistrarCommitSnippet = [
	...l2EthRegistrarErrors,
	{
		inputs: [
			{
				name: "commitment",
				type: "bytes32",
			},
		],
		name: "commit",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
] as const;

export const l2EthRegistrarMakeCommitmentSnippet = [
	...l2EthRegistrarErrors,
	{
		inputs: [
			{
				name: "name",
				type: "string",
			},
			{
				name: "owner",
				type: "address",
			},
			{
				name: "secret",
				type: "bytes32",
			},
			{
				name: "subregistry",
				type: "address",
			},
			{
				name: "resolver",
				type: "address",
			},
			{
				name: "duration",
				type: "uint64",
			},
		],
		name: "makeCommitment",
		outputs: [
			{
				name: "",
				type: "bytes32",
			},
		],
		stateMutability: "pure",
		type: "function",
	},
] as const;

export const l2EthRegistrarCommitmentsSnippet = [
	...l2EthRegistrarErrors,
	{
		inputs: [
			{
				name: "",
				type: "bytes32",
			},
		],
		name: "commitments",
		outputs: [
			{
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
	},
] as const;

export const l2EthRegistrarRegisterSnippet = [
	...l2EthRegistrarErrors,
	{
		inputs: [
			{
				name: "name",
				type: "string",
			},
			{
				name: "owner",
				type: "address",
			},
			{
				name: "secret",
				type: "bytes32",
			},
			{
				name: "subregistry",
				type: "address",
			},
			{
				name: "resolver",
				type: "address",
			},
			{
				name: "duration",
				type: "uint64",
			},
		],
		name: "register",
		outputs: [
			{
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "payable",
		type: "function",
	},
] as const;

export const l2EthRegistrarRenewErrors = [
	{
		inputs: [
			{
				name: "required",
				type: "uint256",
			},
			{
				name: "provided",
				type: "uint256",
			},
		],
		name: "InsufficientValue",
		type: "error",
	},
] as const;

export const l2EthRegistrarRenewSnippet = [
	...l2EthRegistrarRenewErrors,
	{
		inputs: [
			{
				name: "name",
				type: "string",
			},
			{
				name: "duration",
				type: "uint64",
			},
		],
		name: "renew",
		outputs: [],
		stateMutability: "payable",
		type: "function",
	},
] as const;
