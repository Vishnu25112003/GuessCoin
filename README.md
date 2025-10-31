# GuessCoin

GuessCoin is a blockchain-based guessing game built as a decentralized application (dApp) on the Polygon network. Users can predict future Ethereum block hashes using a commit-reveal scheme, with options for free or paid guesses using the GUESS ERC20 token.

## Project Overview

This project is a React-based frontend for interacting with smart contracts that implement a block hash guessing game. The game involves:

- **Commit Phase**: Users submit a commitment (hash) of their predicted block hash and a secret key.
- **Reveal Phase**: After the target block is mined, users reveal their actual guess and secret to verify if it matches the block hash.
- **Verification**: The smart contract checks if the revealed hash matches the committed hash and compares it to the actual block hash.

The application uses Web3.js for blockchain interactions, Firebase for off-chain data storage, and supports multiple wallet providers via EIP-6963.

## Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with PostCSS
- **Blockchain**: Web3.js for Ethereum/Polygon interactions
- **Backend**: Firebase Realtime Database for user data persistence
- **Notifications**: SweetAlert2 and Toastr for user feedback
- **Routing**: React Router DOM
- **Linting**: ESLint with TypeScript support

## Architecture

The application follows a modular architecture with clear separation of concerns:

- **Pages**: Top-level components representing different application screens
- **Components**: Reusable UI components
- **Services**: Business logic, API calls, and utility functions
- **Types**: TypeScript type definitions
- **ABIs**: Smart contract interfaces

### Data Flow

1. User connects wallet on WalletPage
2. SessionPage handles initial setup and contract addresses
3. HomePage displays user's guesses and allows interactions
4. NewGuessPage for creating new guesses
5. SeedDataPage for revealing and verifying guesses
6. OnChainPage for viewing blockchain data
7. MatchesPage for viewing match results

## Components

### Header (`src/components/Header.tsx`)

A navigation header component that provides:
- Breadcrumb navigation showing current page trail
- Logout functionality
- Consistent branding with the GuessCoin logo

### GuessTable (`src/components/GuessTable.tsx`)

A table component for displaying user's guesses with:
- Expandable rows showing detailed guess information
- Status badges indicating verification state
- Action buttons for creating new guesses, verifying, and checking validity
- Responsive design with gradient styling

## Services

### Ethereum Integration (`src/services/eth.ts`)

Handles smart contract interactions:
- Token contract functions (balance, transfer, approval)
- Logic contract functions (submitting guesses, syncing data)
- Read-only contracts using Infura for view calls
- Wallet provider detection and management

### Web3 Utilities (`src/services/web3.ts`)

Core game logic utilities:
- Hash generation and validation
- Hex string manipulation and comparison
- Random block hash selection for verification
- Encoding/decoding for contract calls

### Firebase (`src/services/firebase.ts`)

Real-time database configuration for storing user-specific data like actual hashes and secret keys.

### Transaction Handling (`src/services/tx.ts`)

Manages blockchain transaction sending:
- Gas fee estimation and parameter setting
- Error handling for common transaction failures
- Promise-based transaction monitoring

### Configuration (`src/services/config.ts`)

Contains network-specific constants:
- Infura RPC URL for Polygon Amoy testnet
- Token contract address

### Wallet Flow (`src/services/walletFlow.ts`)

Manages wallet connection and session state.

### Logos (`src/services/logos.ts`)

Wallet provider logos and metadata.

## Pages

### WalletPage (`src/pages/WalletPage.tsx`)

Wallet connection interface using EIP-6963 standard:
- Discovers available wallet providers
- Handles connection requests
- Redirects to session setup after successful connection

### SessionPage (`src/pages/SessionPage.tsx`)

Session initialization and contract setup:
- Loads or sets up logic contract address
- Initializes user session data

### HomePage (`src/pages/HomePage.tsx`)

Main dashboard showing:
- User's current guesses in a table
- Current block number display
- Balance checking and pool synchronization
- Navigation to other pages

### NewGuessPage (`src/pages/NewGuessPage.tsx`)

Form for creating new guesses:
- Input fields for guess parameters (block increment, token size, etc.)
- Hash generation for commitment
- Paid vs free guess options
- Validation and submission to blockchain

### SeedDataPage (`src/pages/SeedDataPage.tsx`)

Reveal phase interface:
- Input actual hash and secret key
- Verify against committed hash
- Submit reveal transaction

### OnChainPage (`src/pages/OnChainPage.tsx`)

