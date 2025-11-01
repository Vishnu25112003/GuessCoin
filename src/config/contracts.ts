// IMPORTANT: Paste the full ABI from your TokenCrt.json file here
export const TOKEN_CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "increasedSupply",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "cap",
        type: "uint256",
      },
    ],
    name: "ERC20ExceededCap",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "allowance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "needed",
        type: "uint256",
      },
    ],
    name: "ERC20InsufficientAllowance",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "balance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "needed",
        type: "uint256",
      },
    ],
    name: "ERC20InsufficientBalance",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "approver",
        type: "address",
      },
    ],
    name: "ERC20InvalidApprover",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "cap",
        type: "uint256",
      },
    ],
    name: "ERC20InvalidCap",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
    ],
    name: "ERC20InvalidReceiver",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "ERC20InvalidSender",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "ERC20InvalidSpender",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_userAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "_userActive",
        type: "bool",
      },
      {
        indexed: true,
        internalType: "address",
        name: "_crtAddress",
        type: "address",
      },
    ],
    name: "userCreationStatus",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "changeOwnership",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "_status",
        type: "bool",
      },
    ],
    name: "chgControlSwitch",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "createUser",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "burnAmt",
        type: "uint256",
      },
    ],
    name: "customBurn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "rewardAmt",
        type: "uint256",
      },
    ],
    name: "customMint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "newBetFee",
        type: "uint256",
      },
    ],
    name: "setBetAmount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "newSize",
        type: "uint8",
      },
    ],
    name: "setPoolSize",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint16",
        name: "newFreeRate",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "newPaidRate",
        type: "uint16",
      },
    ],
    name: "setRewardRates",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "maxSupply",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_ownerInitAlloc",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "_poolSize",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "_paidBetAmount",
        type: "uint256",
      },
      {
        internalType: "uint16",
        name: "_fRwdAmt",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "_pRwdAmt",
        type: "uint16",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "cap",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "contractRegistry",
    outputs: [
      {
        internalType: "address",
        name: "userWalletAddress",
        type: "address",
      },
      {
        internalType: "bool",
        name: "walletActive",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "dataPoolBetRewards",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint16",
        name: "",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "",
        type: "uint16",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getLogicAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "isUserActive",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "userRegistry",
    outputs: [
      {
        internalType: "bool",
        name: "userActive",
        type: "bool",
      },
      {
        internalType: "address",
        name: "logicContractAddress",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
// IMPORTANT: Paste the deployed address of your TokenCrt contract
export const TOKEN_CONTRACT_ADDRESS =
  "0x3A3DF2F81F7aE51E9fBA8E3A13cB2F7e37eeE60E";

export const LOGIC_CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_creator",
        type: "address",
      },
      {
        internalType: "uint8",
        name: "_poolSize",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "_paidBetAmount",
        type: "uint256",
      },
      {
        internalType: "uint16",
        name: "_freeRewardAmount",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "_paidRewardAmount",
        type: "uint16",
      },
      {
        internalType: "address",
        name: "_guessTokenAddress",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_userAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint8",
        name: "_SNo",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_guessBlockNumber",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "_tokenSize",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "_paidGuess",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "_complex",
        type: "bool",
      },
    ],
    name: "guessSubmitted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_userAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint8",
        name: "_SNo",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_rewardsTotal",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "enum GuessLogic.guessEntryStatus",
        name: "_targetStatus",
        type: "uint8",
      },
    ],
    name: "guessVerified",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_userAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "updatedStatus",
        type: "bool",
      },
    ],
    name: "updatedPoolData",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "_tokenSize",
        type: "uint8",
      },
      {
        components: [
          {
            internalType: "uint8",
            name: "startByte",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "endByte",
            type: "uint8",
          },
          {
            internalType: "bool",
            name: "leftSkip",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "rightSkip",
            type: "bool",
          },
        ],
        internalType: "struct GuessLogic.indvBytePos",
        name: "bytePos",
        type: "tuple",
      },
      {
        internalType: "bytes32",
        name: "_hash",
        type: "bytes32",
      },
    ],
    name: "bytes32ToHexString",
    outputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "sNo",
        type: "uint8",
      },
    ],
    name: "calcRandHash",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "clearPool",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllGuessEntries",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "targetBlockNumber",
            type: "uint256",
          },
          {
            internalType: "bytes32",
            name: "userHashGuess",
            type: "bytes32",
          },
          {
            internalType: "uint8",
            name: "tokenSize",
            type: "uint8",
          },
          {
            internalType: "bool",
            name: "paidGuess",
            type: "bool",
          },
          {
            internalType: "enum GuessLogic.guessEntryStatus",
            name: "targetVerified",
            type: "uint8",
          },
          {
            internalType: "bool",
            name: "complex",
            type: "bool",
          },
        ],
        internalType: "struct GuessLogic.guessSingleEntry[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "_SNo",
        type: "uint8",
      },
    ],
    name: "getGuessEntry",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "targetBlockNumber",
            type: "uint256",
          },
          {
            internalType: "bytes32",
            name: "userHashGuess",
            type: "bytes32",
          },
          {
            internalType: "uint8",
            name: "tokenSize",
            type: "uint8",
          },
          {
            internalType: "bool",
            name: "paidGuess",
            type: "bool",
          },
          {
            internalType: "enum GuessLogic.guessEntryStatus",
            name: "targetVerified",
            type: "uint8",
          },
          {
            internalType: "bool",
            name: "complex",
            type: "bool",
          },
        ],
        internalType: "struct GuessLogic.guessSingleEntry",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "sNo",
        type: "uint8",
      },
      {
        internalType: "bytes32",
        name: "actualHashPlaced",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "_encyData",
        type: "bytes",
      },
    ],
    name: "processSearchData",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "_SNo",
        type: "uint8",
      },
      {
        internalType: "uint16",
        name: "_blockIncCount",
        type: "uint16",
      },
      {
        internalType: "bytes32",
        name: "_unrevealedGuess",
        type: "bytes32",
      },
      {
        internalType: "uint8",
        name: "_tokenSize",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "_paymentPaidBet",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "_overWrite",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "_complex",
        type: "bool",
      },
    ],
    name: "submitBlockGuess",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "syncPoolData",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "_SNo",
        type: "uint8",
      },
      {
        internalType: "bytes32",
        name: "actualHash",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "secretKey",
        type: "bytes32",
      },
      {
        internalType: "bytes[2]",
        name: "encyData",
        type: "bytes[2]",
      },
    ],
    name: "verifyBlockGuess",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
