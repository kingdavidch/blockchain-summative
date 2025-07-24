// Replace this with your deployed contract address
export const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Default Hardhat local network address

// Add other configuration constants here
export const SUPPORTED_CHAINS = {
  31337: 'Hardhat Local',
  11155111: 'Sepolia Testnet',
};

export const DEFAULT_CHAIN_ID = 31337; // Default to Hardhat local network

export const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

export const RPC_URLS: { [chainId: number]: string } = {
  31337: 'http://127.0.0.1:8545/',
  11155111: 'https://rpc.sepolia.org',
};