Blockchain data viewer:
- Displays on-chain guess entries
- Contract state information

### MatchesPage (`src/pages/MatchesPage.tsx`)

Match results display:
- Shows successful matches between guesses and block hashes
- Scoring and ranking information

## Game Mechanics

### Guess Creation

1. User selects a guess ID (1-5)
2. Specifies block increment count (10-2048 blocks ahead)
3. Sets token size (3-64 characters for matching)
4. Chooses paid ($25 GUESS) or free guess
5. Generates actual hash and secret key
6. Commits dummy hash (keccak256(actual_hash + secret_key)) to blockchain

### Verification Process

1. Wait for target block to be mined
2. Reveal actual hash and secret key
3. Contract verifies commitment matches reveal
4. Compares revealed hash to actual block hash using token matching algorithm
5. Awards points/tokens based on match quality

### Token Matching

The game uses a sophisticated hex string matching algorithm:
- Splits block hash into tokens of specified size
- Finds matching token sequences between guess and actual hash
- Encodes match positions for on-chain verification
- Supports complex matching modes for advanced gameplay

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

4. Preview production build:
   ```bash
   npm run preview
   ```

## Environment Setup

- Requires MetaMask or compatible wallet
- Connected to Polygon Amoy testnet
- Needs GUESS tokens for paid guesses
- Firebase configuration for data persistence

## Smart Contracts

- **Token Contract**: ERC20 token implementation for GUESS currency
- **Logic Contract**: Main game logic for guess submission and verification

Contract ABIs are stored in `src/abi/` directory.

## Development Notes

- Uses localStorage for session management
- Implements commit-reveal scheme to prevent front-running
- Supports multiple wallet providers via EIP-6963
- Responsive design with mobile-first approach
- TypeScript for type safety throughout the application





---

## Detailed Function Documentation

### Core Service Functions

#### **web3.ts** - Web3 Utilities and Blockchain Operations

**`npInfura`** - Web3 instance connected to Polygon Amoy testnet via Infura for read-only operations.

**`isValidChar(hexStr: string): boolean`**
- Validates if a string is a valid 64-character hexadecimal hash
- Returns true if the string matches the pattern `[0-9a-fA-F]{64}`
- Used to ensure proper hash format before processing

**`removePrefix(hexStr: string): string`**
- Removes '0x' prefix from hexadecimal strings
- Returns the hex string without prefix, or original if no prefix exists
- Essential for standardizing hex string formats

**`tokenize(hexStr: string, tokenSize: number): string[]`**
- Breaks a hexadecimal string into overlapping substrings (tokens) of specified size
- Creates sliding window tokens for pattern matching
- Returns array of all possible token sequences from the input hex string

**`encodeMatch(hitHex1: {...}, hitHex2: {...}): string`**
- Encodes two matching token positions into ABI-encoded format
- Parameters include startByte, endByte, leftSkip, and rightSkip for each match
- Returns encoded string ready for smart contract verification
- Used to submit match proofs on-chain

**`safeKeccak(value: string): string`**
- Safely computes Keccak-256 hash with error handling
- Falls back to UTF-8 encoding if direct hashing fails
- Returns 32-byte hash string with '0x' prefix

**`genHashData(entValue: string): string`**
- Generates Keccak-256 hash from input value
- Wrapper around safeKeccak for consistent hash generation
- Used for creating commitment hashes

**`ensure0x(hex: string): string`**
- Ensures hexadecimal string has '0x' prefix
- Adds prefix if missing, returns as-is if present
- Standardizes hex string formatting

**`toBytes32FromInput(value: string): string`**
- Converts user input to 32-byte hex string
- If input is already valid 64-char hex, returns it with '0x' prefix
- Otherwise, computes Keccak-256 hash of the input
- Used for processing user-entered hashes or secrets

**`getUnrevealedHash(actualHash: string, secretKey: string): string`**
- Creates commitment hash using actual hash and secret key
- Implements commit-reveal scheme: Hash = keccak256(actualHash, secretKey)
- Both inputs must be 0x-prefixed 32-byte hex strings
- Returns commitment hash for on-chain storage

**`randomBytes32(): string`**
- Generates cryptographically secure random 32-byte hex string
- Uses crypto.getRandomValues() if available, falls back to Math.random()
- Returns random hash with '0x' prefix
- Used for generating secret keys

**`getRandomBlockHash(seedHash: string, targetBlockNumber: number): Promise<[...]>`**
- Fetches a random historical block hash for verification
- Uses last 2 bytes of seedHash to determine block position offset
- Calculates: randomBlockNumber = targetBlockNumber - offset
- Returns tuple: [blockHash, byteHex, adjustedOffset, randomBlockNumber]
- Implements randomized block selection to prevent predictability

**`compareHexValues(hex1: string, hex2: string, tokenSize: number): Promise<MatchToken[]>`**
- Compares two hex strings and finds all matching token sequences
- Validates both hashes are 64-char hex and tokenSize is 3-64
- Tokenizes both hashes and finds matching tokens with positions
- Returns array of match objects with token, positions in both hashes, and encoded data
- Core algorithm for game verification and scoring

---

#### **eth.ts** - Ethereum Contract Integration

**`getBrowserWallet(): WalletProvider | null`**
- Retrieves wallet provider from browser
- Checks for selectedWallet (EIP-6963) or ethereum (legacy) object
- Returns wallet provider or null if not found

**`getChainId(web3: Web3): Promise<number>`**
- Gets current blockchain network chain ID
- Returns numeric chain ID (137 for Polygon, 80002 for Amoy testnet)

**`getTokenContract(web3: Web3)`**
- Creates Token contract instance with write capabilities
- Uses provided Web3 instance (connected to user's wallet)
- Returns contract object for token operations

**`getLogicContract(web3: Web3, logicAddress: string)`**
- Creates Logic contract instance for game operations
- Takes user-specific logic contract address
- Returns contract object for guess submission and verification

**`getTokenContractReadonly()`**
- Creates read-only Token contract via Infura
- Avoids MetaMask RPC indexing issues on view calls
- Used for balance checks and state queries

**`getLogicContractReadonly(logicAddress: string)`**
- Creates read-only Logic contract via Infura
- Returns contract for querying guess data without wallet interaction

---

#### **walletFlow.ts** - Authentication and Registration

**`getBrowserWeb3(): Web3`**
- Creates Web3 instance from browser wallet provider
- Throws error if no wallet detected
- Returns Web3 object for transaction signing

**`ensureNetwork(): Promise<boolean>`**
- Verifies user is on correct blockchain network
- Accepts Polygon mainnet (137) or Amoy testnet (80002)
- Returns true if on correct network, false otherwise

**`isUserActive(account: string): Promise<boolean>`**
- Checks if wallet address is registered in the system
- Calls smart contract's isUserActive() method
- Returns boolean indicating registration status

**`getLogicAddress(account: string): Promise<string>`**
- Retrieves user's personal logic contract address
- Each user has unique logic contract for game state
- Returns contract address as hex string

**`login(): Promise<LoginResult>`**
- Authenticates existing user wallet
- Steps: Check network → Request accounts → Verify registration → Get logic address
- Stores account, logic address, and auth flag in localStorage
- Returns {ok: true, logicCrtAddress} on success or {ok: false, error} on failure

**`register(): Promise<LoginResult>`**
- Registers new user wallet in the system
- If already registered, performs login instead
- Calls createUser() on token contract to deploy personal logic contract
- Stores session data in localStorage
- Returns LoginResult with success/error status

---

#### **tx.ts** - Transaction Management

**`isGasFeeError(e: unknown): boolean`**
- Detects gas-related transaction errors
- Checks error codes and messages for gas fee issues
- Returns true if error is gas-related (underpriced, insufficient funds, etc.)

**`getFeeParams(web3: Web3): Promise<Record<string, string>>`**
- Calculates optimal gas fee parameters for transactions
- For EIP-1559: Returns maxPriorityFeePerGas (30 gwei) and maxFeePerGas (2x baseFee + priority)
- For legacy: Returns gasPrice from network
- Adapts to network capabilities automatically

**`estimateGasWithBuffer(method: unknown, params: TxSendOpts): Promise<string | undefined>`**
- Estimates gas required for transaction with 20% safety buffer
- Calls contract method's estimateGas function
- Returns gas limit as string or undefined if estimation fails

**`sendWithFees(web3: Web3, method: unknown, params: TxSendOpts, handlers?: {...}): Promise<void>`**
- Sends blockchain transaction with optimized gas parameters
- Automatically estimates gas and sets fee parameters
- Provides callbacks: onHash (when tx submitted), onReceipt (when confirmed)
- Returns promise that resolves on receipt or rejects on error
- Core function for all blockchain write operations

---

#### **config.ts** - Configuration Constants

**`INFURA_HTTP_URL`**
- Infura RPC endpoint for Polygon Amoy testnet
- Used for read-only blockchain queries
- Provides reliable access without wallet dependency

**`TOKEN_CONTRACT_ADDRESS`**
- Deployed address of GUESS ERC20 token contract
- Constant across all users
- Used for token balance and transfer operations

---

#### **firebase.ts** - Database Setup

**`firebaseConfig`**
- Firebase project configuration object
- Contains API keys, database URL, and project settings
- Connects to Asia Southeast realtime database

**`app`**
- Initialized Firebase application instance
- Created from firebaseConfig

**`database`**
- Firebase Realtime Database reference
- Exported for use throughout application
- Stores user's actual hashes and secret keys off-chain

---

#### **logos.ts** - Wallet Provider Metadata

**`logos`**
- Object mapping wallet names to logo URLs
- Contains 15+ popular wallet providers (MetaMask, Coinbase, Trust, etc.)
- Used in WalletPage for visual wallet selection

---

### Type Definitions (types.ts)

**`GuessEntry`**
- Core data structure for user guesses
- Fields: guessId, targetBlockNumber, userHashGuess, tokenSize, paidGuess, targetVerified, complex, actualHash, secretKey
- Represents both on-chain and off-chain guess data

**`MatchToken`**
- Structure for token match results
- Contains: matching token string, positions in both hashes (with byte-level precision), encoded proof
- Used in compareHexValues results

**`ContractGuessEntry`**
- On-chain representation of GuessEntry
- Numeric fields are strings as returned by smart contract
- Used when fetching data from blockchain

**`RTDBEntry`**
- Firebase database entry structure
- Stores sensitive data: actualHash, secretKey
- Kept off-chain for security during commit phase

**`EIP6963ProviderInfo` & `EIP6963ProviderDetail`**
- Standards-compliant wallet provider metadata
- Used for multi-wallet detection and connection
- Implements EIP-6963 wallet discovery specification

---

### Application Flow Functions

#### **App.tsx** - Routing Configuration

**`App()`**
- Main application component with React Router setup
- Defines 7 routes: WalletPage (/), SessionPage (/session), HomePage (/home), SeedDataPage (/seed), MatchesPage (/matches), NewGuessPage (/new), OnChainPage (/onchain)
- Redirects unknown routes to wallet connection page

#### **main.tsx** - Application Entry Point

**`createRoot().render()`**
- Initializes React application in StrictMode
- Mounts App component to DOM element with id='root'
- Entry point for entire application

#### **Header.tsx** - Navigation Component

**`Header({ trail, onLogout }: Props)`**
- Renders top navigation bar with breadcrumb trail
- Props: trail (array of navigation links), onLogout (logout callback)
- Displays GuessCoin logo, breadcrumb navigation, and logout button
- Sticky header with gradient accent and backdrop blur

---

## File Structure Summary

### Core Application Files
- **App.tsx** - Main React application with routing setup
- **main.tsx** - Application entry point and root render
- **types.ts** - TypeScript type definitions for GuessEntry, MatchToken, and EIP-6963 types

### Pages (User Interface Screens)
- **HomePage.tsx** - Main dashboard with guess entries table
- **WalletPage.tsx** - Multi-wallet connection interface (EIP-6963)
- **SessionPage.tsx** - Login/Registration page
- **NewGuessPage.tsx** - Create new guess entries
- **SeedDataPage.tsx** - Reveal phase and block hash verification
- **MatchesPage.tsx** - Display matching token results
- **OnChainPage.tsx** - On-chain data verification interface

### Components (Reusable UI)
- **Header.tsx** - Navigation header with breadcrumbs and logout
- **GuessTable.tsx** - Table displaying guess entries with expandable rows

### Services (Business Logic)
- **web3.ts** - Web3 utilities (hashing, tokenization, hex comparison)
- **walletFlow.ts** - Wallet authentication (login/register flows)
- **eth.ts** - Contract instances and blockchain helpers
- **tx.ts** - Transaction handling with gas optimization
- **config.ts** - Network configuration (Infura URL, contract addresses)
- **firebase.ts** - Firebase Realtime Database setup
- **logos.ts** - Wallet provider logos and metadata

### Smart Contract ABIs
- **TokenCrt.json** - Token contract ABI for GUESS ERC20
- **LogicCrt.json** - Logic contract ABI for game mechanics
